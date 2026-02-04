import { FilterOption } from '../types';

export const PRIMARY_COLOR = '#ec673b';
export const SECONDARY_COLOR = '#6b46c1';
export const SUCCESS_COLOR = '#10b981';
export const WARNING_COLOR = '#eab308';
export const ERROR_COLOR = '#ef4444';

export const DEFAULT_TICKET_IMAGE = 'https://i.postimg.cc/3R5BS66V/Mozbi.jpg';

export const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', name: 'Tous' },
  { id: 'pending', name: 'En attente' },
  { id: 'approved', name: 'Confirmés' },
  { id: 'rejected', name: 'Échoués' },
];

export const TICKET_STATUS = {
  ACTIVE: 'active',
  USED: 'used',
  EXPIRED: 'expired'
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'approved',
  FAILED: 'rejected'
} as const;