import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: string;
  robots?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  update(config: SeoConfig): void {
    const canonicalUrl = this.toAbsoluteUrl(config.canonicalPath ?? this.document.location?.pathname ?? '/');
    const imageUrl = this.toAbsoluteUrl(config.image ?? environment.defaultOgImageUrl);
    const robots = config.robots ?? 'index, follow';
    const type = config.type ?? 'website';

    this.title.setTitle(config.title);
    this.upsertMetaTag('name', 'description', config.description);
    this.upsertMetaTag('name', 'robots', robots);
    this.upsertMetaTag('property', 'og:title', config.title);
    this.upsertMetaTag('property', 'og:description', config.description);
    this.upsertMetaTag('property', 'og:image', imageUrl);
    this.upsertMetaTag('property', 'og:type', type);
    this.setCanonical(canonicalUrl);
  }

  private upsertMetaTag(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content });
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private toAbsoluteUrl(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) {
      return pathOrUrl;
    }

    const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${environment.siteUrl}${normalizedPath}`;
  }
}
