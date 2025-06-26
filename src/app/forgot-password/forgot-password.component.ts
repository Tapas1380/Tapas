import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';  // Declare email as a class property
  errorMessage: string = '';  // Error message property
  successMessage: string = '';  // Success message property

  constructor(private authService: AuthService) {}

  // Handle the forgot password request
  onForgotPassword() {
    // Reset previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Call forgotPassword from AuthService with the email
    this.authService.forgotPassword({ email: this.email }).subscribe(
      response => {
        this.successMessage = 'Password reset email sent. Check your inbox.';
      },
      error => {
        this.errorMessage = 'Unable to send reset link. Please try again.';
        console.error('Forgot password error:', error);
      }
    );
  }
}