
import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { toast } from 'sonner';
import { LocationData } from '@/types/user-data';

export const useGeolocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const permission = await Geolocation.requestPermissions();
      const granted = permission.location === 'granted';
      setHasPermission(granted);
      
      if (granted) {
        toast.success('Lokasyon izni verildi! AI Agent artık lokasyon verilerinize erişebilir.');
        return true;
      } else {
        toast.error('Lokasyon izni reddedildi');
        return false;
      }
    } catch (error) {
      console.error('Location permission error:', error);
      toast.error('Lokasyon izni alınamadı');
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      };
      
      setCurrentLocation(locationData);
      setLocationHistory(prev => [...prev, locationData]);
      
      return locationData;
    } catch (error) {
      console.error('Get location error:', error);
      toast.error('Konum alınamadı');
      return null;
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setIsTracking(true);
    toast.info('Lokasyon takibi başlatıldı');
    
    // Initial location
    await getCurrentLocation();
    
    // Set up periodic tracking
    const interval = setInterval(async () => {
      await getCurrentLocation();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [hasPermission, requestPermission, getCurrentLocation]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    toast.info('Lokasyon takibi durduruldu');
  }, []);

  return {
    currentLocation,
    locationHistory,
    isTracking,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    startTracking,
    stopTracking
  };
};
