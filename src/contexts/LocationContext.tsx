import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface State {
  id: string;
  name: string;
  country_id: string;
}

interface LocationContextType {
  selectedCountry: Country | null;
  selectedState: State | null;
  setSelectedCountry: (country: Country | null) => void;
  setSelectedState: (state: State | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
    const saved = localStorage.getItem("selectedCountry");
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedState, setSelectedState] = useState<State | null>(() => {
    const saved = localStorage.getItem("selectedState");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem("selectedCountry", JSON.stringify(selectedCountry));
    } else {
      localStorage.removeItem("selectedCountry");
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      localStorage.setItem("selectedState", JSON.stringify(selectedState));
    } else {
      localStorage.removeItem("selectedState");
    }
  }, [selectedState]);

  return (
    <LocationContext.Provider
      value={{
        selectedCountry,
        selectedState,
        setSelectedCountry,
        setSelectedState,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
