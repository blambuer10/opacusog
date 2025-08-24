
import { useState, useEffect } from 'react';

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: number;
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
  requestPermission: () => Promise<void>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude || undefined,
                altitudeAccuracy: pos.coords.altitudeAccuracy || undefined,
                heading: pos.coords.heading || undefined,
                speed: pos.coords.speed || undefined,
              },
              timestamp: pos.timestamp,
            });
          },
          (err) => {
            reject(new Error(`Geolocation error: ${err.message}`));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      setPosition(position);
      console.log('Geolocation permission granted and position obtained');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown geolocation error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if permission was previously granted
    if (navigator.geolocation && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          requestPermission().catch(() => {
            // Silently fail if auto-request fails
          });
        }
      });
    }
  }, []);

  return {
    position,
    error,
    loading,
    requestPermission,
  };
};
