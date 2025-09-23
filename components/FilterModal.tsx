import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Filter, Category, FilterOption } from '../types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: Filter;
  onFilterChange: (filterType: keyof Filter, value: string) => void;
  onResetFilters: () => void;
  primaryColor: string;
  cities: string[];
  dateFilters: FilterOption[];
  priceFilters: FilterOption[];
  categories: Category[];
  eventTypes: FilterOption[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  primaryColor,
  cities,
  dateFilters,
  priceFilters,
  categories,
  eventTypes
}) => {
  const renderFilterOptions = (filterType: keyof Filter, options: any[]) => {
    return (
      <View className="mb-6">
        <Text className="text-white font-bold text-lg mb-4 capitalize">
          {filterType === 'location' ? 'Lieu' : filterType}
        </Text>
        <View className="flex-row flex-wrap">
          {options.map((option: any) => {
            const id = option.id || option;
            const name = option.name || option;
            const isSelected = filters[filterType] === id;

            return (
              <TouchableOpacity
                key={id}
                className={`px-4 py-3 rounded-xl mr-3 mb-3 ${isSelected ? 'bg-[#ec673b]' : 'bg-white/10'}`}
                onPress={() => onFilterChange(filterType, id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text className={isSelected ? 'text-gray-900 font-bold' : 'text-white'}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-gray-900 rounded-t-3xl p-6 max-h-[85%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-bold">Filtres avancés</Text>
            <TouchableOpacity 
              onPress={onClose} 
              accessibilityRole="button" 
              accessibilityLabel="Fermer filtres"
            >
              <Ionicons name="close" size={28} color={primaryColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {renderFilterOptions('location', cities)}
            {renderFilterOptions('date', dateFilters)}
            {renderFilterOptions('price', priceFilters)}
            {renderFilterOptions('category', categories)}
            {renderFilterOptions('eventType', eventTypes)}
          </ScrollView>

          <View className="flex-row justify-between mt-5">
            <TouchableOpacity
              className="py-4 px-6 rounded-xl bg-white/10 flex-1 mr-3 items-center"
              onPress={onResetFilters}
              accessibilityRole="button"
            >
              <Text className="text-white font-bold text-base">Réinitialiser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-4 px-6 rounded-xl flex-1 ml-3 items-center"
              style={{ backgroundColor: primaryColor }}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text className="text-gray-900 font-bold text-base">Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;