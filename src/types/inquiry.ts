export interface InquiryFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: 'email' | 'phone' | 'both';

  // Company Information (Optional)
  companyName?: string;
  jobTitle?: string;
  website?: string;

  // Inquiry Details
  inquiryType: 'general' | 'business' | 'partnership' | 'support' | 'other';
  subject: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';

  // Additional Information
  budget?: string;
  timeline?: string;
  referralSource?: string;

  // Preferences
  newsletterOptIn: boolean;
  followUpPreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
  timezone: string;

  // System Fields
  createdAt: Date;
  updatedAt: Date;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  ipAddress?: string;
  userAgent?: string;
}

export interface InquiryResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
  errors?: Record<string, string>;
}

export interface InquiryValidationError {
  field: string;
  message: string;
}
