import { Event, Filter } from '../types';

export const applyFiltersToEvents = (events: Event[], filters: Filter, searchQuery: string): Event[] => {
  let results = [...events];
  const query = searchQuery.toLowerCase();

  if (searchQuery) {
    results = results.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.city.toLowerCase().includes(query)
    );
  }

  if (filters.location !== 'Tout') {
    results = results.filter(event => event.city === filters.location);
  }

  if (filters.category !== 'all') {
    results = results.filter(event => event.category === filters.category);
  }

  if (filters.eventType !== 'any') {
    results = results.filter(event => event.type === filters.eventType);
  }

  if (filters.price !== 'any') {
    switch (filters.price) {
      case 'free':
        results = results.filter(event => event.price === 'Gratuit');
        break;
      case '0-1000':
        results = results.filter(event => {
          const priceMatch = event.price.match(/(\d+)/);
          if (!priceMatch) return false;
          const price = parseInt(priceMatch[0]);
          return price > 0 && price <= 1000;
        });
        break;
      case '1000-2000':
        results = results.filter(event => {
          const priceMatch = event.price.match(/(\d+)/);
          if (!priceMatch) return false;
          const price = parseInt(priceMatch[0]);
          return price > 1000 && price <= 2000;
        });
        break;
      case '2000+':
        results = results.filter(event => {
          const priceMatch = event.price.match(/(\d+)/);
          if (!priceMatch) return false;
          const price = parseInt(priceMatch[0]);
          return price > 2000;
        });
        break;
    }
  }

  return results;
};