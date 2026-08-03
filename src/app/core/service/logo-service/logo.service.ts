import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { BrandingService } from '../branding-service/branding.service';

@Injectable({
  providedIn: 'root'
})
export class LogoService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  /**
   * Emits on theme changes and on branding changes, so an administrative save
   * updates the header logo without a reload.
   */
  readonly logoSrc$: Observable<string>;

  constructor(private readonly brandingService: BrandingService) {
    const savedTheme = localStorage.getItem('isDarkTheme') === 'true';
    this.isDarkTheme.next(savedTheme);

    this.logoSrc$ = combineLatest([
      this.isDarkTheme$,
      this.brandingService.branding$,
    ]).pipe(map(() => this.getLogoSrc()));
  }

  toggleTheme(isDark: boolean): void {
    this.isDarkTheme.next(isDark);
    localStorage.setItem('isDarkTheme', String(isDark));
  }

  getLogoSrc(): string {
    return this.brandingService.logoUrl
      ?? (this.isDarkTheme.value ? 'assets/images/logo-dark.png' : 'assets/images/logo-white.png');
  }
}
