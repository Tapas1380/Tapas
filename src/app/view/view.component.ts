// app.component.ts

import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy {
  title = 'Angular Portfolio';
  
 @ViewChild('navbar', { static: true }) navbar!: ElementRef;
  @ViewChild('scrollTop', { static: true }) scrollTop!: ElementRef;
  @ViewChild('navMenu', { static: true }) navMenu!: ElementRef;

  contactForm: FormGroup;
  isSubmitting = false;
  
  // Portfolio data
  skills = [
    { icon: '☕', name: 'Java & Spring Boot', progress: 92 },
    { icon: '🅰️', name: 'Angular', progress: 88 },
    { icon: '📝', name: 'TypeScript', progress: 85 },
    { icon: '🗄️', name: 'MySQL & MongoDB', progress: 80 },
    { icon: '🐳', name: 'Docker & Kubernetes', progress: 75 },
    { icon: '☁️', name: 'AWS & Azure', progress: 70 }
  ];

  projects = [
    {
      title: 'Enterprise E-Commerce Platform',
      description: 'Full-stack e-commerce solution with microservices architecture, featuring user authentication, payment integration, and admin dashboard.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&auto=format&q=80',
      technologies: ['Spring Boot', 'Angular', 'MySQL', 'Redis'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Project Management System',
      description: 'Collaborative project management tool with real-time updates, task tracking, and team collaboration features.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop&auto=format&q=80',
      technologies: ['Spring Boot', 'Angular', 'WebSocket', 'PostgreSQL'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Business Analytics Dashboard',
      description: 'Interactive analytics platform with data visualization, reporting, and business intelligence capabilities.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&auto=format&q=80',
      technologies: ['Spring Boot', 'Angular', 'Chart.js', 'MongoDB'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Digital Banking System',
      description: 'Secure banking application with transaction management, account handling, and comprehensive security features.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop&auto=format&q=80',
      technologies: ['Spring Security', 'Angular', 'JWT', 'PostgreSQL'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Inventory Management System',
      description: 'Enterprise inventory solution with stock tracking, supplier management, and automated reorder functionality.',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=250&fit=crop&auto=format&q=80',
      technologies: ['Spring Boot', 'Angular', 'MySQL', 'Docker'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Learning Management System',
      description: 'Educational platform with course management, student tracking, and interactive learning modules.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&auto=format&q=80',
      technologies: ['Spring Boot', 'Angular', 'MongoDB', 'AWS S3'],
      github: '#',
      demo: '#'
    }
  ];

  stats = [
    { value: '15+', label: 'Projects Completed' },
    { value: '3+', label: 'Years Experience' },
    { value: '50+', label: 'Happy Clients' }
  ];

  contactInfo = {
    email: 'tapasranjanhr@gmail.com',
    phone: '+91 8290684273',
    location: 'Bhubaneswar, Odisha, India'
  };

  socialLinks = [
    { icon: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/tapas-ranjan-sahoo-0365ba178/' },
    { icon: 'fab fa-github', url: 'https://github.com/dashboard' },
    { icon: 'fab fa-facebook', url: '#' },
    { icon: 'fab fa-instagram', url: 'https://www.instagram.com/mr__tps/' }
  ];

  private scrollListener!: () => void;
  private observer!: IntersectionObserver;
 
  constructor( private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

downloadResume(): void {
    // Option 1: Direct link to resume file in assets folder
    const resumeUrl = 'assets/TAPAS_RESUME.pdf';
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = 'Tapas-Ranjan-Resume.pdf';
    link.click();
  }

  ngOnInit(): void {
    this.initializeScrollEffects();
    this.initializeIntersectionObserver();
    // this.initializeSkillAnimation();
    this.animateSkillBars();
  
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private initializeScrollEffects(): void {
    this.scrollListener = () => {
      this.handleNavbarScroll();
      this.handleScrollToTopButton();
    };
    window.addEventListener('scroll', this.scrollListener);
  }
// Remove the animateSkillBars() method completely and replace it with this:

// Replace your current animation method with this:

private initializeSkillAnimation(): void {
  // Create an IntersectionObserver for the skills section
  const skillsSection = document.getElementById('skills');
  const skillBars = document.querySelectorAll('.skill-progress');

  if (!skillsSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // When skills section is visible
        skillBars.forEach((bar, index) => {
          const element = bar as HTMLElement;
          const targetWidth = element.getAttribute('data-width');
          
          // Reset to 0% and then animate to target width
          element.style.transition = 'none';
          element.style.width = '0%';
          
          // Force reflow
          void element.offsetWidth;
          
          // Set transition and animate
          element.style.transition = `width 1.5s ease-out ${index * 0.1}s`;
          element.style.width = `${targetWidth}%`;
        });
        
        // Stop observing after animation starts
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(skillsSection);
}
  private handleNavbarScroll(): void {
    const navbar = this.navbar.nativeElement;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  private handleScrollToTopButton(): void {
    const scrollTopBtn = this.scrollTop.nativeElement;
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  }

  private initializeIntersectionObserver(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements after view initialization
    setTimeout(() => {
      document.querySelectorAll('.skill-card, .project-card, .contact-item').forEach(el => {
        const element = el as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        this.observer.observe(element);
      });
    }, 100);
  }

  private animateSkillBars(): void {
    const animateSkills = () => {
      const skillBars = document.querySelectorAll('.skill-progress');
      skillBars.forEach(bar => {
        const barTop = bar.getBoundingClientRect().top;
        const barBottom = bar.getBoundingClientRect().bottom;
        const isVisible = barTop < window.innerHeight && barBottom > 0;
        
        if (isVisible) {
          const element = bar as HTMLElement;
          const width = element.style.width;
          element.style.width = '0%';
          setTimeout(() => {
            element.style.width = width;
          }, 200);
        }
      });
    };

    window.addEventListener('scroll', animateSkills);
  }

  toggleMobileMenu(): void {
    const navMenu = this.navMenu.nativeElement;
    navMenu.classList.toggle('active');
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Close mobile menu if open
    const navMenu = this.navMenu.nativeElement;
    navMenu.classList.remove('active');
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

   onSubmit(): void {
  if (this.contactForm.valid) {
    this.isSubmitting = true;
    const formData = this.contactForm.value;
    console.log('Form submitted:', formData);
    
    // Use the improved method with error handling
    this.authService.sendMessageWithErrorHandling(formData).subscribe({
      next: (response) => {
        console.log('Success:', response);
        this.showSuccessMessage();
        this.contactForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.showErrorMessage(error.message);
        this.isSubmitting = false;
      }
    });
  } else {
    this.markFormGroupTouched();
  }
}

  private showSuccessMessage(): void {
    alert('Thank you for your message! I will get back to you soon.');
  }

  private showErrorMessage(message?: string): void {
    const errorMsg = message || 'Sorry, there was an error sending your message. Please try again.';
    alert(errorMsg);
  }
  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }
}