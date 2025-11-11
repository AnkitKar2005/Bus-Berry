import { useState, useEffect } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface PopularRoute {
  id: string;
  from_location: string;
  to_location: string;
  popularity_score: number;
}

const PopularRoutes = () => {
  const { selectedState } = useLocation();
  const [routes, setRoutes] = useState<PopularRoute[]>([]);

  useEffect(() => {
    if (selectedState) {
      fetchPopularRoutes();
    }
  }, [selectedState]);

  const fetchPopularRoutes = async () => {
    if (!selectedState) return;

    const result: any = await supabase
      .from("popular_routes" as any)
      .select(`
        id,
        popularity_score,
        from_location:from_location_id(name),
        to_location:to_location_id(name)
      `)
      .eq("state_id", selectedState.id)
      .order("popularity_score", { ascending: false })
      .limit(6);

    if (result.error) {
      console.error("Error fetching popular routes:", result.error);
      return;
    }

    const formattedRoutes = result.data?.map((route: any) => ({
      id: route.id,
      from_location: route.from_location?.name || "",
      to_location: route.to_location?.name || "",
      popularity_score: route.popularity_score,
    })) || [];

    setRoutes(formattedRoutes);
  };

  if (!selectedState || routes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Popular Routes in {selectedState.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {routes.map((route) => (
            <Link
              key={route.id}
              to={`/search?from=${encodeURIComponent(route.from_location)}&to=${encodeURIComponent(route.to_location)}&date=${new Date().toISOString().split('T')[0]}`}
            >
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-accent"
              >
                <span className="text-sm">{route.from_location}</span>
                <ArrowRight className="h-4 w-4 mx-2" />
                <span className="text-sm">{route.to_location}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularRoutes;
