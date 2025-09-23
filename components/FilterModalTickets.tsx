import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FILTER_OPTIONS, PRIMARY_COLOR } from '../constants/tickets';

interface FilterModalProps {
  visible: boolean;
  selectedFilter: string;
  onFilterSelect: (filterId: string) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  selectedFilter,
  onFilterSelect,
  onClose
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-[#0f172a] rounded-t-2xl p-5">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-xl font-bold">Filtrer les billets</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <Text className="text-white font-bold mb-3">Statut de paiement</Text>
            <View className="flex-row flex-wrap">
              {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  className={`px-3 py-2 rounded-lg mr-2 mb-2 ${selectedFilter === option.id ? 'bg-[#ec673b]' : 'bg-white/10'
                    }`}
                  onPress={() => onFilterSelect(option.id)}
                >
                  <Text className={`text-sm ${selectedFilter === option.id ? 'text-gray-900 font-bold' : 'text-white'}`}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            className="py-3 rounded-lg bg-[#ec673b] items-center"
            onPress={onClose}
          >
            <Text className="text-white font-semibold">Appliquer les filtres</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;