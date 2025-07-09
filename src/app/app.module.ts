import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './auth.service';
import { ViewComponent } from './view/view.component';
import { CorsInterceptor } from './cors.interceptor'; // Adjust the path if needed

import { AppComponent } from './app.component';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Define routes for navigation
const routes: Routes= [
  { path: '', redirectTo: '/view', pathMatch: 'full' },
  
 
  { path: 'view', component: ViewComponent },
  
  
];

@NgModule({
  declarations: [
    AppComponent,
    
    ViewComponent,
    
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(routes),  // Initialize routing with the defined routes
    HttpClientModule,
    FormsModule,
    
    
    ReactiveFormsModule 
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy },  {
      provide: HTTP_INTERCEPTORS,
      useClass: CorsInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent]
})
export class AppModule { 
    constructor() {
    library.add(fas, fab);
  }
}
