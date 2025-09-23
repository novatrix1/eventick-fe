import { ApiEvent, Event } from '../types';

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

  return {
    _id: apiEvent._id,
    title: apiEvent.title,
    date: formattedDate,
    location: apiEvent.location,
    city: apiEvent.city || 'Ville non spécifiée',
    price: priceText,
    category: apiEvent.category,
    type: eventType,
    image: apiEvent.image || defaultImage
  };
};