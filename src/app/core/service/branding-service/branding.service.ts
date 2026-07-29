import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, firstValueFrom, timeout } from 'rxjs';
import { RuntimeTenantService } from './runtime-tenant.service';

export interface PublicBranding {
  brandId: number;
  clientId: string;
  name: string;
  companyName: string;
  clientUrl: string;
  supportEmail: string;
  supportPhone: string | null;
  documentType: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}

interface BrandingResponse {
  success: boolean;
  data: PublicBranding;
}

export interface BrandingBootstrapEvent {
  outcome: 'resolved' | 'fallback';
  durationMs: number;
  brandId: number | null;
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly brandingSubject = new BehaviorSubject<PublicBranding | null>(null);
  private logoObserver: MutationObserver | null = null;
  readonly branding$ = this.brandingSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly runtimeTenant: RuntimeTenantService,
  ) {}

  get current(): PublicBranding | null {
    return this.brandingSubject.value;
  }

  get brandId(): number | null {
    return this.current?.brandId ?? null;
  }

  get logoUrl(): string | null {
    return this.current?.logoUrl ?? null;
  }

  async load(): Promise<void> {
    const startedAt = window.performance.now();
    const host = window.location.hostname;
    const baseUrl = environment.apis.systemConfigurationService.replace(/\/$/, '');
    const url = `${baseUrl}/brandconfiguration/public/current?host=${encodeURIComponent(host)}`;

    try {
      const response = await firstValueFrom(
        this.http.get<BrandingResponse>(url).pipe(timeout(5000)),
      );
      if (response.success && response.data) {
        this.runtimeTenant.setClientId(response.data.clientId);
        this.brandingSubject.next(response.data);
        this.applyToDocument();
        this.reportBootstrap('resolved', startedAt, response.data.brandId);
        return;
      }
      throw new Error('The public branding response did not contain a valid contract.');
    } catch (error) {
      this.reportBootstrap('fallback', startedAt, null);
      console.warn('Dynamic branding is unavailable; local visual assets will be used.', error);
    }
  }

  applyToDocument(): void {
    const branding = this.current;
    if (!branding) return;

    this.setColor('--brand-primary', branding.primaryColor);
    this.setColor('--brand-secondary', branding.secondaryColor);
    this.setColor('--brand-background', branding.backgroundColor);
    this.setColor('--bs-primary', branding.primaryColor);
    this.setColor('--bs-secondary', branding.secondaryColor);
    this.setColor('--bs-body-bg', branding.backgroundColor);

    this.document.title = branding.name || branding.companyName;

    if (branding.logoUrl) {
      const favicon = this.document.querySelector<HTMLLinkElement>('#favicon');
      if (favicon) favicon.href = branding.logoUrl;
    }
    this.applyBrandLogo(this.document);
    this.observeBrandLogos();
  }

  private applyBrandLogo(root: ParentNode): void {
    const branding = this.current;
    if (!branding) return;

    if (branding.logoUrl) {
      root.querySelectorAll<HTMLImageElement>('img[data-brand-logo]')
        .forEach(image => image.src = branding.logoUrl!);
    }
    root.querySelectorAll<HTMLElement>('[data-brand-name]')
      .forEach(element => element.textContent = branding.name);
    root.querySelectorAll<HTMLElement>('[data-brand-support-email]')
      .forEach(element => {
        element.textContent = branding.supportEmail;
        if (element instanceof HTMLAnchorElement) {
          element.href = `mailto:${branding.supportEmail}`;
        }
      });
  }

  private observeBrandLogos(): void {
    if (this.logoObserver || !this.document.body) return;

    this.logoObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node instanceof Element) {
          const branding = this.current;
          if (node.matches('img[data-brand-logo]') && branding?.logoUrl) {
            (node as HTMLImageElement).src = branding.logoUrl;
          }
          if (node.matches('[data-brand-name]') && branding) {
            node.textContent = branding.name;
          }
          if (node.matches('[data-brand-support-email]') && branding) {
            node.textContent = branding.supportEmail;
          }
          this.applyBrandLogo(node);
        }
      }));
    });
    this.logoObserver.observe(this.document.body, { childList: true, subtree: true });
  }

  private setColor(property: string, value: string): void {
    if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) {
      this.document.documentElement.style.setProperty(property, value);
    }
  }

  private reportBootstrap(
    outcome: BrandingBootstrapEvent['outcome'],
    startedAt: number,
    brandId: number | null,
  ): void {
    const durationMs = window.performance.now() - startedAt;
    const detail: BrandingBootstrapEvent = { outcome, durationMs, brandId };
    try {
      window.performance.measure('ecosystem.branding.bootstrap', {
        start: startedAt,
        duration: durationMs,
        detail,
      });
      window.dispatchEvent(new CustomEvent<BrandingBootstrapEvent>(
        'ecosystem:branding-bootstrap',
        { detail },
      ));
    } catch {
      // Telemetry support must never prevent the branding fallback or startup.
    }
  }
}
