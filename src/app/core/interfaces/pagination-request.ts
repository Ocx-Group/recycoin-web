export interface PaginationRequest {
  pageSize: number;
  pageNumber: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
