import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsContainerComponent } from './shared/components/toasts-container.component';

/**
 * Root App component — minimal shell that just hosts the router outlet.
 * All UI lives inside the routed page components (BrowseComponent, EditComponent).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastsContainerComponent],
  template: `
    <router-outlet />
    <app-toasts />
  `,
})
export class App {}
