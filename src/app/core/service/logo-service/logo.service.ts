import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BrandingService } from '../branding-service/branding.service';

@Injectable({
  providedIn: 'root'
})
export class LogoService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor(private readonly brandingService: BrandingService) {
    const savedTheme = localStorage.getItem('isDarkTheme') === 'true';
    this.isDarkTheme.next(savedTheme);
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
