/** Mirrors VideoGameDto from the API response */
export interface VideoGame {
  id: number;
  title: string;
  developer: string;
  releaseYear: number;
  description?: string;
  genreId: number;
  genreName: string;
  platformId: number;
  platformName: string;
}

/** Mirrors CreateUpdateVideoGameDto sent in POST / PUT requests */
export interface CreateUpdateVideoGame {
  title: string;
  developer: string;
  releaseYear: number;
  description?: string;
  genreId: number;
  platformId: number;
}

/** Mirrors PagedResultDto<T> returned by GET /api/games */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Query parameters sent to GET /api/games */
export interface GameQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}

