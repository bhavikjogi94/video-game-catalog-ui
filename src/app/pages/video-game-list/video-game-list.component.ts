import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GamesService } from '../../core/data-access/games.service';
import { VideoGame, GameQuery } from '../../models/video-game.model';

/**
 * Video Game List Page — the application's home route (/games).
 * Eagerly loaded since it is the landing page.
 *
 * All filtering, sorting, and paging is done server-side.
 * ChangeDetectionStrategy.OnPush is required for zoneless change detection
 * (provideZonelessChangeDetection) to re-render the view after HTTP responses.
 */
@Component({
  selector: 'app-video-game-list',
  standalone: true,
  imports: [NgbPagination],
  templateUrl: './video-game-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGameListComponent implements OnInit {
  private readonly gamesService = inject(GamesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // ── Signals (reactive state) ────────────────────────────────────────────
  readonly games = signal<VideoGame[]>([]);
  readonly isLoading = signal(false);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly sortBy = signal('title');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly pageSize = signal(5);
  readonly pageSizeOptions = [5, 10, 40];

  /** Drives the search input — debounced before hitting the API */
  private readonly searchSubject = new Subject<string>();
  private currentSearch = '';

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Debounce search so we don't fire a request on every keystroke
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(term => {
      this.currentSearch = term;
      this.currentPage.set(1);
      this.loadGames();
    });

    this.loadGames();
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  loadGames(): void {
    this.isLoading.set(true);

    const query: GameQuery = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.currentSearch || undefined,
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    };

    this.gamesService.getAll(query).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: result => {
        this.games.set(result.items);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadGames();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadGames();
  }

  onSort(column: string): void {
    if (this.sortBy() === column) {
      // Toggle direction if same column
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDir.set('asc');
    }
    this.currentPage.set(1);
    this.loadGames();
  }

  sortIcon(column: string): string {
    if (this.sortBy() !== column) return '⇅';
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }

  /** Last record index for the "Showing X–Y of Z" label */
  pageEnd(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCount());
  }

  navigateToCreate(): void {
    this.router.navigate(['/games/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/games', id, 'edit']);
  }

  deleteGame(id: number): void {
    if (!confirm('Are you sure you want to delete this game?')) return;
    this.gamesService.delete(id).subscribe(() => {
      // If we deleted the last item on a non-first page, go back one page
      if (this.games().length === 1 && this.currentPage() > 1) {
        this.currentPage.set(this.currentPage() - 1);
      }
      this.loadGames();
    });
  }
}
