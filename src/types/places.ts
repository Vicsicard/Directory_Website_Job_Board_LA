export interface Location {
  lat: number;
  lng: number;
}

export interface Photo {
  photo_reference: string;
  height: number;
  width: number;
  html_attributions?: string[];
  main_photo?: boolean;
  category?: 'interior' | 'exterior' | 'food' | 'menu' | 'team' | 'other';
}

export interface Review {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  language?: string;
  helpful_votes?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface OpeningHours {
  open_now: boolean;
  weekday_text: string[];
  periods: Array<{
    open: {
      day: number;
      time: string;
      formatted: string;
    };
    close?: {
      day: number;
      time: string;
      formatted: string;
    } | null;
  }>;
  special_hours?: Array<{
    date: string;
    status: 'closed' | 'holiday' | 'reduced_hours';
    open_time?: string;
    close_time?: string;
    note?: string;
  }>;
  holiday_hours?: Record<string, {
    is_open: boolean;
    open_time?: string;
    close_time?: string;
    note?: string;
  }>;
}

export interface PriceLevel {
  level: number;
  description: string;
  price_range?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface ContactInfo {
  formatted_phone_number: string | null;
  international_phone_number: string | null;
  website: string | null;
  email?: string | null;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    yelp?: string;
  };
  messaging_platforms?: {
    whatsapp?: string;
    messenger?: string;
    telegram?: string;
    wechat?: string;
  };
}

export interface Accessibility {
  wheelchair_accessible_entrance: boolean;
  wheelchair_accessible_parking: boolean;
  wheelchair_accessible_restroom: boolean;
  wheelchair_accessible_seating: boolean;
  service_animal_allowed: boolean;
  braille_menu_available: boolean;
  staff_assistance_available: boolean;
}

export interface BusinessMetadata {
  // Service Options
  curbside_pickup: boolean;
  delivery: boolean;
  dine_in: boolean;
  takeout: boolean;
  drive_thru: boolean;
  online_ordering: boolean;
  catering: boolean;
  private_events: boolean;

  // Food & Dining
  serves_breakfast: boolean;
  serves_lunch: boolean;
  serves_dinner: boolean;
  serves_brunch: boolean;
  serves_coffee: boolean;
  serves_vegetarian_food: boolean;
  serves_vegan_food: boolean;
  serves_halal: boolean;
  serves_kosher: boolean;
  serves_alcohol: boolean;
  byob_allowed: boolean;

  // Amenities
  wifi_available: boolean;
  parking_available: boolean;
  reservations_required: boolean;
  reservations_recommended: boolean;
  outdoor_seating: boolean;
  live_music: boolean;
  tv_available: boolean;
  family_friendly: boolean;
  dog_friendly: boolean;
  smoking_allowed: boolean;

  // Payment Options
  accepts_credit_cards: boolean;
  accepts_cash: boolean;
  accepts_mobile_payments: boolean;
  accepts_checks: boolean;
  accepts_crypto: boolean;

  // Business Attributes
  woman_owned: boolean;
  minority_owned: boolean;
  veteran_owned: boolean;
  locally_owned: boolean;
  chain: boolean;
  franchise: boolean;

  // Safety & Cleanliness
  health_score?: number;
  last_inspection_date?: string;
  covid_safety_measures: boolean;
  enhanced_cleaning: boolean;
  mask_required: boolean;
}

export interface BusinessHours {
  regular_hours: OpeningHours;
  holiday_schedule?: Record<string, {
    is_open: boolean;
    hours?: string;
    note?: string;
  }>;
  seasonal_hours?: Array<{
    start_date: string;
    end_date: string;
    hours: OpeningHours;
    note?: string;
  }>;
}

export interface Certification {
  name: string;
  issuer: string;
  issued_date: string;
  expiry_date?: string;
  verification_url?: string;
}

export interface Insurance {
  type: string;
  provider: string;
  coverage_amount: string;
  expiry_date: string;
}

export interface BusinessLicense {
  license_number: string;
  type: string;
  issuing_authority: string;
  issued_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'suspended' | 'pending';
}

export interface ServiceArea {
  radius_km: number;
  cities: string[];
  zip_codes: string[];
  states: string[];
  country: string;
}

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  location: Location;
  types: string[];
  business_status: string;
  rating: number;
  user_ratings_total: number;
  price_level: PriceLevel;
  opening_hours: BusinessHours;
  photos: Photo[];
  reviews: Review[];
  contact_info: ContactInfo;
  accessibility: Accessibility;
  metadata: BusinessMetadata;
  last_updated: string;

  // Business Verification
  verified: boolean;
  verification_timestamp?: string;
  certifications?: Certification[];
  insurance?: Insurance[];
  licenses?: BusinessLicense[];

  // Service Coverage
  service_area?: ServiceArea;
  multiple_locations?: Array<{
    name: string;
    address: string;
    phone: string;
    distance_km?: number;
  }>;

  // Enhanced Features
  specialties?: string[];
  languages_spoken?: string[];
  staff_count?: number;
  year_established?: number;
  parking_options?: {
    street: boolean;
    lot: boolean;
    valet: boolean;
    garage: boolean;
    free: boolean;
    validated: boolean;
  };

  // Dynamic Data
  current_wait_time?: number;
  occupancy_level?: 'low' | 'medium' | 'high';
  popular_times?: Record<string, Array<{
    hour: number;
    occupancy_percentage: number;
  }>>;
  
  // Calculated Fields
  distance?: number;
  is_open?: boolean;
  price_range?: string;
  rating_text?: string;
  features?: string[];
  social_links?: Record<string, string>;
  
  // Business Response
  business_response?: {
    last_response_date: string;
    average_response_time_hours: number;
    response_rate_percentage: number;
  };
}

export interface PlacesApiResponse {
  results: PlaceResult[];
  status: string;
  next_page_token?: string;
  error_message?: string;
}

export interface CachedPlacesData {
  query: string;
  results: PlaceResult[];
  status: string;
  expiresAt: Date;
  lastUpdated: Date;
  metadata: {
    status: string;
    nextPageToken: string | null;
  };
}
