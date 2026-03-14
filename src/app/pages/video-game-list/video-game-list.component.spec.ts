import { TestBed } from '@angular/core/testing';
import { VideoGameListComponent } from './video-game-list.component';
import { GamesService } from '../../core/data-access/games.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PagedResult } from '../../models/video-game.model';

describe('VideoGameListComponent', () => {
  let component: VideoGameListComponent;
  let gamesServiceMock: any;
  let routerMock: any;

  const mockPagedResult: PagedResult<any> = {
    items: [
      { id: 1, title: 'Game 1', developer: 'Dev 1', releaseYear: 2020, genreName: 'Action', platformName: 'PC' },
      { id: 2, title: 'Game 2', developer: 'Dev 2', releaseYear: 2021, genreName: 'RPG', platformName: 'PS5' }
    ],
    totalCount: 2
  };

  beforeEach(async () => {
    gamesServiceMock = {
      getAll: jest.fn().mockReturnValue(of(mockPagedResult)),
      delete: jest.fn().mockReturnValue(of(null))
    };

    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [VideoGameListComponent],
      providers: [
        { provide: GamesService, useValue: gamesServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(VideoGameListComponent);
    component = fixture.componentInstance;
    // We don't call detectChanges() here because it's zoneless and OnPush.
    // Initialization happens in ngOnInit which is called during the first detectChanges or manually.
  });

  it('should create and load initial games', () => {
    component.ngOnInit();
    expect(gamesServiceMock.getAll).toHaveBeenCalled();
    expect(component.games()).toEqual(mockPagedResult.items);
    expect(component.totalCount()).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should change page and reload games', () => {
    component.ngOnInit();
    component.onPageChange(2);
    expect(component.currentPage()).toBe(2);
    expect(gamesServiceMock.getAll).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('should change page size and reset to page 1', () => {
    component.ngOnInit();
    component.onPageChange(2); // Move to page 2 first
    component.onPageSizeChange(10);
    expect(component.pageSize()).toBe(10);
    expect(component.currentPage()).toBe(1);
    expect(gamesServiceMock.getAll).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 10, page: 1 }));
  });

  it('should toggle sort direction when same column is sorted', () => {
    component.ngOnInit();
    // Default is title/asc
    component.onSort('title');
    expect(component.sortBy()).toBe('title');
    expect(component.sortDir()).toBe('desc');

    component.onSort('title');
    expect(component.sortDir()).toBe('asc');
  });

  it('should change sort column and reset direction to asc', () => {
    component.ngOnInit();
    component.onSort('developer');
    expect(component.sortBy()).toBe('developer');
    expect(component.sortDir()).toBe('asc');
  });

  it('should navigate to create page', () => {
    component.navigateToCreate();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/games/new']);
  });

  it('should navigate to edit page', () => {
    component.navigateToEdit(123);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/games', 123, 'edit']);
  });

  it('should delete game and refresh list', () => {
    window.confirm = jest.fn().mockReturnValue(true);
    component.ngOnInit();
    component.deleteGame(1);
    expect(gamesServiceMock.delete).toHaveBeenCalledWith(1);
    expect(gamesServiceMock.getAll).toHaveBeenCalledTimes(2); // Initial + After delete
  });

  it('should NOT delete game if user cancels confirmation', () => {
    window.confirm = jest.fn().mockReturnValue(false);
    component.deleteGame(1);
    expect(gamesServiceMock.delete).not.toHaveBeenCalled();
  });
});
