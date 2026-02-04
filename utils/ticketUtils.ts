import { Booking, FormattedTicket, GroupedTickets } from '../types';
import { TICKET_STATUS, PAYMENT_STATUS, DEFAULT_TICKET_IMAGE } from '../constants/tickets';
import { calculateDaysLeft } from './dateFormatter';

export const formatTickets = (
  bookings: Booking[],
  eventImages: Record<string, string | null> = {}
): {
  activeTickets: GroupedTickets;
  expiredTickets: GroupedTickets;
} => {
  const formattedActiveTickets: GroupedTickets = {};
  const formattedExpiredTickets: GroupedTickets = {};

  const validBookings = bookings.filter(booking => booking.event !== null);

  validBookings.forEach(booking => {
    const event = booking.event!;

    // Préparer les tickets formatés pour cette réservation
    const formattedTickets: FormattedTicket[] = booking.tickets.map(ticket => {
      const daysLeft = calculateDaysLeft(event.date);

      let status: 'active' | 'used' | 'expired' = TICKET_STATUS.ACTIVE;
      if (ticket.used) status = TICKET_STATUS.USED;
      else if (new Date(event.date) < new Date()) status = TICKET_STATUS.EXPIRED;

      const eventImage = eventImages[event._id] || DEFAULT_TICKET_IMAGE;

      // Vérifier que bookingRef est bien défini
      const bookingRef = booking.bookingRef || `fallback-${event._id}-${Date.now()}`;

      return {
        id: ticket._id || `${bookingRef}-${ticket.ticketNumber}`,
        eventId: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        ticketType: booking.ticketType,
        price: `${ticket.price} MRO`,
        status,
        paymentStatus: booking.paymentStatus,
        qrCode: ticket.encryptedData,
        image: eventImage,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        timeZone: 'Africa/Nouakchott',
        bookingRef: bookingRef, // Assurer que bookingRef est toujours défini
        ticketRef: ticket.ticketRef,
        ticketNumber: ticket.ticketNumber,
        used: ticket.used,
        encryptedData: ticket.encryptedData,
      };
    });

    // Déterminer le groupe cible (actif ou expiré)
    const targetGroup = formattedTickets[0]?.status === TICKET_STATUS.ACTIVE 
      ? formattedActiveTickets 
      : formattedExpiredTickets;

    // Utiliser une clé composite pour éviter les conflits
    const bookingRef = booking.bookingRef || `fallback-${event._id}-${Date.now()}`;
    const groupKey = `${event._id}-${bookingRef}`;

    if (!targetGroup[groupKey]) {
      targetGroup[groupKey] = {
        event: event,
        tickets: formattedTickets,
        totalTickets: booking.totalTickets,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        bookingRef: bookingRef, // Assurer que bookingRef est toujours défini
      };
    }
  });

  return { activeTickets: formattedActiveTickets, expiredTickets: formattedExpiredTickets };
};