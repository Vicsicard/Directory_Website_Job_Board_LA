import { PlaceResult, Location, Photo, BusinessMetadata, BusinessHours } from '@/types/places';
import { Place } from './placesApi';

interface Location {
  lat: number;
  lng: number;
}

interface Photo {
  photo_reference: string;
  height: number;
  width: number;
  html_attributions?: string[];
  category?: string;
  main_photo?: boolean;
}

interface Review {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  sentiment?: string;
  language?: string;
  helpful_votes?: number;
}

interface PriceLevel {
  level: number;
  description: string;
}

const PRICE_LEVEL_MAP: Record<number, PriceLevel> = {
  0: { level: 0, description: 'Free' },
  1: { level: 1, description: 'Inexpensive' },
  2: { level: 2, description: 'Moderate' },
  3: { level: 3, description: 'Expensive' },
  4: { level: 4, description: 'Very Expensive' }
};

const BUSINESS_STATUS_MAP: Record<string, string> = {
  'OPERATIONAL': 'Open',
  'CLOSED_TEMPORARILY': 'Temporarily Closed',
  'CLOSED_PERMANENTLY': 'Permanently Closed',
  'CLOSED': 'Closed'
};

function calculateDistance(origin: Location, destination: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lng - origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

function extractFeatures(place: any): string[] {
  const features: string[] = [];
  
  // Service Features
  if (place.business_status === 'OPERATIONAL') features.push('Currently Operating');
  if (place.opening_hours?.open_now) features.push('Open Now');
  if (place.metadata?.delivery) features.push('Delivery Available');
  if (place.metadata?.takeout) features.push('Takeout Available');
  if (place.metadata?.dine_in) features.push('Dine-in Available');
  
  // Payment Features
  if (place.metadata?.accepts_credit_cards) features.push('Accepts Credit Cards');
  if (place.metadata?.accepts_mobile_payments) features.push('Mobile Payments');
  
  // Amenities
  if (place.metadata?.wifi_available) features.push('Free WiFi');
  if (place.metadata?.parking_available) features.push('Parking Available');
  if (place.metadata?.outdoor_seating) features.push('Outdoor Seating');
  
  // Accessibility
  if (place.accessibility?.wheelchair_accessible_entrance) {
    features.push('Wheelchair Accessible');
  }
  
  // Business Attributes
  if (place.metadata?.woman_owned) features.push('Woman-Owned Business');
  if (place.metadata?.minority_owned) features.push('Minority-Owned Business');
  if (place.metadata?.veteran_owned) features.push('Veteran-Owned Business');
  if (place.metadata?.locally_owned) features.push('Locally Owned');
  
  return features;
}

function extractSocialLinks(place: any): Record<string, string> {
  const socialLinks: Record<string, string> = {};
  
  if (place.contact_info?.social_media) {
    Object.entries(place.contact_info.social_media).forEach(([platform, url]) => {
      if (url) socialLinks[platform] = url as string;
    });
  }
  
  return socialLinks;
}

function categorizePhotos(photos: Photo[]): Photo[] {
  return photos.map((photo, index) => {
    let category: Photo['category'] = 'other';
    
    // Simple heuristic - can be improved with ML
    if (index === 0) {
      photo.main_photo = true;
      category = 'exterior';
    } else if (photo.html_attributions?.some(attr => 
      attr.toLowerCase().includes('interior') || 
      attr.toLowerCase().includes('inside'))) {
      category = 'interior';
    } else if (photo.html_attributions?.some(attr => 
      attr.toLowerCase().includes('food') || 
      attr.toLowerCase().includes('dish') || 
      attr.toLowerCase().includes('meal'))) {
      category = 'food';
    } else if (photo.html_attributions?.some(attr => 
      attr.toLowerCase().includes('menu'))) {
      category = 'menu';
    } else if (photo.html_attributions?.some(attr => 
      attr.toLowerCase().includes('team') || 
      attr.toLowerCase().includes('staff'))) {
      category = 'team';
    }
    
    return { ...photo, category };
  });
}

function processBusinessHours(hours: any): BusinessHours {
  const businessHours: BusinessHours = {
    regular_hours: hours,
    holiday_schedule: {},
    seasonal_hours: []
  };

  // Add holiday hours if available
  if (hours.holiday_hours) {
    businessHours.holiday_schedule = hours.holiday_hours;
  }

  // Add special seasonal hours
  const currentDate = new Date('2024-12-06T17:05:11-07:00');
  const month = currentDate.getMonth();

  // Summer hours (June - August)
  if (month >= 5 && month <= 7) {
    businessHours.seasonal_hours?.push({
      start_date: '2024-06-01',
      end_date: '2024-08-31',
      hours: {
        ...hours,
        weekday_text: hours.weekday_text.map((text: string) => 
          text.replace(/\d{1,2}:\d{2} [AP]M/, '9:00 AM - 9:00 PM')
        )
      },
      note: 'Extended Summer Hours'
    });
  }
  // Winter hours (December - February)
  else if (month >= 11 || month <= 1) {
    businessHours.seasonal_hours?.push({
      start_date: '2024-12-01',
      end_date: '2025-02-28',
      hours: {
        ...hours,
        weekday_text: hours.weekday_text.map((text: string) =>
          text.replace(/\d{1,2}:\d{2} [AP]M/, '10:00 AM - 7:00 PM')
        )
      },
      note: 'Winter Hours'
    });
  }

  return businessHours;
}

function analyzeReviewSentiment(review: any) {
  const text = review.text.toLowerCase();
  const positiveWords = ['great', 'excellent', 'amazing', 'good', 'love', 'best', 'fantastic', 'wonderful'];
  const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'horrible', 'disappointed', 'awful'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

export function transformPlaceData(place: any): PlaceResult {
  const priceLevel = PRICE_LEVEL_MAP[place.price_level as keyof typeof PRICE_LEVEL_MAP] || PRICE_LEVEL_MAP[0];

  // Enhanced metadata
  const metadata: BusinessMetadata = {
    curbside_pickup: place.curbside_pickup || false,
    delivery: place.delivery || false,
    dine_in: place.dine_in || false,
    takeout: place.takeout || false,
    drive_thru: place.drive_thru || false,
    online_ordering: place.online_ordering || false,
    catering: place.catering || false,
    private_events: place.private_events || false,
    
    serves_breakfast: place.serves_breakfast || false,
    serves_lunch: place.serves_lunch || false,
    serves_dinner: place.serves_dinner || false,
    serves_brunch: place.serves_brunch || false,
    serves_coffee: place.serves_coffee || false,
    serves_vegetarian_food: place.serves_vegetarian_food || false,
    serves_vegan_food: place.serves_vegan_food || false,
    serves_halal: place.serves_halal || false,
    serves_kosher: place.serves_kosher || false,
    serves_alcohol: place.serves_alcohol || false,
    byob_allowed: place.byob_allowed || false,
    
    wifi_available: place.wifi_available || false,
    parking_available: place.parking_available || false,
    reservations_required: place.reservations_required || false,
    reservations_recommended: place.reservations_recommended || false,
    outdoor_seating: place.outdoor_seating || false,
    live_music: place.live_music || false,
    tv_available: place.tv_available || false,
    family_friendly: place.family_friendly || true,
    dog_friendly: place.dog_friendly || false,
    smoking_allowed: place.smoking_allowed || false,
    
    accepts_credit_cards: true,
    accepts_cash: true,
    accepts_mobile_payments: place.accepts_mobile_payments || false,
    accepts_checks: place.accepts_checks || false,
    accepts_crypto: place.accepts_crypto || false,
    
    woman_owned: place.woman_owned || false,
    minority_owned: place.minority_owned || false,
    veteran_owned: place.veteran_owned || false,
    locally_owned: !place.chain,
    chain: place.chain || false,
    franchise: place.franchise || false,
    
    health_score: place.health_score,
    last_inspection_date: place.last_inspection_date,
    covid_safety_measures: true,
    enhanced_cleaning: true,
    mask_required: false
  };

  // Process reviews with sentiment
  const reviews = place.reviews?.map((review: any) => ({
    ...review,
    sentiment: analyzeReviewSentiment(review),
    language: 'en', // Could be enhanced with language detection
    helpful_votes: Math.floor(Math.random() * 50) // Placeholder
  })) || [];

  // Calculate rating text
  const ratingText = place.rating
    ? place.rating >= 4.5 ? 'Exceptional'
    : place.rating >= 4.0 ? 'Excellent'
    : place.rating >= 3.5 ? 'Very Good'
    : place.rating >= 3.0 ? 'Good'
    : place.rating >= 2.0 ? 'Fair'
    : 'Poor'
    : 'Not Rated';

  // Process business hours
  const businessHours = place.opening_hours 
    ? processBusinessHours(place.opening_hours)
    : null;

  return {
    place_id: place.place_id,
    name: place.name,
    formatted_address: place.formatted_address,
    location: place.geometry?.location,
    types: place.types || [],
    business_status: place.business_status || 'OPERATIONAL',
    rating: place.rating || 0,
    user_ratings_total: place.user_ratings_total || 0,
    price_level: priceLevel,
    opening_hours: businessHours,
    photos: categorizePhotos(place.photos || []),
    reviews,
    contact_info: {
      formatted_phone_number: place.formatted_phone_number,
      international_phone_number: place.international_phone_number,
      website: place.website,
      email: place.email,
      social_media: {
        facebook: place.facebook_url,
        instagram: place.instagram_url,
        twitter: place.twitter_url,
        linkedin: place.linkedin_url,
        youtube: place.youtube_url,
        yelp: place.yelp_url
      },
      messaging_platforms: {
        whatsapp: place.whatsapp,
        messenger: place.messenger,
        telegram: place.telegram,
        wechat: place.wechat
      }
    },
    accessibility: {
      wheelchair_accessible_entrance: place.wheelchair_accessible_entrance || false,
      wheelchair_accessible_parking: place.wheelchair_accessible_parking || false,
      wheelchair_accessible_restroom: place.wheelchair_accessible_restroom || false,
      wheelchair_accessible_seating: place.wheelchair_accessible_seating || false,
      service_animal_allowed: true,
      braille_menu_available: place.braille_menu_available || false,
      staff_assistance_available: true
    },
    metadata,
    last_updated: new Date('2024-12-06T17:05:11-07:00').toISOString(),
    
    // Business verification
    verified: place.verified || false,
    verification_timestamp: place.verification_timestamp,
    certifications: place.certifications || [],
    insurance: place.insurance || [],
    licenses: place.licenses || [],
    
    // Service coverage
    service_area: place.service_area || {
      radius_km: 25,
      cities: [place.city || ''],
      zip_codes: [place.postal_code || ''],
      states: [place.state || ''],
      country: place.country || 'US'
    },
    multiple_locations: place.multiple_locations || [],
    
    // Enhanced features
    specialties: place.specialties || [],
    languages_spoken: place.languages_spoken || ['English'],
    staff_count: place.staff_count,
    year_established: place.year_established,
    parking_options: {
      street: true,
      lot: place.has_parking_lot || false,
      valet: place.has_valet || false,
      garage: place.has_garage || false,
      free: place.has_free_parking || true,
      validated: place.has_validated_parking || false
    },
    
    // Dynamic data
    current_wait_time: place.current_wait_time,
    occupancy_level: place.occupancy_level || 'medium',
    popular_times: place.popular_times || {},
    
    // Calculated fields
    features: extractFeatures(place),
    social_links: extractSocialLinks(place),
    rating_text: ratingText,
    
    // Business response metrics
    business_response: {
      last_response_date: place.last_response_date || new Date('2024-12-06T17:05:11-07:00').toISOString(),
      average_response_time_hours: place.average_response_time_hours || 24,
      response_rate_percentage: place.response_rate_percentage || 85
    }
  };
}

export function enrichPlaceData(place: PlaceResult, userLocation?: Location): PlaceResult {
  if (userLocation && place.location) {
    place.distance = calculateDistance(userLocation, place.location);
  }

  // Check if place is currently open
  const now = new Date('2024-12-06T17:05:11-07:00');
  const day = now.getDay();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  
  if (place.opening_hours?.regular_hours) {
    const todayHours = place.opening_hours.regular_hours.periods.find(
      period => period.open.day === day
    );
    
    if (todayHours) {
      place.is_open = time >= todayHours.open.time && 
        (!todayHours.close || time <= todayHours.close.time);
    }
  }

  return place;
}

export function transformPlaceResults(places: Place[]): Place[] {
  return places.map(place => ({
    ...place,
    // Add any necessary transformations here
    name: place.name.trim(),
    address: place.address.trim(),
    rating: place.rating ? Math.round(place.rating * 10) / 10 : undefined,
    reviewCount: place.reviewCount || 0,
  }));
}
