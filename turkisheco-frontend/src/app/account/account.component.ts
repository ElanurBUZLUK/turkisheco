import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page account-page" *ngIf="profile">
      <div class="profile-header">
        <img
          *ngIf="profile.avatarUrl; else noAvatar"
          [src]="profile.avatarUrl"
          alt="Avatar"
          class="avatar"
        />
        <ng-template #noAvatar>
          <div class="avatar avatar-placeholder">
            {{ profile.userName[0] | uppercase }}
          </div>
        </ng-template>

        <div class="info">
          <h1>{{ profile.userName }}</h1>
          <p class="email">{{ profile.email }}</p>
          <textarea
            [(ngModel)]="editBio"
            rows="3"
            placeholder="Biyografi yaz..."
          ></textarea>

          <input
            type="text"
            [(ngModel)]="editAvatarUrl"
            placeholder="Profil fotoğrafı URL"
          />

          <button (click)="save()" [disabled]="saving">Kaydet</button>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <h2>Yazdığı yorumlar</h2>
          <ul>
            <li *ngFor="let c of profile.comments">
              <small>{{ c.createdAt | date: 'short' }}</small><br />
              {{ c.content }}
              <a [routerLink]="['/posts', c.postId]">Yazıya git</a>
            </li>
          </ul>
        </div>

        <div class="column">
          <h2>Açtığı başlıklar</h2>
          <ul>
            <li *ngFor="let t of profile.topics">
              <small>{{ t.createdAt | date: 'short' }}</small><br />
              <a [routerLink]="['/forum', t.slug]">{{ t.title }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-page { max-width: 900px; margin: 0 auto; padding: 1.5rem; }
    .profile-header { display: flex; gap: 1rem; align-items: flex-start; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
    .avatar-placeholder { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #ddd; font-size: 2rem; }
    .info textarea, .info input { width: 100%; margin-top: 0.5rem; }
    .columns { display: flex; gap: 2rem; margin-top: 2rem; }
    .column { flex: 1; }
  `]
})
export class AccountComponent {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  profile?: UserProfile;
  editBio = '';
  editAvatarUrl = '';
  saving = false;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : 1;

    this.userService.getProfile(id).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.editBio = profile.bio ?? '';
        this.editAvatarUrl = profile.avatarUrl ?? '';
      }
    });
  }

  save() {
    if (!this.profile) return;
    this.saving = true;
    this.userService.updateProfile(this.profile.id, {
      bio: this.editBio,
      avatarUrl: this.editAvatarUrl
    }).subscribe({
      next: () => { this.saving = false; },
      error: () => { this.saving = false; }
    });
  }
}
