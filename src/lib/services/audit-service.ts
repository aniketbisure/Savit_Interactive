import { prisma, isDatabaseReachable } from '../db';
import { Prisma } from '@prisma/client';

export interface StoredAudit {
  id: string;
  primaryUrl: string;
  competitorUrl1: string | null;
  competitorUrl2: string | null;
  industry: string | null;
  targetAudience: string | null;
  serviceProduct: string | null;
  auditObjective: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  overallScore: number | null;
  seoScore: number | null;
  uxScore: number | null;
  extractedData: any;
  seoFindings: any;
  uxFindings: any;
  competitorData: any;
  aiReport: any;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory cache fallback for resilient zero-config execution
const memoryStore = new Map<string, StoredAudit>();

export async function createAuditRecord(data: {
  primaryUrl: string;
  competitorUrl1?: string | null;
  competitorUrl2?: string | null;
  industry?: string | null;
  targetAudience?: string | null;
  serviceProduct?: string | null;
  auditObjective?: string | null;
}): Promise<StoredAudit> {
  const newAudit: StoredAudit = {
    id: crypto.randomUUID(),
    primaryUrl: data.primaryUrl,
    competitorUrl1: data.competitorUrl1 || null,
    competitorUrl2: data.competitorUrl2 || null,
    industry: data.industry || null,
    targetAudience: data.targetAudience || null,
    serviceProduct: data.serviceProduct || null,
    auditObjective: data.auditObjective || null,
    status: 'PROCESSING',
    errorMessage: null,
    overallScore: null,
    seoScore: null,
    uxScore: null,
    extractedData: null,
    seoFindings: null,
    uxFindings: null,
    competitorData: null,
    aiReport: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (prisma && (await isDatabaseReachable())) {
    try {
      const record = await prisma.audit.create({
        data: {
          id: newAudit.id,
          primaryUrl: newAudit.primaryUrl,
          competitorUrl1: newAudit.competitorUrl1,
          competitorUrl2: newAudit.competitorUrl2,
          industry: newAudit.industry,
          targetAudience: newAudit.targetAudience,
          serviceProduct: newAudit.serviceProduct,
          auditObjective: newAudit.auditObjective,
          status: newAudit.status,
        },
      });
      return record as unknown as StoredAudit;
    } catch {
      // Fall through to memoryStore
    }
  }

  memoryStore.set(newAudit.id, newAudit);
  return newAudit;
}

export async function updateAuditRecord(
  id: string,
  updates: Partial<StoredAudit>
): Promise<StoredAudit | null> {
  const updatedDate = new Date();

  if (prisma && (await isDatabaseReachable())) {
    try {
      const record = await prisma.audit.update({
        where: { id },
        data: {
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.errorMessage !== undefined ? { errorMessage: updates.errorMessage } : {}),
          ...(updates.overallScore !== undefined ? { overallScore: updates.overallScore } : {}),
          ...(updates.seoScore !== undefined ? { seoScore: updates.seoScore } : {}),
          ...(updates.uxScore !== undefined ? { uxScore: updates.uxScore } : {}),
          ...(updates.extractedData !== undefined ? { extractedData: updates.extractedData as Prisma.InputJsonValue } : {}),
          ...(updates.seoFindings !== undefined ? { seoFindings: updates.seoFindings as Prisma.InputJsonValue } : {}),
          ...(updates.uxFindings !== undefined ? { uxFindings: updates.uxFindings as Prisma.InputJsonValue } : {}),
          ...(updates.competitorData !== undefined ? { competitorData: updates.competitorData as Prisma.InputJsonValue } : {}),
          ...(updates.aiReport !== undefined ? { aiReport: updates.aiReport as Prisma.InputJsonValue } : {}),
        },
      });
      return record as unknown as StoredAudit;
    } catch {
      // Fall through to memoryStore
    }
  }

  const existing = memoryStore.get(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates, updatedAt: updatedDate };
  memoryStore.set(id, merged);
  return merged;
}

export async function getAuditById(id: string): Promise<StoredAudit | null> {
  if (prisma && (await isDatabaseReachable())) {
    try {
      const record = await prisma.audit.findUnique({
        where: { id },
      });
      if (record) return record as unknown as StoredAudit;
    } catch {
      // Fall through to memoryStore
    }
  }

  return memoryStore.get(id) || null;
}

export async function listAudits(): Promise<StoredAudit[]> {
  if (prisma && (await isDatabaseReachable())) {
    try {
      const records = await prisma.audit.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      if (records && records.length > 0) return records as unknown as StoredAudit[];
    } catch {
      // Fall through to memoryStore
    }
  }

  return Array.from(memoryStore.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function deleteAuditRecord(id: string): Promise<boolean> {
  let deleted = false;
  if (prisma && (await isDatabaseReachable())) {
    try {
      await prisma.audit.delete({ where: { id } });
      deleted = true;
    } catch {
      // Ignore
    }
  }
  if (memoryStore.has(id)) {
    memoryStore.delete(id);
    deleted = true;
  }
  return deleted;
}
