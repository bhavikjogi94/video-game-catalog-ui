import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre } from '../../models/genre.model';

/**
 * Data-access service for the read-only /api/genres endpoint.
 * Used to populate the Genre dropdown on the edit form.
 */
@Injectable({ providedIn: 'root' })
export class GenresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/genres`;

  /** GET /api/genres — returns all genres ordered alphabetically */
  getAll(): Observable<Genre[]> {
    return this.http.get<Genre[]>(this.apiUrl);
  }
}
