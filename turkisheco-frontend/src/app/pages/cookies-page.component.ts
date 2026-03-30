import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cookies-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="legal-page">
      <h1>Çerez Politikası</h1>
      <p>TurkishEco, site performansını iyileştirmek ve temel oturum işlevlerini sürdürmek için çerezler kullanabilir.</p>
      <h2>Zorunlu çerezler</h2>
      <p>Giriş durumu, güvenlik ve temel yönlendirme işlemleri için gerekli çerezleri kapsar.</p>
      <h2>Analitik çerezler</h2>
      <p>Analitik araçlar aktif edildiğinde anonim trafik ölçümü amacıyla kullanılabilir.</p>
      <h2>Tercih yönetimi</h2>
      <p>Tarayıcı ayarlarınız veya ileride sunulacak tercih paneli üzerinden çerez tercihlerinizi yönetebilirsiniz.</p>
    </section>
  `,
  styles: [`
    .legal-page { max-width: 840px; margin: 0 auto; padding: 2rem 1.5rem 4rem; line-height: 1.75; color: #3f483a; }
    h1 { margin: 0 0 1rem; font-size: clamp(2rem, 5vw, 3rem); }
    h2 { margin: 1.5rem 0 0.5rem; font-size: 1.2rem; }
    p { margin: 0; }
  `]
})
export class CookiesPageComponent {}
