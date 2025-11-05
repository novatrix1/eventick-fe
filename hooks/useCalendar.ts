import * as Calendar from 'expo-calendar';
import { Alert } from 'react-native';
import { FormattedTicket } from '../types';

export const useCalendar = () => {
  const addToCalendar = async (ticket: FormattedTicket) => {
    if (ticket.paymentStatus !== 'approved') {
      Alert.alert(
        'Action non disponible',
        'Cette fonctionnalité est disponible uniquement pour les billets confirmés.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];

        if (defaultCalendar) {
          const startDate = new Date(ticket.date);
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 4);

          await Calendar.createEventAsync(defaultCalendar.id, {
            title: ticket.title,
            startDate: startDate,
            endDate: endDate,
            timeZone: ticket.timeZone,
            location: ticket.location,
            notes: `Billet: ${ticket.ticketType}\n\nQR Code: ${ticket.qrCode}`,
          });

          Alert.alert('Agenda', 'Événement ajouté à votre agenda avec succès!');
        }
      } else {
        Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès au calendrier dans les paramètres');
      }
    } catch (error) {
      console.error('Erreur d\'ajout à l\'agenda:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter à l\'agenda. Veuillez vérifier vos paramètres de calendrier.');
    }
  };

  return { addToCalendar };
};