import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFilterPress: () => void;
  primaryColor: string;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onFilterPress,
  primaryColor
}) => {
  return (
    <View className="mb-7">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-white text-3xl font-bold">Explorer</Text>
        <TouchableOpacity 
          className="p-2 rounded-full bg-white/10"
          onPress={onFilterPress}
          accessibilityRole="button"
        >
          <Ionicons name="filter" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <View className="relative">
        <TextInput
          className="bg-white/20 text-white text-base rounded-xl pl-16 pr-4 py-4 shadow-lg"
          placeholder="Rechercher événements, artistes..."
          placeholderTextColor="#AAAAAA"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Recherche événements"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <Ionicons
          name="search"
          size={24}
          color={primaryColor}
          style={{ position: 'absolute', left: 20, top: 16 }}
        />
      </View>
    </View>
  );
};

export default SearchHeader;