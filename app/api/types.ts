export interface IResponse<T> {
  data: T[];
  count: number;
  csvData?: T[];
}
