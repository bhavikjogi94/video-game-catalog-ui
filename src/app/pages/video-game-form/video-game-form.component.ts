import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GamesService } from '../../core/data-access/games.service';
import { GenresService } from '../../core/data-access/genres.service';
import { PlatformsService } from '../../core/data-access/platforms.service';
import { Genre } from '../../models/genre.model';
import { Platform } from '../../models/platform.model';
import { CreateUpdateVideoGame } from '../../models/video-game.model';

/**
 * Video Game Form Page — shared for both create (/games/new) and edit (/games/:id/edit).
 * Lazily loaded — Angular only downloads this chunk when the user navigates here.
 *
 * Demonstrates:
 *  - Reactive Forms with typed FormControl<T>
 *  - Validators defined entirely in TypeScript (not in the template)
 *  - Signals for dropdown data and loading state
 *  - computed() to derive whether we are in create or edit mode
 *  - inject() function-style DI
 */
@Component({
  selector: 'app-video-game-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './video-game-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGameFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gamesService = inject(GamesService);
  private readonly genresService = inject(GenresService);
  private readonly platformsService = inject(PlatformsService);

  // ── Signals ──────────────────────────────────────────────────────────────
  readonly genres = signal<Genre[]>([]);
  readonly platforms = signal<Platform[]>([]);
  readonly isSaving = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /**
   * computed() derives the mode from the route snapshot.
   * The same component instance is reused for both /new and /:id/edit.
   */
  readonly gameId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? Number(id) : null;
  });

  readonly isEditMode = computed(() => this.gameId() !== null);

  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Game' : 'Add New Game'
  );

  // ── Reactive Form ────────────────────────────────────────────────────────
  /**
   * All validation rules are defined here in TypeScript — the template only
   * reads the state, it does not define any validation logic.
   */
  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    developer: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    releaseYear: new FormControl(new Date().getFullYear(), {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1950), Validators.max(2100)],
    }),
    description: new FormControl('', { nonNullable: true }),
    genreId: new FormControl<number | null>(null, Validators.required),
    platformId: new FormControl<number | null>(null, Validators.required),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Load dropdown data in parallel
    this.genresService.getAll().subscribe(data => this.genres.set(data));
    this.platformsService.getAll().subscribe(data => this.platforms.set(data));

    // If we're in edit mode, fetch the existing game and pre-populate the form
    const id = this.gameId();
    if (id !== null) {
      this.isLoading.set(true);
      this.gamesService.getById(id).subscribe({
        next: game => {
          this.form.setValue({
            title: game.title,
            developer: game.developer,
            releaseYear: game.releaseYear,
            description: game.description ?? '',
            genreId: game.genreId,
            platformId: game.platformId,
          });
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.router.navigate(['/games']); // game not found — go back to list
        },
      });
    }
  }

  // ── Form submission ───────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // trigger validation messages
      return;
    }

    const dto: CreateUpdateVideoGame = {
      title: this.form.controls.title.value,
      developer: this.form.controls.developer.value,
      releaseYear: this.form.controls.releaseYear.value,
      description: this.form.controls.description.value,
      genreId: this.form.controls.genreId.value!,
      platformId: this.form.controls.platformId.value!,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const request$ = this.isEditMode()
      ? this.gamesService.update(this.gameId()!, dto) // PUT
      : this.gamesService.create(dto);               // POST

    request$.subscribe({
      next: () => this.router.navigate(['/games']),
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('An error occurred. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/games']);
  }

  // ── Template helpers ──────────────────────────────────────────────────────
  /** Returns true if a control has been touched and is invalid — drives error message visibility */
  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && control?.touched);
  }
}
