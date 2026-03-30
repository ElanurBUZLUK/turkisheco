import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AnalyticsService } from './services/analytics.service';
import { SeoService } from './services/seo.service';
import { WriterAuthService } from './services/writer-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly analytics = inject(AnalyticsService);
  private readonly seo = inject(SeoService);

  constructor(
    public auth: AuthService,
    public writerAuth: WriterAuthService
  ) {
    this.analytics.initialize();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.applyRouteSeo();
        const navigation = event as NavigationEnd;
        this.analytics.trackPageView(navigation.urlAfterRedirects);
      });

    this.applyRouteSeo();
  }

  get adminDashboardRoute(): string {
    return this.auth.getAdminRoute();
  }

  logout() {
    this.auth.logout();
    this.writerAuth.logout();
  }

  private applyRouteSeo(): void {
    let route = this.activatedRoute.firstChild;

    while (route?.firstChild) {
      route = route.firstChild;
    }

    const data = route?.snapshot.data;
    if (!data?.['seo']) {
      return;
    }

    this.seo.update(data['seo']);
  }
}
