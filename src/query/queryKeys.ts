export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.properties.lists(), filters] as const,
    mapMarkers: (filters: Record<string, any>) => [...queryKeys.properties.all, 'markers', filters] as const,
    details: () => [...queryKeys.properties.all, 'detail'] as const,
    detail: (idOrSlug: string) => [...queryKeys.properties.details(), idOrSlug] as const,
    sellerMine: (scope = 'self') => [...queryKeys.properties.all, 'seller', 'mine', scope] as const,
    sellerDetail: (idOrSlug: string, scope = 'self') => [...queryKeys.properties.all, 'seller', idOrSlug, scope] as const,
    adminDetail: (idOrSlug: string) => [...queryKeys.properties.all, 'admin', idOrSlug] as const,
    adminList: (filters: Record<string, any>) => [...queryKeys.properties.all, 'admin', 'list', filters] as const,
  },
  geo: {
    all: ['geo'] as const,
    places: (lat: number, lng: number, category: string, radius: number) =>
      [...queryKeys.geo.all, 'places', lat, lng, category, radius] as const,
    routing: (from: string, to: string, mode: string) =>
      [...queryKeys.geo.all, 'routing', from, to, mode] as const,
  },
  masters: {
    all: ['masters'] as const,
    publicAll: () => [...queryKeys.masters.all, 'public'] as const,
    publicBatch: (types: string[]) => [...queryKeys.masters.publicAll(), 'batch', types.sort().join(',')] as const,
    type: (type: string, query?: Record<string, any>) => [...queryKeys.masters.all, 'type', type, query || {}] as const,
    usage: (type: string, id: string) => [...queryKeys.masters.all, 'usage', type, id] as const,
    migrationReport: () => [...queryKeys.masters.all, 'migrationReport'] as const,
  },
  content: {
    all: ['content'] as const,
    publicAll: () => [...queryKeys.content.all, 'public'] as const,
    publicSection: (section: string) => [...queryKeys.content.publicAll(), section] as const,
    adminAll: () => [...queryKeys.content.all, 'admin'] as const,
    adminSection: (section: string) => [...queryKeys.content.adminAll(), section] as const,
  },
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters?: Record<string, any>, scope = 'user') => [...queryKeys.leads.lists(), filters || {}, scope] as const,
    detail: (id: string, scope = 'user') => [...queryKeys.leads.all, 'detail', id, scope] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (scope = 'user') => [...queryKeys.bookings.all, 'list', scope] as const,
  },
  siteVisits: {
    all: ['siteVisits'] as const,
    list: (scope = 'user') => [...queryKeys.siteVisits.all, 'list', scope] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (filters?: Record<string, any>, scope = 'user') => [...queryKeys.tasks.all, 'list', filters || {}, scope] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (scope = 'user') => [...queryKeys.customers.all, 'list', scope] as const,
  },
  team: {
    all: ['team'] as const,
    list: (scope = 'user') => [...queryKeys.team.all, 'list', scope] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: () => [...queryKeys.projects.all, 'list'] as const,
  },
  developers: {
    all: ['developers'] as const,
    list: () => [...queryKeys.developers.all, 'list'] as const,
  },
  reports: {
    all: ['reports'] as const,
    summary: () => [...queryKeys.reports.all, 'summary'] as const,
  },
  auditLogs: {
    all: ['auditLogs'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.auditLogs.all, 'list', filters || {}] as const,
  },
  settings: {
    all: ['settings'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => [...queryKeys.notifications.all, 'list'] as const,
  },
};

