import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly measurementId = environment.analyticsMeasurementId;
  private readonly searchConsoleToken = environment.searchConsoleVerificationToken;
  private initialized = false;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  initialize(): void {
    this.upsertSearchConsoleVerification();

    if (!isPlatformBrowser(this.platformId) || !this.measurementId || this.initialized) {
      return;
    }

    this.initialized = true;
    this.injectGtagScript();

    window.dataLayer = window.dataLayer ?? [];
    window.gtag =
      window.gtag ??
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: false,
      anonymize_ip: true,
    });
  }

  trackPageView(path: string, title?: string): void {
    if (!this.measurementId || !isPlatformBrowser(this.platformId) || !window.gtag) {
      return;
    }

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title ?? this.document.title,
      page_location: this.toAbsoluteUrl(path),
    });
  }

  trackEvent(name: string, params: Record<string, string | number | boolean | null | undefined> = {}): void {
    if (!this.measurementId || !isPlatformBrowser(this.platformId) || !window.gtag) {
      return;
    }

    window.gtag('event', name, params);
  }

  private injectGtagScript(): void {
    if (this.document.getElementById('ga4-script')) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    this.document.head.appendChild(script);
  }

  private upsertSearchConsoleVerification(): void {
    if (!this.searchConsoleToken) {
      return;
    }

    const selector = 'meta[name="google-site-verification"]';
    let tag = this.document.head.querySelector<HTMLMetaElement>(selector);

    if (!tag) {
      tag = this.document.createElement('meta');
      tag.setAttribute('name', 'google-site-verification');
      this.document.head.appendChild(tag);
    }

    tag.setAttribute('content', this.searchConsoleToken);
  }

  private toAbsoluteUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${environment.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
