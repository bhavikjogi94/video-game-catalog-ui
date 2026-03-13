import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root App component — minimal shell that just hosts the router outlet.
 * All UI lives inside the routed page components (VideoGameListComponent, VideoGameFormComponent).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {}
