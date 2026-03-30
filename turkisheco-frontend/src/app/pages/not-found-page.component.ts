import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="not-found">
      <p class="eyebrow">404</p>
      <h1>Aradığınız sayfa bulunamadı.</h1>
      <p>Bağlantı kaldırılmış, taşınmış veya yanlış yazılmış olabilir.</p>
      <div class="actions">
        <a routerLink="/">Ana sayfaya dön</a>
        <a routerLink="/contact">Bizimle iletişime geç</a>
      </div>
    </section>
  `,
  styles: [`
    .not-found { max-width: 760px; margin: 0 auto; padding: 5rem 1.5rem; text-align: center; }
    .eyebrow { margin: 0 0 0.75rem; color: #71856a; letter-spacing: 0.14em; text-transform: uppercase; }
    h1 { margin: 0 0 1rem; font-size: clamp(2rem, 6vw, 3.6rem); line-height: 1.1; }
    p { margin: 0; color: #5a6655; line-height: 1.7; }
    .actions { display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; }
    .actions a { padding: 0.9rem 1.2rem; border-radius: 999px; text-decoration: none; background: #e7efe1; color: #24422d; font-weight: 600; }
  `]
})
export class NotFoundPageComponent {}
