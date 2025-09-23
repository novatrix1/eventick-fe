import React from 'react';
import { View, Text, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { FormattedTicket } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { ticketStyles } from '../styles/ticketStyles';

interface TicketDesignProps {
  ticket: FormattedTicket;
}

const TicketDesign: React.FC<TicketDesignProps> = ({ ticket }) => {
  return (
    <View style={ticketStyles.cardShadowContainer}>
      <View style={ticketStyles.ticketCard}>
        <View style={[ticketStyles.notch, ticketStyles.notchLeft]} />
        <View style={[ticketStyles.notch, ticketStyles.notchRight]} />

        <View style={ticketStyles.imageWrap}>
          <Image
            source={{ uri: ticket.image }}
            style={ticketStyles.image}
            resizeMode="cover"
          />
        </View>

        <View style={ticketStyles.content}>
          <Text style={ticketStyles.title} numberOfLines={2}>
            {ticket.title}
          </Text>

          <View style={ticketStyles.divider} />

          <View style={ticketStyles.grid}>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.label}>Date</Text>
              <Text style={ticketStyles.value}>{formatDate(ticket.date)}</Text>
            </View>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.label}>Heure</Text>
              <Text style={ticketStyles.value}>{ticket.time}</Text>
            </View>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.label}>Lieu</Text>
              <Text style={ticketStyles.value}>{ticket.location}</Text>
            </View>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.label}>Catégorie</Text>
              <Text style={ticketStyles.value}>{ticket.ticketType}</Text>
            </View>
          </View>

          <View style={ticketStyles.divider} />

          <View style={ticketStyles.qrContainer}>
            <QRCode
              value={ticket.qrCode}
              size={150}
              backgroundColor="transparent"
              color="#000000"
            />
            <Text style={{ marginTop: 10, color: '#8B8B8B', fontSize: 12 }}>
              N°{ticket.ticketNumber} - {ticket.ticketRef}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TicketDesign;