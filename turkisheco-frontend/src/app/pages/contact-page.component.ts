import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="info-page">
      <p class="eyebrow">İletişim</p>
      <h1>Ekibimize doğrudan ulaşın.</h1>
      <p class="lead">
        Editoryal iş birlikleri, kurumsal görüşmeler ve teknik sorular için aşağıdaki iletişim
        bilgilerini kullanabilirsiniz.
      </p>

      <div class="grid">
        <article class="card">
          <h2>E-posta</h2>
          <p><a href="mailto:hello@turkisheco.com">hello@turkisheco.com</a></p>
        </article>
        <article class="card">
          <h2>Telefon</h2>
          <p><a href="tel:+902120000000">+90 212 000 00 00</a></p>
        </article>
        <article class="card">
          <h2>Adres</h2>
          <p>Maslak, Sarıyer / İstanbul, Türkiye</p>
        </article>
      </div>

      <div class="cta">
        <strong>Kurumsal iş birliği mi düşünüyorsunuz?</strong>
        <p>24 saat içinde geri dönüş için e-posta başlığına konuyu net yazın.</p>
      </div>
    </section>
  `,
  styles: [`
    .info-page { max-width: 1080px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    .eyebrow { margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.14em; color: #6b7d63; font-size: 0.78rem; }
    h1 { margin: 0 0 1rem; font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.1; }
    .lead { max-width: 760px; color: #55624f; line-height: 1.7; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 2rem; }
    .card, .cta { background: #fff; border: 1px solid #e4eadf; border-radius: 18px; padding: 1.25rem; }
    .card h2, .cta strong { display: block; margin: 0 0 0.75rem; font-size: 1.1rem; }
    .card p, .cta p { margin: 0; color: #566250; line-height: 1.6; }
    .card a { color: #295a3b; font-weight: 600; }
    .cta { margin-top: 1rem; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class ContactPageComponent {}
