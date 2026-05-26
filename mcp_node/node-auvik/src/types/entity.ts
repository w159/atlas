export interface EntityNote {
  id: string;
  noteId?: string;
  noteText?: string;
  entityId?: string;
  entityType?: string;
  createdBy?: string;
  createdDate?: string;
  lastModified?: string;
}

export interface EntityAudit {
  id: string;
  auditId?: string;
  entityId?: string;
  entityType?: string;
  action?: string;
  actionDate?: string;
  actionBy?: string;
  details?: Record<string, unknown>;
  changeSet?: {
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }[];
}