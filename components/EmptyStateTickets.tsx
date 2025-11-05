//EmptyStateTickets.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '../constants/tickets';

interface EmptyStateProps {
  activeTab: 'active' | 'expired';
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeTab }) => {
  return (
    <View className="mt-10 items-center px-8">
      <Ionicons
        name={activeTab === 'active' ? 'ticket-outline' : 'time-outline'}
        size={40}
        color={PRIMARY_COLOR}
      />
      <Text className="text-white text-lg font-bold mt-4 text-center">
        {activeTab === 'active' ? 'Aucun billet actif' : 'Historique vide'}
      </Text>
      <Text className="text-slate-400 mt-2 text-center text-xs leading-4">
        {activeTab === 'active'
          ? "Vous n'avez pas de billets à venir. Parcourez les événements et réservez vos places!"
          : "Vous n'avez encore assisté à aucun événement. Vos futurs billets apparaîtront ici après utilisation."}
      </Text>
    </View>
  );
};

export default EmptyState;