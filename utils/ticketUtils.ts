import { Booking, FormattedTicket, GroupedTickets } from '../types';
import { TICKET_STATUS, PAYMENT_STATUS, DEFAULT_TICKET_IMAGE } from '../constants/tickets';
import { calculateDaysLeft } from './dateFormatter';

export const formatTickets = (bookings: Booking[]): {
  activeTickets: GroupedTickets;
  expiredTickets: GroupedTickets;
} => {
  const formattedActiveTickets: GroupedTickets = {};
  const formattedExpiredTickets: GroupedTickets = {};

  const validBookings = bookings.filter(booking => booking.event !== null);

  validBookings.forEach(booking => {
    const event = booking.event!;

    booking.tickets.forEach(ticket => {
      const daysLeft = calculateDaysLeft(event.date);

      let status: 'active' | 'used' | 'expired' = TICKET_STATUS.ACTIVE;
      if (ticket.used) {
        status = TICKET_STATUS.USED;
      } else if (new Date(event.date) < new Date()) {
        status = TICKET_STATUS.EXPIRED;
      }

      const paymentStatusMap = {
        'pending': PAYMENT_STATUS.PENDING,
        'completed': PAYMENT_STATUS.CONFIRMED,
        'failed': PAYMENT_STATUS.FAILED
      } as const;

      const formattedTicket: FormattedTicket = {
        id: ticket._id,
        eventId: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        ticketType: booking.ticketType,
        price: `${ticket.price} MRO`,
        status,
        paymentStatus: paymentStatusMap[booking.paymentStatus],
        qrCode: ticket.encryptedData,
        image: DEFAULT_TICKET_IMAGE,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        timeZone: 'Africa/Nouakchott',
        bookingRef: booking.bookingRef,
        ticketRef: ticket.ticketRef,
        ticketNumber: ticket.ticketNumber,
      };

      const targetGroup = status === TICKET_STATUS.ACTIVE ? formattedActiveTickets : formattedExpiredTickets;

      if (!targetGroup[event._id]) {
        targetGroup[event._id] = {
          event: event,
          tickets: [],
          totalTickets: booking.totalTickets,
          totalPrice: booking.totalPrice,
          paymentStatus: paymentStatusMap[booking.paymentStatus],
        };
      }

      targetGroup[event._id].tickets.push(formattedTicket);
    });
  });

  return { activeTickets: formattedActiveTickets, expiredTickets: formattedExpiredTickets };
};