import { SearchForm } from "@/components/home/search-car";
import { CarCard } from "@/components/search/car-card";
import { Separator } from "@/components/ui/separator";
import type { Branch } from "@/data/branch";
import { type Car } from "@/data/car";
import { api, type APIResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [location] = useQueryState("location");
  const [pickupDate] = useQueryState<Date>("pickupDate", {
    parse: (v) => new Date(v),
    serialize: (v) => `${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`,
  });
  const [dropDate] = useQueryState<Date>("dropDate", {
    parse: (v) => new Date(v),
    serialize: (v) => `${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`,
  });
  const carSearch = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const cars = await api<
        APIResponse<
          {
            car: Car;
            branch: Branch;
          }[]
        >
      >(`/car.getByBranchId/${location}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "GET",
      });

      if (!cars.data) {
        throw new Error(cars.error);
      }

      return cars.data;
    },
    refetchInterval: 10000,
    enabled: !!location,
  });

  useEffect(() => {
    carSearch.refetch();
  }, [location]);

  return (
    <div className="flex flex-col p-4 pt-8 md:p-10 mx-auto max-w-7xl">
      <SearchForm />
      <Separator className="my-8 md:hidden" />

      {carSearch.isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : carSearch.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-xl font-semibold">No cars available</h3>
          <p className="text-muted-foreground mt-2">
            Try searching in a different location or try again later
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3">
          {carSearch.data?.map(({ car }) => (
            <Link
              to="/car/$carId"
              params={{
                carId: car.id,
              }}
              search={{
                pickupDate: `${pickupDate?.getFullYear()}-${(pickupDate?.getMonth() ?? 0) + 1}-${pickupDate?.getDate()}`,
                dropDate: `${dropDate?.getFullYear()}-${(dropDate?.getMonth() ?? 0) + 1}-${dropDate?.getDate()}`,
              }}
              key={car.id}
            >
              <CarCard car={car} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
