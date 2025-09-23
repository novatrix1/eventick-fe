import { Ionicons } from "@expo/vector-icons";

export type UserType = 'client' | 'organizer' | null;

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  companyName: string;
  organizerType: string;
  address: string;
  city: string;
  rib: string;
  socialMedia: string;
  description: string;
  cin: string;
  registerCommerce: string;
}



export interface Organizer {
  _id: string;
  companyName: string;
  phone: string;
  type: string;
  contactEmail: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface Ticket {
  _id: string;
  type: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  description: string;
  available: boolean;
  ticketRef: string;
  ticketNumber: number;
  status: string;
  used: boolean;
  encryptedData: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  totalTickets: number;
  availableTickets: number;
  image: string | null;
  category: string;
  city: string;
  organizer: Organizer;
  isActive: boolean;
  paymentMethods: string[];
  ticket: Ticket[];
  createdAt: string;
  updatedAt: string;
  price: string;
  type: 'online' | 'in-person';
  status: 'upcoming' | 'ongoing' | 'completed';

  __v: number;
}

export type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};


export interface ApiEvent {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  totalTickets: number;
  availableTickets: number;
  image: string | null;
  category: string;
  city: string;
  organizer: Organizer;
  isActive: boolean;
  paymentMethods: string[];
  ticket: Ticket[];
  tickets: TicketType[];
  createdAt: string;
  updatedAt: string;
  totalRevenue: number;
  __v: number;
}


export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}


export interface PaymentMethod {
  name: string;
  value: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}




export interface Filter {
  location: string;
  date: string;
  price: string;
  category: string;
  eventType: string;
}

export interface FilterOption {
  id: string;
  name: string;
}



export type NotificationType = 'event' | 'promotion' | 'reminder' | 'payment' | 'warning' | 'info' | 'success';;

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category?: string;
  eventId?: string;
  amount?: string;
  time: string;

}

export interface NotificationSettings {
  pushEnabled: boolean;
  categories: {
    concerts: boolean;
    religion: boolean;
    sport: boolean;
    culture: boolean;
    business: boolean;
  };
}

export interface NotificationCategory {
  id: string;
  name: string;
  icon: string;
}


// types/index.ts
export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  role: string;
}

export interface OrganizerStatus {
  isOrganizer: boolean;
  isVerified: boolean;
  isLoading: boolean;
}

export interface HelpOption {
  id: string;
  title: string;
  icon: string;
}


export interface Booking {
  bookingRef: string;
  event: Event | null;
  ticketType: string;
  totalTickets: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  tickets: Ticket[];
  createdAt: string;
  status: string;
}


export interface ApiResponse {
  message: string;
  bookings: Booking[];
}

export interface GroupedTickets {
  [eventId: string]: {
    event: Event;
    tickets: FormattedTicket[];
    totalTickets: number;
    totalPrice: number;
    paymentStatus: string;
  };
}

export interface FormattedTicket {
  id: string;
  eventId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  ticketType: string;
  price: string;
  status: 'active' | 'used' | 'expired';
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  qrCode: string;
  image: string;
  daysLeft: number;
  timeZone: string;
  bookingRef: string;
  ticketRef: string;
  ticketNumber: number;
}


export interface TimeFilter {
  id: 'day' | 'week' | 'month' | 'year';
  label: string;
}

export interface StatCard {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}