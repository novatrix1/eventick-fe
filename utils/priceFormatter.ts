import { Ticket } from '../types';

export const getMinPrice = (tickets: Ticket[]): string => {
  if (!tickets || tickets.length === 0) return 'Gratuit';
  
  const prices = tickets
    .filter(ticket => ticket.available && ticket.price > 0)
    .map(ticket => ticket.price);
  
  if (prices.length === 0) return 'Gratuit';
  
  return `${Math.min(...prices)} MRO`;
};