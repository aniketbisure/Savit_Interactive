import { NextRequest, NextResponse } from 'next/server';
import { getAuditById, deleteAuditRecord } from '@/lib/services/audit-service';
import { UuidParamSchema } from '@/lib/validations/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = UuidParamSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid audit UUID format' },
        { status: 400 }
      );
    }

    const audit = await getAuditById(validation.data);

    if (!audit) {
      return NextResponse.json(
        { success: false, error: 'Audit record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: audit });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error fetching audit record';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = UuidParamSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid audit UUID format' },
        { status: 400 }
      );
    }

    const deleted = await deleteAuditRecord(validation.data);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Audit not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Audit deleted successfully' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error deleting audit';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
