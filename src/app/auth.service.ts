import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // Fixed URL - removed '/email' part
  private apiUrl = 'http://localhost:8080/api/email';
  
  constructor(private http: HttpClient) { }

  // Method to send contact form message
  sendMessage(formData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Prepare the data to match your DTO structure
    const contactData = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    };

    return this.http.post(`${this.apiUrl}/contact`, contactData, {
      headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Enhanced version with better error handling
  sendMessageWithErrorHandling(formData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const contactData = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    };

    return this.http.post(`${this.apiUrl}/contact`, contactData, {
      headers,
      responseType: 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling method
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Full error:', error);
    return throwError(() => new Error(errorMessage));
  }
}