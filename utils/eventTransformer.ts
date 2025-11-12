
export const transformApiEventToEvent = (apiEvent: ApiEvent): Event => {
  let priceText = 'Gratuit';
  if (apiEvent.ticket && apiEvent.ticket.length > 0) {
    const availableTickets = apiEvent.ticket.filter(t => t.available && t.price > 0);
    if (availableTickets.length > 0) {
      const minPrice = Math.min(...availableTickets.map(t => t.price));
      priceText = `${minPrice} MRO`;
    }
  }

  const eventDate = new Date(apiEvent.date);
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const eventType = 'in-person';

  const defaultImage = 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80';

  // Calcul du statut basé sur la date
  const now = new Date();
  const eventDateTime = new Date(`${apiEvent.date}T${apiEvent.time}`);
  let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
  
  if (eventDateTime < now) {
    status = 'completed';
  } else {
    // Si l'événement est dans les prochaines 24 heures, on le considère comme "ongoing"
    const timeDiff = eventDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    status = hoursDiff <= 24 ? 'ongoing' : 'upcoming';
  }

  return {
    _id: apiEvent._id,
    title: apiEvent.title,
    description: apiEvent.description,
    location: apiEvent.location,
    date: formattedDate,
    time: apiEvent.time,
    totalTickets: apiEvent.totalTickets,
    availableTickets: apiEvent.availableTickets,
    image: apiEvent.image || defaultImage,
    category: apiEvent.category,
    city: apiEvent.city,
    organizer: apiEvent.organizer,
    isActive: apiEvent.isActive,
    paymentMethods: apiEvent.paymentMethods,
    ticket: apiEvent.ticket,
    tickets: apiEvent.tickets || [],
    createdAt: apiEvent.createdAt,
    updatedAt: apiEvent.updatedAt,
    price: priceText,
    type: eventType,
    status: status,
    __v: apiEvent.__v
  };
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
  tickets?: TicketType[]; // Rendu optionnel pour compatibilité
  createdAt: string;
  updatedAt: string;
  totalRevenue?: number;
  __v: number;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string; // Date formatée pour l'affichage
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
  price: string;
  type: 'online' | 'in-person';
  status: 'upcoming' | 'ongoing' | 'completed';
  __v: number;
}

// Interfaces supplémentaires nécessaires
export interface Organizer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
}

export interface Ticket {
  _id: string;
  type: string;
  price: number;
  description: string;
  totalTickets: number;
  availableTickets: number;
  available: boolean;
  event: string;
}

export interface TicketType {
  _id: string;
  type: string;
  price: number;
  description: string;
  totalTickets: number;
  availableTickets: number;
  available: boolean;
}