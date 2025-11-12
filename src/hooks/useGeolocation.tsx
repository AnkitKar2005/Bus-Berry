import { useState, useEffect } from "react";

interface GeolocationData {
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to get geolocation from IP
        const response = await fetch("https://ipapi.co/json/");
        
        if (!response.ok) {
          throw new Error("Failed to detect location");
        }

        const data = await response.json();
        
        setLocation({
          country: data.country_name,
          countryCode: data.country_code,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } catch (err) {
        console.error("Geolocation error:", err);
        setError("Could not detect location");
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  return { location, loading, error };
};
