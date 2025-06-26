import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = ''; // Reset token from the URL
  newPassword: string = ''; // Stores the new password entered by the user
  confirmPassword: string = ''; // Stores the confirmed password entered by the user
  errorMessage: string = ''; // Displays error message if reset fails
  successMessage: string = ''; // Displays success message if reset is successful
  passwordMismatch: string = ''; // Displays an error message if passwords do not match

  constructor(
    private route: ActivatedRoute, // To retrieve token from the URL
    private authService: AuthService, // Service to handle API calls
    private router: Router // For navigation
  ) {}

  ngOnInit(): void {
    // Retrieve the token from the URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  // Handle the reset password action
  onResetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = "Passwords do not match!";
      return;
    }

    // Reset password request payload
    const resetRequest = {
      token: this.token,
      newPassword: this.newPassword
    };

    // Call AuthService to reset password
    this.authService.resetPassword(resetRequest).subscribe(
      response => {
        this.successMessage = 'Password reset successful. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 3000); // Redirect after 3 seconds
      },
      error => {
        this.errorMessage = 'Password reset failed. Please try again.';
        console.error('Reset password error:', error);
      }
    );
  }
}
