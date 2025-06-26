import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // Adjust path as needed

interface User {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  passwordMismatch: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    // Reset error messages
    this.passwordMismatch = '';
    this.errorMessage = '';

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Check password match
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = 'Passwords do not match';
      return;
    }

    // Prepare user object
    const user: User = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password
    };

    this.isLoading = true;

    // Call registration service
    this.authService.register(user).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isLoading = false;
        
        // Handle successful registration
        // You might want to show a success message or redirect
        alert('Registration successful! Please log in.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.isLoading = false;
        
        // Handle different error scenarios
        if (error.status === 400) {
          this.errorMessage = error.error.message || 'Invalid registration data';
        } else if (error.status === 409) {
          this.errorMessage = 'Email already exists';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }

  private validateForm(): boolean {
    // Basic validation
    if (!this.name.trim()) {
      this.errorMessage = 'Full name is required';
      return false;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (!this.password) {
      this.errorMessage = 'Password is required';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return false;
    }

    if (!this.confirmPassword) {
      this.errorMessage = 'Please confirm your password';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Optional: Clear error messages when user starts typing
  onInputChange(): void {
    this.errorMessage = '';
    this.passwordMismatch = '';
  }
}