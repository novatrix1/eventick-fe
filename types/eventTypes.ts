export interface EventData {
  title: string;
  description: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  location: string;
  city: string;
  category: string;
  image: string | null;
  isPromo: boolean;
  promoDiscount: number;
  promoEndDate: Date;
   wilaya: string;
  moughataa: string;
}

export interface TicketType {
  id: string;
  type: string;
  price: number;
  description: string;
  totalTickets: number;
  availableTickets: number;
  available: boolean;
}