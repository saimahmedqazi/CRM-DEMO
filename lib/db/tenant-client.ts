import { type UserRole } from "@/lib/auth/rbac";

export interface TenantContext {
  userId: string;
  organizationId: string;
  role: UserRole;
}

export interface DatabaseRecord {
  id: string;
  organization_id: string;
  [key: string]: any;
}

/**
 * TenantQuerySimulator
 * Implements the exact relational model and PostgreSQL Row-Level Security (RLS) policies
 * to execute penetration tests verifying that cross-tenant access is impossible.
 */
export class TenantDatabaseSimulator {
  private tables: Record<string, DatabaseRecord[]> = {
    organizations: [],
    organization_members: [],
    locations: [],
    contacts: [],
    inquiries: [],
    tasks: [],
    appointments: [],
  };

  public seed(table: string, records: DatabaseRecord[]) {
    this.tables[table] = [...records];
  }

  public getTable(table: string): DatabaseRecord[] {
    return this.tables[table] || [];
  }

  /**
   * Evaluates PostgreSQL Row-Level Security (RLS) for the current authenticated user context.
   * Simulates:
   * USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = [table].organization_id AND om.user_id = auth.uid()))
   */
  private applyRLS(table: string, context: TenantContext, operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE"): DatabaseRecord[] {
    const records = this.tables[table] || [];

    // Verify user is an active member of their claimed organization
    const membership = (this.tables["organization_members"] || []).find(
      (m) => m.organization_id === context.organizationId && m.user_id === context.userId
    );

    if (!membership) {
      // User is not a member of the claimed organization: 0 rows accessible
      return [];
    }

    // Engine filters to only records matching authenticated membership organization_id
    return records.filter((r) => r.organization_id === context.organizationId);
  }

  public select(
    table: string,
    context: TenantContext,
    filter?: (r: DatabaseRecord) => boolean
  ): DatabaseRecord[] {
    const visibleRecords = this.applyRLS(table, context, "SELECT");
    if (!filter) return visibleRecords;
    return visibleRecords.filter(filter);
  }

  public insert(
    table: string,
    context: TenantContext,
    record: DatabaseRecord
  ): { success: boolean; data?: DatabaseRecord; error?: string } {
    // RLS WITH CHECK (organization_id = auth.current_org_id())
    if (record.organization_id !== context.organizationId) {
      return { success: false, error: "RLS Policy Violation: Cannot insert record into another organization" };
    }

    const membership = (this.tables["organization_members"] || []).find(
      (m) => m.organization_id === context.organizationId && m.user_id === context.userId
    );

    if (!membership) {
      return { success: false, error: "Unauthorized: User not in organization" };
    }

    this.tables[table].push(record);
    return { success: true, data: record };
  }

  public update(
    table: string,
    context: TenantContext,
    id: string,
    updates: Partial<DatabaseRecord>
  ): { updatedCount: number } {
    const visibleRecords = this.applyRLS(table, context, "UPDATE");
    const target = visibleRecords.find((r) => r.id === id);

    if (!target) {
      // Record either does not exist OR belongs to another tenant (RLS hidden)
      return { updatedCount: 0 };
    }

    // Prevent changing organization_id (tenant hopping attack)
    if (updates.organization_id && updates.organization_id !== context.organizationId) {
      return { updatedCount: 0 };
    }

    Object.assign(target, updates);
    return { updatedCount: 1 };
  }

  public delete(
    table: string,
    context: TenantContext,
    id: string
  ): { deletedCount: number } {
    const visibleRecords = this.applyRLS(table, context, "DELETE");
    const targetIndex = visibleRecords.findIndex((r) => r.id === id);

    if (targetIndex === -1) {
      return { deletedCount: 0 };
    }

    const globalIndex = this.tables[table].findIndex((r) => r.id === id);
    if (globalIndex !== -1) {
      this.tables[table].splice(globalIndex, 1);
      return { deletedCount: 1 };
    }

    return { deletedCount: 0 };
  }
}
