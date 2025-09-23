import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { FormattedTicket } from '../types';
import TicketDesign from './TicketDesign';
import { shareQRCode } from '../utils/qrCodeUtils';
import { PRIMARY_COLOR } from '../constants/tickets';

interface QRModalProps {
  visible: boolean;
  ticket: FormattedTicket | null;
  onClose: () => void;
  onAddToCalendar: (ticket: FormattedTicket) => void;
}

const QRModal: React.FC<QRModalProps> = ({
  visible,
  ticket,
  onClose,
  onAddToCalendar
}) => {
  const qrCodeRef = useRef<View>(null);

  const handleShare = async () => {
    if (!ticket) return;
    await shareQRCode(qrCodeRef, ticket.title);
  };

  if (!ticket) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-80 justify-center items-center px-5">
        <View className="bg-[#0f172a] rounded-2xl p-5 w-full max-w-md shadow-lg border-t-4 border-[#ec673b]">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white font-bold text-lg flex-shrink">{ticket.title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>

          <View ref={qrCodeRef}>
            <TicketDesign ticket={ticket} />
          </View>

          <View className="flex-row justify-between space-x-3 mt-5">
            <TouchableOpacity
              className="flex-row items-center border border-[#ec673b] rounded-lg px-4 py-2 flex-1 justify-center"
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <FontAwesome name="share" size={16} color={PRIMARY_COLOR} />
              <Text className="text-[#ec673b] font-semibold text-sm ml-2">Partager</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center bg-[#ec673b] rounded-lg px-4 py-2 flex-1 justify-center"
              onPress={() => onAddToCalendar(ticket)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={16} color="white" />
              <Text className="text-white font-semibold text-sm ml-2">Agenda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QRModal;