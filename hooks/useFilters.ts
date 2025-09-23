import { useState, useEffect } from 'react';
import { Filter, Event } from '../types';
import { applyFiltersToEvents } from '../utils/filterUtils';

export const useFilters = (events: Event[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filter>({
    location: 'Tout',
    date: 'any',
    price: 'any',
    category: 'all',
    eventType: 'any'
  });
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const handleFilterChange = (filterType: keyof Filter, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const resetFilters = () => {
    setFilters({
      location: 'Tout',
      date: 'any',
      price: 'any',
      category: 'all',
      eventType: 'any'
    });
    setSearchQuery('');
  };

  useEffect(() => {
    const results = applyFiltersToEvents(events, filters, searchQuery);
    setFilteredEvents(results);
  }, [filters, searchQuery, events]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    handleFilterChange,
    resetFilters,
    filteredEvents
  };
};