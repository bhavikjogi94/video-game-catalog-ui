import { TestBed } from '@angular/core/testing';
import { VideoGameFormComponent } from './video-game-form.component';
import { GamesService } from '../../core/data-access/games.service';
import { GenresService } from '../../core/data-access/genres.service';
import { PlatformsService } from '../../core/data-access/platforms.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('VideoGameFormComponent', () => {
  let component: VideoGameFormComponent;
  let gamesServiceMock: any;
  let genresServiceMock: any;
  let platformsServiceMock: any;
  let routerMock: any;
  let routeMock: any;

  const mockGenres = [{ id: 1, name: 'Action' }, { id: 2, name: 'RPG' }];
  const mockPlatforms = [{ id: 1, name: 'PC' }, { id: 2, name: 'PS5' }];
  const mockGame = {
    id: 1,
    title: 'Existing Game',
    developer: 'Old Dev',
    releaseYear: 2010,
    description: 'Old Desc',
    genreId: 1,
    platformId: 1
  };

  beforeEach(async () => {
    gamesServiceMock = {
      getById: jest.fn().mockReturnValue(of(mockGame)),
      create: jest.fn().mockReturnValue(of({})),
      update: jest.fn().mockReturnValue(of({}))
    };
    genresServiceMock = { getAll: jest.fn().mockReturnValue(of(mockGenres)) };
    platformsServiceMock = { getAll: jest.fn().mockReturnValue(of(mockPlatforms)) };
    routerMock = { navigate: jest.fn() };
    routeMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(null) // Default to Create mode
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [VideoGameFormComponent, ReactiveFormsModule],
      providers: [
        { provide: GamesService, useValue: gamesServiceMock },
        { provide: GenresService, useValue: genresServiceMock },
        { provide: PlatformsService, useValue: platformsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(VideoGameFormComponent);
    component = fixture.componentInstance;
  });

  describe('Create Mode', () => {
    it('should initialize with default values', () => {
      component.ngOnInit();
      expect(component.isEditMode()).toBe(false);
      expect(component.form.value.title).toBe('');
      expect(component.form.value.releaseYear).toBe(new Date().getFullYear());
      expect(component.genres()).toEqual(mockGenres);
    });

    it('should validate required fields', () => {
      component.ngOnInit();
      component.form.patchValue({ title: '' });
      expect(component.form.get('title')?.valid).toBe(false);
      expect(component.form.valid).toBe(false);
    });

    it('should submit new game and navigate', () => {
      component.ngOnInit();
      component.form.patchValue({
        title: 'New Game',
        developer: 'New Dev',
        releaseYear: 2024,
        genreId: 1,
        platformId: 1
      });
      component.onSubmit();
      expect(gamesServiceMock.create).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/games']);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      routeMock.snapshot.paramMap.get.mockReturnValue('1');
    });

    it('should load game data and patch form', () => {
      component.ngOnInit();
      expect(component.isEditMode()).toBe(true);
      expect(gamesServiceMock.getById).toHaveBeenCalledWith(1);
      expect(component.form.value.title).toBe(mockGame.title);
      expect(component.isLoading()).toBe(false);
    });

    it('should submit updated game and navigate', () => {
      component.ngOnInit();
      component.form.patchValue({ title: 'Updated Title' });
      component.onSubmit();
      expect(gamesServiceMock.update).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Updated Title' }));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/games']);
    });

    it('should navigate back to list if game is not found', () => {
      gamesServiceMock.getById.mockReturnValue(throwError(() => new Error('404')));
      component.ngOnInit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/games']);
    });
  });

  it('should navigate to list on cancel', () => {
    component.onCancel();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/games']);
  });
});
