export type MasterGroup = 'location' | 'property' | 'crm' | 'organization' | 'content';

export interface MasterItem {
  _id: string;
  type: string;
  group: MasterGroup;
  code: string;
  name: string;
  nameTa?: string;
  description?: string;
  parentCode?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  isSystem?: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterGroupSummary {
  group: MasterGroup;
  type: string;
  totalCount: number;
  activeCount: number;
}

export interface MasterUsageReport {
  code: string;
  name: string;
  type: string;
  isSystem: boolean;
  totalUsage: number;
  references: {
    properties: number;
    leads: number;
    siteVisits: number;
    bookings: number;
    employees: number;
    childMasters: number;
  };
}

export interface WebContentSection {
  _id: string;
  section: string;
  title: string;
  titleTa?: string;
  subtitle?: string;
  subtitleTa?: string;
  content: Record<string, any>;
  draftContent: Record<string, any>;
  status: 'draft' | 'published';
  version: number;
  publishedAt?: string;
  updatedAt?: string;
}

