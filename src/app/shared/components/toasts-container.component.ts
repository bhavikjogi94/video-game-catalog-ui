import { Component, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [NgbToastModule],
  template: `
    @for (toast of toastService.toasts(); track toast) {
      <ngb-toast
        [class]="toast.classname"
        [autohide]="true"
        [delay]="5000"
        (hidden)="toastService.remove(toast)"
      >
        {{ toast.message }}
      </ngb-toast>
    }
  `,
  // Position the container fixed in the top-right corner over all other content
  host: { class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200' }
})
export class ToastsContainerComponent {
  toastService = inject(ToastService);
}
