import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './models/user.model';

interface EmailRequest {
  toEmail: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface EmailResponse {
  success: boolean;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://excel-bulk-mail-backend.onrender.com/api/auth'; // Update with your backend URL
  private emailApiUrl = 'https://excel-bulk-mail-backend.onrender.com/api/email';

  constructor(private http: HttpClient) { }


  // Upload PDF and process it
  uploadPdf(fileData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, fileData, { responseType: 'text' });
  }

   // Forgot password
   forgotPassword(request: { email: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, request);
  }
  // Reset password
  resetPassword(request: { token: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, request);
  }

 // Method to send Google token to the backend
 loginWithGoogle(data: { googleToken: string; email: string }): Observable<any> {
    // Send both the Google token and email to the backend
    return this.http.post<any>(`${this.apiUrl}/google-login`, data);
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }
  verify(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify`, user);
  }
  register(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }
 // Create Stripe session
 createStripeSession(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-session`, {});
}
  
  
    getProfile(token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<any>(`${this.apiUrl}/profile`, { token }, { headers });
      }

  logout(): void {
    // Remove the token from localStorage or sessionStorage
    localStorage.removeItem('authToken');
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token); // Save the token in localStorage
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

   // Send single email
  sendEmail(emailRequest: EmailRequest): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.emailApiUrl}/send`, emailRequest, { 
      headers, 
      responseType: 'text' 
    });
  }
  
  // Send bulk emails
  sendBulkEmails(emailRequests: EmailRequest[]): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.emailApiUrl}/send-bulk`, emailRequests, { 
      headers, 
      responseType: 'text' 
    });
  }
  
  // Helper method to get authorization headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }
  
  // Utility method to extract subject from email content
  extractEmailSubject(emailContent: string): string {
    const lines = emailContent.split('\n');
    const subjectLine = lines.find(line => line.toLowerCase().startsWith('subject'));
    
    if (subjectLine) {
      return subjectLine.replace(/^subject\s*[-–]\s*/i, '').trim();
    }
    
    return 'Email from Qwegle Technologies'; // Default subject
  }
  
  // Utility method to format email content (remove subject line from body)
  formatEmailBody(emailContent: string): string {
    const lines = emailContent.split('\n');
    const subjectLineIndex = lines.findIndex(line => line.toLowerCase().startsWith('subject'));
    
    if (subjectLineIndex !== -1) {
      // Remove subject line and return the rest
      lines.splice(subjectLineIndex, 1);
      return lines.join('\n').trim();
    }
    
    return emailContent;
  }
}