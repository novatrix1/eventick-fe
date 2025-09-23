import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Event } from '../types';

export const useLocation = (events: Event[]) => {
  const [isLocating, setIsLocating] = useState(true);
  const [userCity, setUserCity] = useState<string>('Nouakchott');
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (geocode.length > 0) {
        const city = geocode[0].city || 'Nouakchott';
        setUserCity(city);
        
        const nearby = events.filter(event => 
          event.city.toLowerCase().includes(city.toLowerCase()) || 
          city.toLowerCase().includes(event.city.toLowerCase())
        );
        
        setNearbyEvents(nearby);
      }
      
      setIsLocating(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (events.length > 0) {
      getUserLocation();
    }
  }, [events]);

  return {
    isLocating,
    userCity,
    nearbyEvents,
    getUserLocation
  };
};