import type { Branch } from "@/data/branch";
import type { Car } from "@/data/car";
import type { CarRequest } from "@/data/request";
import { api, type APIResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/classes";

export const Route = createFileRoute("/settings/requests")({
  component: Requests,
});

function Requests() {
  const requests = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const requests = await api<
        APIResponse<
          {
            car_request: CarRequest;
            car: Car;
            branch: Branch;
          }[]
        >
      >("/car.request.listByUser", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!requests.data) {
        throw new Error(requests.error);
      }

      return requests.data;
    },

  });

  const carRequests = requests.data;

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your car requests and preferences.
        </p>
      </div>
      <Separator />
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav className="flex flex-col space-y-1">
          <Link
            to="/settings/profile"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            activeProps={{
              className: "bg-accent text-accent-foreground",
            }}
          >
            General
          </Link>
          <Link
            to="/settings/requests"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            activeProps={{
              className: "bg-accent text-accent-foreground",
            }}
          >
            Car Requests
          </Link>
        </nav>
        <div className="grid gap-4">
          {!carRequests?.length ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="mb-2 text-lg font-semibold">No requests found</p>
                <p className="text-sm text-muted-foreground">
                  You haven't made any car rental requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            carRequests.map(({ car_request, car, branch }) => (
              <CarRequestCard
                key={car_request.id}
                carRequest={car_request}
                car={car}
                branch={branch}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function CarRequestCard({
  carRequest,
  car,
  branch,
}: {
  carRequest: CarRequest;
  car: Car;
  branch: Branch;
}) {
  const statusColors = {
    pending: "bg-yellow-500/15 text-yellow-700",
    approved: "bg-green-500/15 text-green-700",
    rejected: "bg-red-500/15 text-red-700",
  };

  return (
    <Card>
      <CardHeader className="grid grid-cols-[1fr_auto] items-start gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>
            {car.brand} {car.model}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="h-4 w-4" />
            {branch.name}, {branch.address}
          </div>
        </div>
        <div className="space-y-1 flex flex-col items-end">
          <Badge
            variant="secondary"
            className={cn(
              "capitalize",
              statusColors[carRequest.status as keyof typeof statusColors]
            )}
          >
            {carRequest.status}
          </Badge>
          {carRequest.status === "completed" && (
            // Bill
            <p className="text-base text-muted-foreground">
              Rs. {carRequest.bill}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(carRequest.from).toLocaleDateString()} -{" "}
              {new Date(carRequest.to).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
