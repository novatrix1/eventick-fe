import { Notification, NotificationCategory } from '../types';

export const PRIMARY_COLOR = '#ec673b';

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  { id: 'concerts', name: 'Concerts', icon: 'musical-notes' },
  { id: 'religion', name: 'Religion', icon: 'star' },
  { id: 'sport', name: 'Sport', icon: 'football' },
  { id: 'culture', name: 'Culture', icon: 'color-palette' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
];

export const NOTIFICATION_TYPES = [
  { id: 'event', name: 'Nouveaux événements', icon: 'event', color: PRIMARY_COLOR },
  { id: 'promotion', name: 'Promotions spéciales', icon: 'local-offer', color: '#FFD700' },
  { id: 'reminder', name: "Rappels d'événements", icon: 'notifications-active', color: '#FF6347' },
  { id: 'payment', name: 'Confirmations de paiement', icon: 'cash', color: '#32CD32' },
];

export const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'Nouveau concert traditionnel',
    message: 'Un concert exclusif avec les meilleurs artistes mauritaniens vient d\'être ajouté',
    timestamp: 'Il y a 2 heures',
    read: false,
    category: 'concerts',
    eventId: 'concert-traditionnel'
  },
  {
    id: '2',
    type: 'promotion',
    title: 'Réduction spéciale - Festival du Chameau',
    message: 'Profitez de 20% de réduction sur les billets pour le Festival du Chameau',
    timestamp: 'Il y a 1 jour',
    read: false,
    eventId: 'festival-chameau'
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Votre événement approche',
    message: 'Le Festival des Dattes commence dans 3 jours! Préparez-vous',
    timestamp: 'Il y a 1 jour',
    read: true,
    eventId: 'festival-dattes'
  },
  {
    id: '4',
    type: 'payment',
    title: 'Paiement confirmé',
    message: 'Votre paiement de 2500 MRO pour le Concert Traditionnel a été accepté',
    timestamp: 'Il y a 2 jours',
    read: true,
    amount: '2500 MRO',
    eventId: 'concert-traditionnel'
  },
  {
    id: '5',
    type: 'event',
    title: 'Conférence sur l\'entrepreneuriat',
    message: 'Découvrez les opportunités d\'affaires en Mauritanie avec des experts locaux',
    timestamp: 'Il y a 3 jours',
    read: true,
    category: 'business',
    eventId: 'conference-entrepreneuriat'
  },
  {
    id: '6',
    type: 'reminder',
    title: 'Événement à proximité',
    message: 'Un festival culturel se déroule près de vous à Nouakchott',
    timestamp: 'Il y a 5 jours',
    read: true,
    eventId: 'festival-culturel'
  }
];