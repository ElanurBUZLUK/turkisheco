import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { editorGuard } from './core/editor.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'posts/new',
    canActivate: [editorGuard],
    loadComponent: () =>
      import('./posts/post-create.component').then(
        (m) => m.PostCreateComponent
      ),
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
    redirectTo: 'admin/posts',
  },
  {
    path: 'admin/posts',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'forum',
    loadComponent: () =>
      import('./forum/forum-home.component').then(
        (m) => m.ForumHomeComponent
      ),
  },
  {
    path: 'w/:username',
    loadComponent: () =>
      import('./writers/writer-access.component').then(
        (m) => m.WriterAccessComponent
      ),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./account/account-auth.component').then(
        (m) => m.AccountAuthComponent
      ),
  },
  {
    path: 'account/login',
    loadComponent: () =>
      import('./account/account-login.component').then(
        (m) => m.AccountLoginComponent
      ),
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
  },
  {
    path: '**',
    redirectTo: '',
  },
];
