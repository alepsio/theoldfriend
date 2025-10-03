export interface Barber {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  order_position: number;
  created_at: Date;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  is_active: boolean;
  order_position: number;
  created_at: Date;
}

export interface WorkingHours {
  id: number;
  barber_id: number | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Closure {
  id: number;
  barber_id: number | null;
  closure_date: string;
  reason: string | null;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: Date;
}

export interface Booking {
  id: number;
  customer_id: number;
  barber_id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  customer?: Customer;
  barber?: Barber;
  service?: Service;
}

export interface GalleryImage {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  order_position: number;
  is_active: boolean;
  created_at: Date;
}

export interface Settings {
  [key: string]: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id: number;
  barber_id: number;
  booking_date: string;
  booking_time: string;
  notes?: string;
}