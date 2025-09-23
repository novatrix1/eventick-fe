import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';

import { useEvents } from '@/hooks/useEvents';
import { useFilters } from '@/hooks/useFilters';
import { cities, dateFilters, priceFilters, eventTypes } from '@/constants/filters';

import SearchHeader from '@/components/SearchHeader';
import CategoryFilter from '@/components/CategoryFilter';
import EventList from '@/components/EventList';
import CategorySection from '@/components/CategorySection';
import FilterModal from '@/components/FilterModal';
import LoadingErrorState from '@/components/LoadingErrorState';

const ExploreScreen = () => {
  const primaryColor = '#ec673b';
  const [showFilters, setShowFilters] = useState(false);

  const { events, categoryEvents, isLoading, error, refetch, categories } = useEvents();
  const { searchQuery, setSearchQuery, filters, handleFilterChange, resetFilters, filteredEvents } = useFilters(events);

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleResetFilters = () => {
    resetFilters();
    setShowFilters(false);
  };

  if (isLoading || error) {
    return (
      <BackgroundWrapper>
        <LoadingErrorState 
          isLoading={isLoading} 
          error={error} 
          onRetry={refetch}
          primaryColor={primaryColor}
        />
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <ScrollView className="flex-1 px-5 pt-16" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <StatusBar style="light" />
        
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onFilterPress={() => setShowFilters(true)}
          primaryColor={primaryColor}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={filters.category}
          onCategorySelect={(categoryId) => handleFilterChange('category', categoryId)}
        />

        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-xl font-bold">
              {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity 
              onPress={resetFilters} 
              accessibilityRole="button"
              accessibilityLabel="Réinitialiser filtres"
            >
              <Text style={{ color: primaryColor }} className="text-sm font-medium">Réinitialiser</Text>
            </TouchableOpacity>
          </View>

          <EventList
            events={filteredEvents}
            onEventPress={handleEventPress}
            onResetFilters={resetFilters}
            primaryColor={primaryColor}
          />
        </View>

        {Object.entries(categoryEvents).map(([categoryId, events]) => {
          const category = categories.find(c => c.id === categoryId);
          if (!category) return null;

          return (
            <CategorySection
              key={categoryId}
              categoryId={categoryId}
              category={category}
              events={events}
              onEventPress={handleEventPress}
              primaryColor={primaryColor}
            />
          );
        })}
      </ScrollView>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        primaryColor={primaryColor}
        cities={cities}
        dateFilters={dateFilters}
        priceFilters={priceFilters}
        categories={categories}
        eventTypes={eventTypes}
      />
    </BackgroundWrapper>
  );
};

export default ExploreScreen;