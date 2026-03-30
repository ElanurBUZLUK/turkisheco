import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { AccountLoginComponent } from '../account/account-login.component';
import { AdminDashboardComponent } from './admin-dashboard.component';

@Component({
  selector: 'app-admin-entry',
  standalone: true,
  imports: [CommonModule, AccountLoginComponent, AdminDashboardComponent],
  templateUrl: './admin-entry.component.html',
  styleUrl: './admin-entry.component.scss',
})
export class AdminEntryComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  isBootstrappingAdmin = false;
  bootstrapFailed = false;

  ngOnInit(): void {
    if (!this.auth.isSuperAdmin()) {
      this.tryAutoLogin();
      return;
    }

    const routeUserName = this.route.snapshot.paramMap.get('username');
    const currentUser = this.auth.getCurrentUser();

    if (!routeUserName || !currentUser) {
      return;
    }

    if (routeUserName.toLowerCase() !== currentUser.userName.toLowerCase()) {
      this.router.navigateByUrl(this.auth.getAdminRoute());
    }
  }

  get isAuthenticatedAdmin(): boolean {
    return this.auth.isSuperAdmin();
  }

  get requestedUserName(): string {
    return this.route.snapshot.paramMap.get('username') ?? 'Ela';
  }

  private tryAutoLogin(): void {
    const autoLogin = environment.adminAutoLogin as
      | { userNameOrEmail: string; password: string }
      | null;
    if (!autoLogin) {
      this.bootstrapFailed = true;
      return;
    }

    if (this.requestedUserName.toLowerCase() !== autoLogin.userNameOrEmail.toLowerCase()) {
      this.bootstrapFailed = true;
      return;
    }

    this.isBootstrappingAdmin = true;
    this.bootstrapFailed = false;

    this.auth.login(autoLogin).subscribe({
      next: () => {
        this.isBootstrappingAdmin = false;
        if (this.auth.isSuperAdmin()) {
          return;
        }

        this.bootstrapFailed = true;
      },
      error: () => {
        this.isBootstrappingAdmin = false;
        this.bootstrapFailed = true;
      },
    });
  }
}
