import { Routes } from '@angular/router';
import { PostsListComponent } from './posts/posts-list.component';
import { PostDetailComponent } from './posts/post-detail.component';
import { PostCreateComponent } from './posts/post-create.component';

export const routes: Routes = [
  { path: '', component: PostsListComponent },
  { path: 'posts/new', component: PostCreateComponent },
  { path: 'posts/:slug', component: PostDetailComponent },
  { path: '**', redirectTo: '' },
];
