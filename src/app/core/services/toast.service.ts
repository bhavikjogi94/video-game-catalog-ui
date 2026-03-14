import { Injectable, signal } from '@angular/core';

export interface ToastInfo { 
  message: string; 
  classname?: string; 
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastInfo[]>([]);

  showError(message: string) {
    this.toasts.update(t => [...t, { message, classname: 'bg-danger text-light' }]);
  }
  
  showSuccess(message: string) {
    this.toasts.update(t => [...t, { message, classname: 'bg-success text-light' }]);
  }

  remove(toast: ToastInfo) {
    this.toasts.update(t => t.filter(x => x !== toast));
  }
}
