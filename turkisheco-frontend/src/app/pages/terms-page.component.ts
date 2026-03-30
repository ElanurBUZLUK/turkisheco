import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="legal-page">
      <h1>Kullanım Koşulları</h1>
      <p>
        TurkishEco platformunu kullanırken yürürlükteki mevzuata, topluluk kurallarına
        ve editoryal ilkelere uygun davranmanız beklenir.
      </p>
      <h2>Hesap kullanımı</h2>
      <p>
        Kullanıcılar hesap bilgilerinin güvenliğinden sorumludur. Yetkisiz kullanım şüphesi
        halinde hesap sahibi gecikmeden bizimle iletişime geçmelidir.
      </p>
      <h2>İçerik sorumluluğu</h2>
      <p>
        Platforma eklenen yorum, profil ve diğer kullanıcı içeriklerinden ilgili kullanıcı
        sorumludur. TurkishEco gerekli gördüğünde içerikleri inceleme, kaldırma veya erişimi
        sınırlandırma hakkını saklı tutar.
      </p>
      <h2>Hizmet değişiklikleri</h2>
      <p>
        Platform özellikleri, erişim koşulları ve bu metin zaman içinde güncellenebilir.
        Güncel sürüm her zaman bu sayfada yayımlanır.
      </p>
    </section>
  `,
  styles: [`
    .legal-page { max-width: 840px; margin: 0 auto; padding: 2rem 1.5rem 4rem; line-height: 1.75; color: #3f483a; }
    h1 { margin: 0 0 1rem; font-size: clamp(2rem, 5vw, 3rem); }
    h2 { margin: 1.5rem 0 0.5rem; font-size: 1.2rem; }
    p { margin: 0; }
  `],
})
export class TermsPageComponent {}
