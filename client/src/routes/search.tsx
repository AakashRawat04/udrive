import { SearchForm } from "@/components/home/search-car";
import { CarCard } from "@/components/search/car-card";
import { Separator } from "@/components/ui/separator";
import type { Branch } from "@/data/branch";
import { car, type Car } from "@/data/car";
import { api, type APIResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [location] = useQueryState("location");
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
    <div className="flex flex-col p-4 pt-8 md:p-10 mx-auto">
      <SearchForm />
      <Separator className="my-8 md:hidden" />
      <div className="mt-4 flex flex-col gap-8">
        {carSearch.data?.map(({ car }) => (
          <Link
            to="/car/$carId"
            params={{
              carId: car.id,
            }}
            key={car.id}
          >
            <CarCard car={car} />
          </Link>
        ))}
      </div>
    </div>
  );
}
