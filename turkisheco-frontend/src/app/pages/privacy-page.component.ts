import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="legal-page">
      <h1>Gizlilik Politikası</h1>
      <p>TurkishEco, kullanıcı verilerini yalnızca hizmet sunumu, güvenlik ve iletişim amacıyla işler.</p>
      <h2>Toplanan veriler</h2>
      <p>Hesap bilgileri, iletişim formları ve oturum kayıtları hizmetin işletilmesi için tutulabilir.</p>
      <h2>Veri kullanımı</h2>
      <p>Veriler yetkisiz erişime karşı korunur; yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.</p>
      <h2>Haklarınız</h2>
      <p>Kişisel verilerinize ilişkin erişim, düzeltme ve silme taleplerinizi iletişim adreslerimiz üzerinden iletebilirsiniz.</p>
    </section>
  `,
  styles: [`
    .legal-page { max-width: 840px; margin: 0 auto; padding: 2rem 1.5rem 4rem; line-height: 1.75; color: #3f483a; }
    h1 { margin: 0 0 1rem; font-size: clamp(2rem, 5vw, 3rem); }
    h2 { margin: 1.5rem 0 0.5rem; font-size: 1.2rem; }
    p { margin: 0; }
  `]
})
export class PrivacyPageComponent {}
