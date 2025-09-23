import { FilterOption } from '../types';

export const PRIMARY_COLOR = '#ec673b';
export const SECONDARY_COLOR = '#6b46c1';

export const DEFAULT_TICKET_IMAGE = 'https://i.postimg.cc/3R5BS66V/Mozbi.jpg';

export const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', name: 'Tous' },
  { id: 'pending', name: 'En attente' },
  { id: 'completed', name: 'Confirmés' },
  { id: 'failed', name: 'Échoués' },
];

export const TICKET_STATUS = {
  ACTIVE: 'active',
  USED: 'used',
  EXPIRED: 'expired'
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
} as const;