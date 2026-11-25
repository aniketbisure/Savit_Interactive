import { z } from 'zod';

const URL_REGEX = /^https?:\/\//i;

function isValidWebUrl(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  try {
    const urlToParse = URL_REGEX.test(val) ? val : `https://${val}`;
    const parsed = new URL(urlToParse);
    
    // Reject dangerous schemes and embedded credentials
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    if (!parsed.hostname || parsed.hostname.includes(' ')) return false;

    return true;
  } catch {
    return false;
  }
}

export const CreateAuditSchema = z.object({
  primaryUrl: z
    .string()
    .trim()
    .min(1, 'Primary website URL is required')
    .max(2048, 'URL exceeds maximum allowable length of 2048 characters')
    .refine(isValidWebUrl, 'Invalid primary website URL or unsupported format'),
  competitorUrl1: z
    .string()
    .trim()
    .max(2048, 'URL exceeds maximum allowable length of 2048 characters')
    .optional()
    .refine((val) => !val || val.trim() === '' || isValidWebUrl(val), 'Invalid Competitor 1 URL'),
  competitorUrl2: z
    .string()
    .trim()
    .max(2048, 'URL exceeds maximum allowable length of 2048 characters')
    .optional()
    .refine((val) => !val || val.trim() === '' || isValidWebUrl(val), 'Invalid Competitor 2 URL'),
  industry: z.string().trim().max(300, 'Industry must be 300 characters or fewer').optional(),
  targetAudience: z.string().trim().max(500, 'Target Audience must be 500 characters or fewer').optional(),
  serviceProduct: z.string().trim().max(500, 'Core Offering must be 500 characters or fewer').optional(),
  auditObjective: z.string().trim().max(1000, 'Audit Objective must be 1000 characters or fewer').optional(),
});

export const UuidParamSchema = z.string().uuid('Invalid audit record UUID format');

export type CreateAuditInput = z.infer<typeof CreateAuditSchema>;
