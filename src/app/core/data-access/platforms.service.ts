import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Platform } from '../../models/platform.model';

/**
 * Data-access service for the read-only /api/platforms endpoint.
 * Used to populate the Platform dropdown on the edit form.
 */
@Injectable({ providedIn: 'root' })
export class PlatformsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/platforms`;

  /** GET /api/platforms — returns all platforms ordered alphabetically */
  getAll(): Observable<Platform[]> {
    return this.http.get<Platform[]>(this.apiUrl);
  }
}
