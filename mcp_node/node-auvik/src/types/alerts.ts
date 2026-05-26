export interface AlertHistory {
  id: string;
  alertType?: string;
  alertState?: 'active' | 'acknowledged' | 'dismissed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  subject?: string;
  description?: string;
  createdDate?: string;
  resolvedDate?: string;
  acknowledgedDate?: string;
  dismissedDate?: string;
  acknowledgedBy?: string;
  dismissedBy?: string;
  entityId?: string;
  entityName?: string;
  entityType?: string;
  tenantId?: string;
}

export interface DismissAlertRequest {
  reason?: string;
}