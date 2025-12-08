import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'posts/new',
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
    path: 'admin/posts',
    loadComponent: () =>
      import('./posts/posts-list.component').then(
        (m) => m.PostsListComponent
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
    path: '**',
    redirectTo: '',
  },
];
