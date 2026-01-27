import { Component, effect, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  currentYear = new Date().getFullYear();

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Redirect logged-in users to their organizations
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.router.navigate(['/organisationen']);
      }
    });
  }
}
