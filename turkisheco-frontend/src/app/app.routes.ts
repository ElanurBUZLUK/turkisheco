import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { editorGuard } from './core/editor.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      seo: {
        title: 'TurkishEco | Sürdürülebilirlik, Topluluk ve İçerik',
        description:
          'TurkishEco; sürdürülebilirlik, ekonomi, topluluk ve editoryal içerikleri bir araya getiren Türkçe yayın platformudur.',
        canonicalPath: '/',
      },
    },
  },
  {
    path: 'posts/new',
    canActivate: [editorGuard],
    loadComponent: () =>
      import('./posts/post-create.component').then(
        (m) => m.PostCreateComponent
      ),
    data: {
      seo: {
        title: 'Editör Paneli | TurkishEco',
        description: 'TurkishEco editör panelinde içerik üretimi ve taslak yönetimi.',
        canonicalPath: '/posts/new',
        robots: 'noindex, nofollow',
      },
    },
  },
  {
    path: 'posts/:slug',
    loadComponent: () =>
      import('./posts/post-detail.component').then(
        (m) => m.PostDetailComponent
      ),
  },
  {
    path: 'admin',
    pathMatch: 'full',
    redirectTo: 'ww/Ela',
  },
  {
    path: 'admin/login',
    pathMatch: 'full',
    redirectTo: 'ww/Ela',
  },
  {
    path: 'admin/posts',
    pathMatch: 'full',
    redirectTo: 'ww/Ela/posts',
  },
  {
    path: 'ww/:username',
    loadComponent: () =>
      import('./admin/admin-entry.component').then(
        (m) => m.AdminEntryComponent
      ),
    data: {
      seo: {
        title: 'Admin Portal | TurkishEco',
        description: 'TurkishEco super admin yönetim paneli.',
        canonicalPath: '/ww/Ela',
        robots: 'noindex, nofollow',
      },
    },
  },
  {
    path: 'ww/:username/posts',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    data: {
      seo: {
        title: 'Admin Dashboard | TurkishEco',
        description: 'TurkishEco super admin paneli ve editoryal onay kuyruğu.',
        canonicalPath: '/ww/Ela/posts',
        robots: 'noindex, nofollow',
      },
    },
  },
  {
    path: 'forum',
    loadComponent: () =>
      import('./forum/forum-home.component').then(
        (m) => m.ForumHomeComponent
      ),
    data: {
      seo: {
        title: 'Topluluk Sohbetleri | TurkishEco',
        description:
          'TurkishEco topluluğunda sürdürülebilirlik ve ekonomi üzerine sohbet başlıklarını takip edin.',
        canonicalPath: '/forum',
      },
    },
  },
  {
    path: 'w/:username',
    loadComponent: () =>
      import('./writers/writer-access.component').then(
        (m) => m.WriterAccessComponent
      ),
    data: {
      seo: {
        title: 'Writer Girişi | TurkishEco',
        description: 'TurkishEco writer girişi ve tek kullanımlık kod doğrulama ekranı.',
        canonicalPath: '/w',
        robots: 'noindex, nofollow',
      },
    },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about-page.component').then(
        (m) => m.AboutPageComponent
      ),
    data: {
      seo: {
        title: 'Hakkımızda | TurkishEco',
        description:
          'TurkishEco’nun yayın yaklaşımı, editoryal çizgisi ve sürdürülebilirlik odaklı vizyonu hakkında bilgi alın.',
        canonicalPath: '/about',
      },
    },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact-page.component').then(
        (m) => m.ContactPageComponent
      ),
    data: {
      seo: {
        title: 'İletişim | TurkishEco',
        description:
          'TurkishEco ile iletişime geçmek, iş birliği başlatmak veya editoryal ekibe ulaşmak için iletişim bilgilerimizi inceleyin.',
        canonicalPath: '/contact',
      },
    },
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy-page.component').then(
        (m) => m.PrivacyPageComponent
      ),
    data: {
      seo: {
        title: 'Gizlilik Politikası | TurkishEco',
        description:
          'TurkishEco gizlilik politikası, kişisel verilerin işlenmesi ve veri güvenliği yaklaşımı.',
        canonicalPath: '/privacy',
      },
    },
  },
  {
    path: 'cookies',
    loadComponent: () =>
      import('./pages/cookies-page.component').then(
        (m) => m.CookiesPageComponent
      ),
    data: {
      seo: {
        title: 'Çerez Politikası | TurkishEco',
        description:
          'TurkishEco sitesinde kullanılan çerezler, amaçları ve tercih yönetimi hakkında bilgi alın.',
        canonicalPath: '/cookies',
      },
    },
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./pages/terms-page.component').then(
        (m) => m.TermsPageComponent
      ),
    data: {
      seo: {
        title: 'Kullanım Koşulları | TurkishEco',
        description:
          'TurkishEco kullanım koşulları, hesap kullanımı ve platform sorumluluklarına ilişkin temel şartlar.',
        canonicalPath: '/terms',
      },
    },
  },
  {
    path: 'kvkk',
    loadComponent: () =>
      import('./pages/kvkk-page.component').then(
        (m) => m.KvkkPageComponent
      ),
    data: {
      seo: {
        title: 'KVKK Aydınlatma Metni | TurkishEco',
        description:
          'TurkishEco KVKK aydınlatma metni ve ilgili kişi haklarına ilişkin temel bilgilendirme.',
        canonicalPath: '/kvkk',
      },
    },
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./account/account-auth.component').then(
        (m) => m.AccountAuthComponent
      ),
    data: {
      seo: {
        title: 'Hesap Oluştur | TurkishEco',
        description: 'TurkishEco hesabı oluşturma ekranı.',
        canonicalPath: '/account',
        robots: 'noindex, nofollow',
      },
    },
  },
  {
    path: 'account/login',
    loadComponent: () =>
      import('./account/account-login.component').then(
        (m) => m.AccountLoginComponent
      ),
    data: {
      seo: {
        title: 'Giriş Yap | TurkishEco',
        description: 'TurkishEco oturum açma ekranı.',
        canonicalPath: '/account/login',
        robots: 'noindex, nofollow',
      },
    },
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./account/account.component').then(
        (m) => m.AccountComponent
      ),
  },
  {
    path: 'account/profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./account/account-profile.component').then(
        (m) => m.AccountProfileComponent
      ),
    data: {
      seo: {
        title: 'Profilim | TurkishEco',
        description: 'TurkishEco kullanıcı profil yönetimi.',
        canonicalPath: '/account/profile',
        robots: 'noindex, nofollow',
      },
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      ),
    data: {
      seo: {
        title: 'Sayfa Bulunamadı | TurkishEco',
        description: 'Aradığınız sayfa bulunamadı. TurkishEco ana sayfasına dönebilirsiniz.',
        canonicalPath: '/404',
        robots: 'noindex, nofollow',
      },
    },
  },
];
