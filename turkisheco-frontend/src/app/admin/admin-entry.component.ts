import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AccountLoginComponent } from '../account/account-login.component';

@Component({
  selector: 'app-admin-entry',
  standalone: true,
  imports: [CommonModule, AccountLoginComponent],
  templateUrl: './admin-entry.component.html',
  styleUrl: './admin-entry.component.scss',
})
export class AdminEntryComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.auth.isSuperAdmin()) {
      return;
    }

    const routeUserName = this.route.snapshot.paramMap.get('username');
    const currentUser = this.auth.getCurrentUser();

    if (!routeUserName || !currentUser) {
      return;
    }

    if (routeUserName.toLowerCase() !== currentUser.userName.toLowerCase()) {
      this.router.navigateByUrl(this.auth.getAdminRoute());
      return;
    }

    this.router.navigateByUrl(this.auth.getAdminDashboardRoute());
  }

  get requestedUserName(): string {
    return this.route.snapshot.paramMap.get('username') ?? 'Ela';
  }
}
