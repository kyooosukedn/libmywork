import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);

  readonly toasts$ = this.toasts.asReadonly();

  success(message: string, duration = 3000): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration = 5000): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration = 3000): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration = 4000): void {
    this.show({ message, type: 'warning', duration });
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const newToast: Toast = { id, ...toast };

    this.toasts.update(toasts => [...toasts, newToast]);

    if (toast.duration) {
      setTimeout(() => this.remove(id), toast.duration);
    }
  }

  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
