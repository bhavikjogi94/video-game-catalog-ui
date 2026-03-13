import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VideoGame, CreateUpdateVideoGame, PagedResult, GameQuery } from '../../models/video-game.model';

/**
 * Data-access service for the /api/games endpoints.
 * Components never call HttpClient directly — they always go through this service.
 */
@Injectable({ providedIn: 'root' })
export class GamesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/games`;

  /** GET /api/games — server-side paged, filtered, and sorted */
  getAll(query: GameQuery): Observable<PagedResult<VideoGame>> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('pageSize', query.pageSize.toString());

    if (query.search) params = params.set('search', query.search);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortDir) params = params.set('sortDir', query.sortDir);

    return this.http.get<PagedResult<VideoGame>>(this.apiUrl, { params });
  }


  /** GET /api/games/:id — returns one game, or 404 if not found */
  getById(id: number): Observable<VideoGame> {
    return this.http.get<VideoGame>(`${this.apiUrl}/${id}`);
  }

  /** POST /api/games — creates a new game, returns the saved entity with its assigned id */
  create(dto: CreateUpdateVideoGame): Observable<VideoGame> {
    return this.http.post<VideoGame>(this.apiUrl, dto);
  }

  /** PUT /api/games/:id — updates an existing game, returns the updated entity */
  update(id: number, dto: CreateUpdateVideoGame): Observable<VideoGame> {
    return this.http.put<VideoGame>(`${this.apiUrl}/${id}`, dto);
  }

  /** DELETE /api/games/:id — deletes a game, returns no content */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
