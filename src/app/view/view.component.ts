// app.component.ts
import { Component,OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

interface ExcelData {
  [key: string]: any;
}

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  userProfile: any = {};
  title = 'excel-column-mapper';
  
  // Page state
  currentPage: 'upload' | 'mapping' | 'result' | 'individual' = 'upload';
  
  // File and data
  selectedFile: File | null = null;
  excelData: ExcelData[] = [];
  availableColumns: string[] = [];
  
  // Dynamic fields extracted from email template (now mandatory)
  dynamicFields: string[] = [];
  
  // Email field selection
  includeEmailField: boolean = false;
  emailFieldKey: string = 'email_field';

  isSendingEmail: boolean = false;
  emailSentStatus: { [key: number]: 'sending' | 'sent' | 'failed' | null } = {};
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize with default template and extract fields
    this.extractFieldsFromEmailTemplate();
  }
    ngOnInit(): void {
    this.loadUserProfile();
  }

  // Method to load user profile
  loadUserProfile(): void {
    const token = this.authService.getToken();
    if (token) {
      this.authService.getProfile(token).subscribe(
        (profileData) => {
          this.userProfile = profileData;  // Update the userProfile with the data received
        },
        (error) => {
          console.error("Error fetching profile:", error);
          if (error.status === 401) {
            // If unauthorized, redirect to login
            this.router.navigate(['/login']);
          }
        }
      );
    } else {
      console.warn("No token found, redirecting to login.");
      this.router.navigate(['/login']);
    }
  }
  
  // Selected columns for mapping
  selectedColumns: { [key: string]: string } = {};
  
  // Final mapped data
  mappedData: any[] = [];
  
  // Individual data viewing
  currentDataIndex: number = 0;
  
  // Clickable columns functionality
  clickableSelectedColumns: string[] = [];
  
  // Email template with default value
  emailTemplate: string = `Subject - Let's Build Your Website & App – Take Your Domain to the Next Level with Qwegle!
Dear [Name],

I hope this message finds you well.

We noticed that you already have a registered domain — that's a great first step towards establishing a strong digital presence. At Qwegle Technology, we specialize in transforming domains into powerful and engaging websites and mobile applications tailored to your business needs.

Our experienced team offers:

Custom Website Development – Modern, responsive, and SEO-friendly designs.

Mobile Application Development – Android, iOS, or cross-platform solutions.

End-to-End Tech Support – From concept to launch and beyond.

Whether you're starting fresh or looking to revamp, we're here to turn your vision into a functional and visually impressive digital platform.

We'd love to discuss how Qwegle can help bring your domain to life. Please feel free to reply to this email or reach us directly at +91-88956 62216.

Looking forward to helping you build something exceptional!



Best regards,
Priyanka
Business Development Executive
Qwegle Technologies Pvt. Ltd.
📍3833, Nirupamalaya, Plot no. 516/1753, KIIT Rd, Patia, Bhubaneswar, Odisha 751024
📞 +91-88956 62216
🌐 www.qwegle.com | ✉️ info@qwegle.co`;

  // Default template for reset functionality
  private defaultEmailTemplate = this.emailTemplate;

  // Extract fields from square brackets in email template
  extractFieldsFromEmailTemplate() {
    const regex = /\[([^\]]+)\]/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(this.emailTemplate)) !== null) {
      const fieldName = match[1].trim();
      if (fieldName && !matches.includes(fieldName)) {
        matches.push(fieldName);
      }
    }
    
    this.dynamicFields = matches;
  }

  // Convert field name to a consistent key format
  convertToFieldKey(fieldName: string): string {
    return fieldName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  // Get display name from field key
  getFieldDisplayName(fieldKey: string): string {
    // Handle special email field
    if (fieldKey === this.emailFieldKey) {
      return 'Email';
    }
    
    // Find the original field name from dynamicFields
    const originalField = this.dynamicFields.find(field => 
      this.convertToFieldKey(field) === fieldKey
    );
    return originalField || fieldKey;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.readExcelFile(file);
    }
  }

  readExcelFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        // First row contains headers
        this.availableColumns = jsonData[0] as string[];
        
        // Convert data to objects
        const headers = jsonData[0] as string[];
        this.excelData = (jsonData.slice(1) as any[][]).map(row => {
          const obj: ExcelData = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Handle clicking on available columns
  onColumnClick(columnName: string) {
    const index = this.clickableSelectedColumns.indexOf(columnName);
    if (index > -1) {
      // Remove if already selected
      this.clickableSelectedColumns.splice(index, 1);
    } else {
      // Add if not selected
      this.clickableSelectedColumns.push(columnName);
    }
  }

  // Check if column is selected for clickable functionality
  isColumnSelected(columnName: string): boolean {
    return this.clickableSelectedColumns.includes(columnName);
  }

  // Get filtered columns based on clickable selections
  getFilteredColumnsForMapping(): string[] {
    return this.clickableSelectedColumns.length > 0 ? this.clickableSelectedColumns : this.availableColumns;
  }

  // Get dynamic field keys - all fields are now mandatory, plus optional email field
  getDynamicFieldKeys(): string[] {
    const fieldKeys = this.dynamicFields.map(field => this.convertToFieldKey(field));
    
    // Add email field if selected
    if (this.includeEmailField) {
      fieldKeys.push(this.emailFieldKey);
    }
    
    return fieldKeys;
  }

  // Check if a field is mandatory (square bracket fields are mandatory, email field is optional)
  isFieldMandatory(fieldKey: string): boolean {
    return fieldKey !== this.emailFieldKey;
  }

  // Handle email field checkbox change
  onEmailFieldToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.includeEmailField = target.checked;
    
    // Clear email field mapping if unchecked
    if (!target.checked && this.selectedColumns[this.emailFieldKey]) {
      delete this.selectedColumns[this.emailFieldKey];
    }
  }

  goToMapping() {
    if (!this.selectedFile || this.availableColumns.length === 0) {
      alert('Please select a valid Excel file first');
      return;
    }
    
    if (this.dynamicFields.length === 0) {
      alert('Please add dynamic fields to your email template using square brackets like [Name], [Email]');
      return;
    }
    
    this.currentPage = 'mapping';
  }

  onColumnMap(targetField: string, sourceColumn: string) {
    this.selectedColumns[targetField] = sourceColumn;
  }

  processData() {
    // Only check mandatory fields (square bracket fields)
    const dynamicFieldKeys = this.dynamicFields.map(field => this.convertToFieldKey(field));
    const unmappedMandatoryFields = dynamicFieldKeys.filter(field => !this.selectedColumns[field]);
    
    if (unmappedMandatoryFields.length > 0) {
      const displayNames = unmappedMandatoryFields.map(field => this.getFieldDisplayName(field));
      alert(`Please map all required fields: ${displayNames.join(', ')}`);
      return;
    }
    
    // Check if email field is selected but not mapped
    if (this.includeEmailField && !this.selectedColumns[this.emailFieldKey]) {
      alert('Please map the Email field or uncheck it if not needed');
      return;
    }
    
    // Map the data
    this.mappedData = this.excelData.map(row => {
      const mappedRow: any = {};
      
      // Map square bracket fields
      dynamicFieldKeys.forEach(field => {
        const sourceColumn = this.selectedColumns[field];
        mappedRow[field] = row[sourceColumn] || '';
      });
      
      // Map email field if selected
      if (this.includeEmailField) {
        const sourceColumn = this.selectedColumns[this.emailFieldKey];
        mappedRow[this.emailFieldKey] = row[sourceColumn] || '';
      }
      
      return mappedRow;
    });
    
    this.currentPage = 'result';
  }

  goBack() {
    if (this.currentPage === 'mapping') {
      this.currentPage = 'upload';
    } else if (this.currentPage === 'result') {
      this.currentPage = 'mapping';
    } else if (this.currentPage === 'individual') {
      this.currentPage = 'result';
    }
  }

  // reset() {
  //   this.currentPage = 'upload';
  //   this.selectedFile = null;
  //   this.excelData = [];
  //   this.availableColumns = [];
  //   this.clickableSelectedColumns = [];
  //   this.selectedColumns = {};
  //   this.mappedData = [];
  //   this.currentDataIndex = 0;
  //   this.includeEmailField = false;
  //   this.resetEmailTemplate();
  //   // Re-extract fields after reset
  //   this.extractFieldsFromEmailTemplate();
  // }

  // Email template methods with field extraction
  updateEmailTemplate(newTemplate: string) {
    this.emailTemplate = newTemplate;
    // Re-extract fields whenever template changes
    this.extractFieldsFromEmailTemplate();
  }

  resetEmailTemplate() {
    this.emailTemplate = this.defaultEmailTemplate;
    this.extractFieldsFromEmailTemplate();
  }

  // Individual data navigation methods
  goToIndividualView() {
    if (this.mappedData.length === 0) {
      alert('No data to display');
      return;
    }
    this.currentDataIndex = 0;
    this.currentPage = 'individual';
  }

  nextRecord() {
    if (this.currentDataIndex < this.mappedData.length - 1) {
      this.currentDataIndex++;
    }
  }

  previousRecord() {
    if (this.currentDataIndex > 0) {
      this.currentDataIndex--;
    }
  }

  getCurrentRecord() {
    return this.mappedData[this.currentDataIndex] || {};
  }

  // Get personalized email with dynamic field replacement
  getPersonalizedEmail(): string {
    const currentRecord = this.getCurrentRecord();
    let emailContent = this.emailTemplate;
    
    // Replace all dynamic fields in square brackets
    this.dynamicFields.forEach(fieldName => {
      const fieldKey = this.convertToFieldKey(fieldName);
      const fieldValue = currentRecord[fieldKey] || fieldName; // Use original field name as fallback
      const regex = new RegExp(`\\[${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
      emailContent = emailContent.replace(regex, fieldValue);
    });
    
    return emailContent;
  }

  copyEmailContent() {
    const personalizedEmail = this.getPersonalizedEmail();
    this.copyToClipboard(personalizedEmail, 'Email Content');
  }

  async copyToClipboard(text: string, fieldName: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopySuccess(fieldName);
    } catch (err) {
      // Fallback for older browsers
      this.fallbackCopyTextToClipboard(text, fieldName);
    }
  }

  private fallbackCopyTextToClipboard(text: string, fieldName: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopySuccess(fieldName);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert('Unable to copy to clipboard');
    }
    
    document.body.removeChild(textArea);
  }

  private showCopySuccess(fieldName: string) {
    const successMsg = document.createElement('div');
    successMsg.textContent = `${fieldName} copied to clipboard!`;
    successMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 1000;
      font-size: 14px;
    `;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      document.body.removeChild(successMsg);
    }, 2000);
  }

  exportToExcel() {
    if (this.mappedData.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(this.mappedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Processed Data');
    XLSX.writeFile(wb, 'processed_data.xlsx');
  }

  // private isValidEmail(email: string): boolean {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // }

  // private isValidPhone(phone: string): boolean {
  //   const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  //   return phoneRegex.test(phone.replace(/\s/g, ''));
  // }

  logout(): void {
    // Call the logout function from AuthService
    this.authService.logout();
    
    // Optional: Add any additional cleanup here
    
    // Redirect to login page (or home if preferred)
    this.router.navigate(['/login']); 
    
    // Optional: Show confirmation message
    console.log('Logged out successfully');
  }



  // Send email for current record
  async sendEmailForCurrentRecord(): Promise<void> {
    const currentRecord = this.getCurrentRecord();
    const emailField = this.includeEmailField ? currentRecord[this.emailFieldKey] : null;
    
    if (!emailField) {
      alert('No email address found for this record. Please ensure email field is mapped and contains valid email addresses.');
      return;
    }

    if (!this.isValidEmail(emailField)) {
      alert('Invalid email address: ' + emailField);
      return;
    }

    const confirmed = confirm(`Send email to: ${emailField}?`);
    if (!confirmed) return;

    this.isSendingEmail = true;
    this.emailSentStatus[this.currentDataIndex] = 'sending';

    try {
      const personalizedEmail = this.getPersonalizedEmail();
      const subject = this.authService.extractEmailSubject(personalizedEmail);
      const body = this.authService.formatEmailBody(personalizedEmail);

      const emailRequest = {
        toEmail: emailField,
        subject: subject,
        body: body,
        isHtml: false
      };

      await this.authService.sendEmail(emailRequest).toPromise();
      
      this.emailSentStatus[this.currentDataIndex] = 'sent';
      this.showEmailSuccess(`Email sent successfully to ${emailField}`);

    } catch (error) {
      console.error('Error sending email:', error);
      this.emailSentStatus[this.currentDataIndex] = 'failed';
      this.showEmailError('Failed to send email: ' + (error as any)?.message || 'Unknown error');
    } finally {
      this.isSendingEmail = false;
    }
  }

  // Send emails to all records (bulk email)
  async sendBulkEmails(): Promise<void> {
    if (!this.includeEmailField) {
      alert('Email field is not mapped. Please go back and include email field mapping.');
      return;
    }

    const emailRequests = [];
    const validRecords = [];

    // Prepare email requests for all records
    for (let i = 0; i < this.mappedData.length; i++) {
      const record = this.mappedData[i];
      const emailField = record[this.emailFieldKey];

      if (emailField && this.isValidEmail(emailField)) {
        // Create personalized email for this record
        const personalizedEmail = this.getPersonalizedEmailForRecord(record);
        const subject = this.authService.extractEmailSubject(personalizedEmail);
        const body = this.authService.formatEmailBody(personalizedEmail);

        emailRequests.push({
          toEmail: emailField,
          subject: subject,
          body: body,
          isHtml: false
        });
        validRecords.push(i);
      }
    }

    if (emailRequests.length === 0) {
      alert('No valid email addresses found in the data.');
      return;
    }

    const confirmed = confirm(`Send emails to ${emailRequests.length} recipients?`);
    if (!confirmed) return;

    this.isSendingEmail = true;

    // Set all valid records to sending status
    validRecords.forEach(index => {
      this.emailSentStatus[index] = 'sending';
    });

    try {
      const response = await this.authService.sendBulkEmails(emailRequests).toPromise();
      
      // Set all to sent status
      validRecords.forEach(index => {
        this.emailSentStatus[index] = 'sent';
      });

      this.showEmailSuccess(`Bulk email completed: ${response}`);

    } catch (error) {
      console.error('Error sending bulk emails:', error);
      
      // Set all to failed status
      validRecords.forEach(index => {
        this.emailSentStatus[index] = 'failed';
      });

      this.showEmailError('Failed to send bulk emails: ' + (error as any)?.message || 'Unknown error');
    } finally {
      this.isSendingEmail = false;
    }
  }

  // Get personalized email for specific record
  getPersonalizedEmailForRecord(record: any): string {
    let emailContent = this.emailTemplate;
    
    // Replace all dynamic fields in square brackets
    this.dynamicFields.forEach(fieldName => {
      const fieldKey = this.convertToFieldKey(fieldName);
      const fieldValue = record[fieldKey] || fieldName; // Use original field name as fallback
      const regex = new RegExp(`\\[${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
      emailContent = emailContent.replace(regex, fieldValue);
    });
    
    return emailContent;
  }

  // Get email status for current record
  getCurrentEmailStatus(): 'sending' | 'sent' | 'failed' | null {
    return this.emailSentStatus[this.currentDataIndex] || null;
  }

  // Check if current record has email
  currentRecordHasEmail(): boolean {
    if (!this.includeEmailField) return false;
    const currentRecord = this.getCurrentRecord();
    const emailField = currentRecord[this.emailFieldKey];
    return emailField && this.isValidEmail(emailField);
  }

  // Get current record's email
  getCurrentRecordEmail(): string {
    if (!this.includeEmailField) return '';
    const currentRecord = this.getCurrentRecord();
    return currentRecord[this.emailFieldKey] || '';
  }

  // Show email success message
  private showEmailSuccess(message: string) {
    const successMsg = document.createElement('div');
    successMsg.textContent = message;
    successMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      if (document.body.contains(successMsg)) {
        document.body.removeChild(successMsg);
      }
    }, 4000);
  }

  // Show email error message
  private showEmailError(message: string) {
    const errorMsg = document.createElement('div');
    errorMsg.textContent = message;
    errorMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
      if (document.body.contains(errorMsg)) {
        document.body.removeChild(errorMsg);
      }
    }, 5000);
  }

  // Enhanced validation methods
  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  private isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Reset email status when starting over
  reset() {
    this.currentPage = 'upload';
    this.selectedFile = null;
    this.excelData = [];
    this.availableColumns = [];
    this.clickableSelectedColumns = [];
    this.selectedColumns = {};
    this.mappedData = [];
    this.currentDataIndex = 0;
    this.includeEmailField = false;
    this.isSendingEmail = false;
    this.emailSentStatus = {}; // Reset email status
    this.resetEmailTemplate();
    this.extractFieldsFromEmailTemplate();
  }
}