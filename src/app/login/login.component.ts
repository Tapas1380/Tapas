/*import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

declare const google: any; // Declare Google object from Sign-In SDK

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit{
  email: string = '';
  password: string = '';
  passwordVisible: boolean = false;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeGoogleSignIn();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  navigateToRegister() {
    this.router.navigate(['/register'], { queryParams: { subscribeAlert: 'true' } });
  }

  onLogin() {
    const credentials = { email: this.email, password: this.password };
    this.loading = true;
    
    this.authService.login(credentials).subscribe(
      response => {
        console.log('Login successful:', response);
        alert('Login successful!');
        this.authService.saveToken(response.token); // Save token after login
        this.router.navigate(['/view']); // Navigate to the home page after login
        
        this.loading = false;
        
      },
      error => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.loading = false;
      }
    );
  } 
   

  initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleSignIn(response),
    });
    google.accounts.id.renderButton(
      document.querySelector('.google-login'),
      { 
        theme: 'outline',  // Use 'outline' theme to show the border
        size: 'large'
      }
    );
   
  }

  handleGoogleSignIn(response: any) {
    const idToken = response.credential; // Google ID token
    this.authService.googleLogin(idToken).subscribe(
      (res) => {
        this.authService.saveToken(res.token); // Save JWT token
        this.router.navigate(['/view']); // Redirect to dashboard
      },
      (err) => {
        this.errorMessage = 'Google login failed. Please try again.';
      }
    );
  }
}*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // Import AuthService for API calls

declare const google: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';            // Stores the email entered by the user
  password: string = '';         // Stores the password entered by the user
  passwordVisible: boolean = false; // Used for toggling password visibility
  errorMessage: string = '';      // Displays an error message if login fails
  loading: boolean = false;      // For loading state
  
  
  constructor(
    private authService: AuthService, // Inject AuthService to make login API calls
    private router: Router            // Inject Router to navigate on successful login
  ) {}

  ngOnInit(): void {
    // Initialize Google Sign-In
    google.accounts.id.initialize({
      client_id: '530072404641-g0pceu5ggpqgf762h2e4hnel78e3ackb.apps.googleusercontent.com',  // Replace with your Google Client ID
      callback: this.handleGoogleSignIn.bind(this),  // Handle the response
    });
    
   
    // Render the Google Sign-In button
    google.accounts.id.renderButton(
      document.getElementById('googleSignInButton')!,  // Specify the element
      {       theme: 'filled_blue', // Available themes: 'outline', 'filled_blue', etc.
        size: 'large',        // Options: 'small', 'medium', 'large'
        text: 'continue_with',  // Options: 'signin', 'signup', 'continue_with', etc.
        shape: 'pill' }        // Options: 'rectangular', 'pill' }  // Button customization options
    ); // Manually triggers the Google Sign-In popup 
    
  }
 
  
  // Toggle the password visibility
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }


  
  onLogin() {
    const credentials = { email: this.email, password: this.password };
    this.loading = true;
    
    this.authService.login(credentials).subscribe(
      response => {
        console.log('Login successful:', response);
       // alert('Login successful!');
        this.authService.saveToken(response.token); // Save token after login
        this.router.navigate(['/view']); // Navigate to the home page after login
        
        this.loading = false;
        
      },
      error => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.loading = false;
      }
    );
  } 
  handleGoogleSignIn(response: any): void {
    console.log('Google Sign-In Response:', response);
  
    // Extract the Google token from the response
    const googleToken = response.credential;
    
    // Use Google's library to decode the token and extract user information
    const userInfo = JSON.parse(atob(googleToken.split('.')[1])); // Decode JWT payload
    const email = userInfo.email;
    console.log('Google Token:', googleToken);
    console.log('User Email:', email);
  
    // Now send both the email and the token to the backend for authentication
    this.authService.loginWithGoogle({ googleToken, email }).subscribe(
      (response) => {
        // On success, handle the response (e.g., store the user token, navigate)
        console.log('User logged in successfully:', response);
        //alert('Login successful!');
        // Example: Store user data in localStorage
        localStorage.setItem('authToken', response.token);
        
        // Navigate to the dashboard or home page after successful login
        this.router.navigate(['/view']);
      },
      (error) => {
        // On error, display the error message
        console.error('Login failed:', error);
        this.errorMessage = 'Failed to log in with Google. Please try again.';
      }
    );
  }
}
 



