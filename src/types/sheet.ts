export interface SheetMetadata {
  id: string;
  name: string;
  headers: string[];
  path: string;
  department: string;
}

export interface IndexSheet {
  departments: string[];
  sheets: SheetMetadata[];
}

export interface QueryOptions {
  filters?: Record<string, any>;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface ComplexQueryOptions {
  filters?: Record<string, any>;
  sort?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  pagination?: {
    limit: number;
    offset: number;
  };
}