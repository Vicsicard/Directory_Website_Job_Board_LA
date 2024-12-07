import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveInquiry } from '@/utils/inquiryDb';
import { rateLimit } from '@/utils/rateLimiter';

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const timezones = Intl.supportedValuesOf('timeZone');

const inquirySchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  preferredContact: z.enum(['email', 'phone', 'both']),
  
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  
  inquiryType: z.enum(['general', 'business', 'partnership', 'support', 'other']),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  urgency: z.enum(['low', 'medium', 'high']),
  
  budget: z.string().optional(),
  timeline: z.string().optional(),
  referralSource: z.string().optional(),
  
  newsletterOptIn: z.boolean(),
  followUpPreference: z.enum(['morning', 'afternoon', 'evening', 'anytime']),
  timezone: z.string().refine((val) => timezones.includes(val), 'Invalid timezone'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = inquirySchema.parse(body);

    // Add system fields
    const inquiryData = {
      ...validatedData,
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'new' as const
    };

    // Save to database
    const result = await saveInquiry(inquiryData);

    // Send email notification (implement this based on your email service)
    // await sendNotificationEmail(inquiryData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Inquiry submission error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Invalid form data',
          errors: error.errors.reduce((acc, curr) => ({
            ...acc,
            [curr.path.join('.')]: curr.message
          }), {})
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
