import { useState, useEffect } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Country {
  id: string;
  name: string;
  code: string;
  currency_code?: string;
  currency_symbol?: string;
  exchange_rate?: number;
}

interface State {
  id: string;
  name: string;
  country_id: string;
}

const LocationSelector = () => {
  const { selectedCountry, selectedState, setSelectedCountry, setSelectedState } = useLocation();
  const { location, loading: geoLoading } = useGeolocation();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  // Auto-detect country from geolocation
  useEffect(() => {
    if (location && countries.length > 0 && !autoDetected && !selectedCountry) {
      const detectedCountry = countries.find(
        (c) => c.code === location.countryCode
      );
      if (detectedCountry) {
        setSelectedCountry(detectedCountry);
        setAutoDetected(true);
        toast.success(`Location detected: ${detectedCountry.name}`);
      }
    }
  }, [location, countries, autoDetected, selectedCountry, setSelectedCountry]);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry.id);
    } else {
      setStates([]);
      setSelectedState(null);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    const result: any = await supabase
      .from("countries" as any)
      .select("*")
      .order("name");

    if (result.error) {
      console.error("Error fetching countries:", result.error);
      return;
    }

    setCountries(result.data || []);
  };

  const fetchStates = async (countryId: string) => {
    const result: any = await supabase
      .from("states" as any)
      .select("*")
      .eq("country_id", countryId)
      .order("name");

    if (result.error) {
      console.error("Error fetching states:", result.error);
      return;
    }

    setStates(result.data || []);
  };

  const handleCountryChange = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId);
    setSelectedCountry(country || null);
  };

  const handleStateChange = (stateId: string) => {
    const state = states.find((s) => s.id === stateId);
    setSelectedState(state || null);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select
          value={selectedCountry?.id || ""}
          onValueChange={handleCountryChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={geoLoading ? "Detecting..." : "Select Country"} />
          </SelectTrigger>
          <SelectContent className="bg-background max-h-[300px]">
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name} ({country.currency_symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCountry && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedState?.id || ""}
            onValueChange={handleStateChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
