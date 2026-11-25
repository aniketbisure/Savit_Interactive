import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

export interface SSRFValidationResult {
  isSafe: boolean;
  reason?: string;
  normalizedUrl?: string;
  ip?: string;
}

const ALLOWED_PORTS = new Set(['', '80', '443', '8080', '8443', '3000']);

/**
 * Validates a target URL against SSRF (Server-Side Request Forgery) vulnerabilities:
 * 1. Ensures scheme is strictly http: or https:
 * 2. Restricts target ports to approved public web ports (prevents probing Redis, SSH, SMTP, DBs)
 * 3. Strips / rejects embedded basic-auth credentials
 * 4. Resolves domain through DNS
 * 5. Checks resolved IP address against RFC 1918, loopback, link-local, carrier-grade NAT, cloud metadata
 */
export async function validateUrlForSSRF(rawUrl: string): Promise<SSRFValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isSafe: false, reason: 'URL must be a non-empty string.' };
  }

  let parsed: URL;
  try {
    let urlToParse = rawUrl.trim();
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
      urlToParse = `https://${urlToParse}`;
    }
    parsed = new URL(urlToParse);
  } catch {
    return { isSafe: false, reason: 'Invalid URL format.' };
  }

  // 1. Protocol validation: strictly http or https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isSafe: false, reason: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.` };
  }

  // 2. Reject embedded userinfo (credentials)
  if (parsed.username || parsed.password) {
    return { isSafe: false, reason: 'Embedded credentials in URL are prohibited.' };
  }

  // 3. Port validation: block internal port probing
  if (parsed.port && !ALLOWED_PORTS.has(parsed.port)) {
    return {
      isSafe: false,
      reason: `Port "${parsed.port}" is not permitted. Only standard web ports (80, 443, 8080, 8443) are allowed.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 4. Block localhost & internal domain suffixes
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.home.arpa')
  ) {
    return { isSafe: false, reason: 'Localhost and internal local domains are blocked for security.' };
  }

  // 5. Resolve hostname via DNS
  try {
    const lookupResults = await dns.lookup(hostname, { all: true });
    if (!lookupResults || lookupResults.length === 0) {
      return { isSafe: false, reason: `Unable to resolve host: ${hostname}` };
    }

    for (const record of lookupResults) {
      const address = record.address;

      let parsedIp: ipaddr.IPv4 | ipaddr.IPv6;
      try {
        parsedIp = ipaddr.parse(address);
      } catch {
        return { isSafe: false, reason: `Invalid IP address resolved: ${address}` };
      }

      const range = parsedIp.range();

      // Block dangerous IP ranges
      // For IPv4: 'loopback', 'private', 'linkLocal', 'carrierGradeNat', 'broadcast', 'reserved', 'unspecified'
      // For IPv6: 'loopback', 'uniqueLocal', 'linkLocal', 'reserved', 'unspecified'
      const blockedRanges = [
        'loopback', // 127.0.0.0/8, ::1
        'private', // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
        'linkLocal', // 169.254.0.0/16 (includes cloud metadata 169.254.169.254)
        'uniqueLocal', // fc00::/7
        'carrierGradeNat', // 100.64.0.0/10
        'broadcast',
        'reserved',
        'unspecified', // 0.0.0.0, ::
      ];

      if (blockedRanges.includes(range)) {
        return {
          isSafe: false,
          reason: `Resolved IP (${address}) belongs to restricted range "${range}". Access prohibited.`,
          ip: address,
        };
      }

      // Explicit check for AWS/GCP/Azure metadata IP: 169.254.169.254
      if (address === '169.254.169.254') {
        return { isSafe: false, reason: 'Cloud metadata IP access prohibited.', ip: address };
      }
    }

    return {
      isSafe: true,
      normalizedUrl: parsed.toString(),
      ip: lookupResults[0].address,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'DNS lookup failed';
    // EAI_AGAIN = temporary DNS failure (not an SSRF attack — rethrow as network error)
    // ENOTFOUND = domain doesn't exist (genuinely unresolvable)
    // Other DNS errors = transient network issues
    const isTransient =
      errorMsg.includes('EAI_AGAIN') ||
      errorMsg.includes('ETIMEDOUT') ||
      errorMsg.includes('EAI_NODATA');
    if (isTransient) {
      // Surface as a network error so callers can handle retries / soft-fail competitors
      throw new Error(`DNS temporarily unavailable for ${hostname}: ${errorMsg}`);
    }
    return { isSafe: false, reason: `DNS lookup error: ${errorMsg}` };
  }
}
