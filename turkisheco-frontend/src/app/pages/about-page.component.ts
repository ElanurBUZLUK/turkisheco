import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="info-page">
      <p class="eyebrow">Hakkımızda</p>
      <h1>TurkishEco sürdürülebilirlik ve topluluk odaklı bir yayın alanıdır.</h1>
      <p class="lead">
        Editoryal içeriği, yazar iş akışını ve topluluk konuşmalarını tek bir çatı altında
        birleştiriyoruz. Amaç; ekonomi, çevre ve toplum ekseninde Türkçe içerik üretmek.
      </p>

      <div class="grid">
        <article class="card">
          <h2>Editoryal yaklaşım</h2>
          <p>Yayınlanan içerikler taslak, inceleme ve onay süreçlerinden geçer.</p>
        </article>
        <article class="card">
          <h2>Topluluk odağı</h2>
          <p>Forum ve yazar alanlarıyla yalnızca okunabilir değil, katkı verilebilir bir yapı hedeflenir.</p>
        </article>
        <article class="card">
          <h2>İletişim</h2>
          <p>İş birliği ve kurumsal talepler için iletişim sayfamızdan bize ulaşabilirsiniz.</p>
          <a routerLink="/contact">İletişim sayfası</a>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .info-page { max-width: 1080px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    .eyebrow { margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.14em; color: #6b7d63; font-size: 0.78rem; }
    h1 { margin: 0 0 1rem; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; }
    .lead { max-width: 760px; color: #55624f; line-height: 1.7; font-size: 1.05rem; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 2rem; }
    .card { background: #fff; border: 1px solid #e4eadf; border-radius: 18px; padding: 1.25rem; }
    .card h2 { margin: 0 0 0.75rem; font-size: 1.15rem; }
    .card p { margin: 0 0 0.75rem; color: #566250; line-height: 1.6; }
    .card a { color: #295a3b; font-weight: 600; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class AboutPageComponent {}
