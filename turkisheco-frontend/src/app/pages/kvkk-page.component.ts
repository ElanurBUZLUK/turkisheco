import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-kvkk-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="legal-page">
      <h1>KVKK Aydınlatma Metni</h1>
      <p>6698 sayılı KVKK kapsamında TurkishEco, kişisel verileri belirli, açık ve meşru amaçlarla işler.</p>
      <h2>Veri sorumlusu</h2>
      <p>İletişim sayfasında yer alan kurumsal iletişim kanalları veri sorumlusu iletişim noktası olarak kullanılabilir.</p>
      <h2>İşleme amaçları</h2>
      <p>Hesap yönetimi, güvenlik, iletişim taleplerinin yanıtlanması ve hizmet sürekliliği temel işleme amaçlarıdır.</p>
      <h2>Başvuru hakkı</h2>
      <p>İlgili kişi başvurularınızı kimlik doğrulamaya elverişli bilgilerle birlikte e-posta üzerinden iletebilirsiniz.</p>
    </section>
  `,
  styles: [`
    .legal-page { max-width: 840px; margin: 0 auto; padding: 2rem 1.5rem 4rem; line-height: 1.75; color: #3f483a; }
    h1 { margin: 0 0 1rem; font-size: clamp(2rem, 5vw, 3rem); }
    h2 { margin: 1.5rem 0 0.5rem; font-size: 1.2rem; }
    p { margin: 0; }
  `]
})
export class KvkkPageComponent {}
