import { NotificationCategory } from '../types';

export const PRIMARY_COLOR = '#ec673b';

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  { id: 'concerts', name: 'Concerts', icon: 'musical-notes' },
  { id: 'religion', name: 'Religion', icon: 'star' },
  { id: 'sport', name: 'Sport', icon: 'football' },
  { id: 'culture', name: 'Culture', icon: 'color-palette' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
];


export const NOTIFICATION_TYPES = [
  { id: 'Payment', name: 'Paiements', icon: 'card', color: '#32CD32' },
  { id: 'Event', name: 'Événements', icon: 'calendar', color: '#FF6347' },
  { id: 'Promotion', name: 'Promotions', icon: 'pricetag', color: '#FFD700' },
  { id: 'System', name: 'Système', icon: 'information-circle', color: '#1E90FF' },
];
