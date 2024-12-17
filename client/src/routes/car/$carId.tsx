import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Branch } from "@/data/branch";
import { Car } from "@/data/car";
import { api, type APIResponse } from "@/lib/api";
import { cn } from "@/lib/classes";
import { toDateInQueryFormat, toISODateWithLocalTimeZone } from "@/lib/helpers";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarIcon, CogIcon, DropletsIcon,
  FuelIcon,
  GaugeIcon,
  Loader2,
  MapPin, UsersIcon
} from "lucide-react";
import { useQueryState } from "nuqs";
import { FetchError } from "ofetch";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute("/car/$carId")({
  component: BookCar,
});

function BookCar() {
  const todayDate = new Date();
  const { t } = useTranslation();
  const { carId } = Route.useParams();
  const [pickupDate, setPickupDate] = useQueryState<Date>("pickupDate", {
    parse: (v) => new Date(`${v}T00:00:00+05:30`),
    serialize: toDateInQueryFormat,
  });
  const [dropDate, setDropDate] = useQueryState<Date>("dropDate", {
    parse: (v) => new Date(`${v}T23:59:59+05:30`),
    serialize: toDateInQueryFormat,
  });
  const [zoom, setZoom] = useState(12);
  const [center, setCenter] = useState<
    google.maps.LatLng | google.maps.LatLngLiteral
  >({ lat: 22.5726, lng: 88.3639 });

  useEffect(() => {
    dropDate?.setHours(23, 59, 59, 999);
    setDropDate(dropDate);
  }, [dropDate, pickupDate]);

  const carDetails = useQuery({
    queryKey: ["car", carId],
    queryFn: async () => {
      const response = await api<APIResponse<{ car: Car; branch: Branch }>>(
        `/car.getById/${carId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          method: "GET",
        }
      );

      if (!response.data) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });

  const handleBookNow = useMutation({
    mutationFn: async () => {
      if (!pickupDate || !dropDate) {
        throw new Error("Please select pickup and drop off date");
      }

      pickupDate.setHours(0, 0, 0, 0);
      dropDate.setHours(23, 59, 59, 999);

      const response = await api(`/car.request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          car: carId,
          from: toISODateWithLocalTimeZone(pickupDate),
          to: toISODateWithLocalTimeZone(dropDate),
        }),
      });

      if (!response.data) {
        throw new Error(response.error);
      }

      toast("Car booked successfully");
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast(error.data.error ?? "An error occurred");
        return;
      }

      toast(
        error.message ?? "An error occurred. Please try again after some time"
      );
    },
  });

  if (carDetails.isLoading || !carDetails.data) {
    return <div>Loading...</div>;
  }

  if (carDetails.isError) {
    return <div>Error: {carDetails.error.message}</div>;
  }

  const { car, branch } = carDetails.data;

  return (
    <div className="container mx-auto p-4 ">
      <div className="flex flex-col gap-8">
        {/* Image Carousel Section */}
        <Card className="overflow-hidden">
          <CardHeader className="p-0">
            <AutoScrollCarousel images={car.images} />
          </CardHeader>
        </Card>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {car.brand} {car.model}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                  {car.year} • {car.regNo}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-lg">
                    ₹{car.ratePerHour * 24}/day
                  </Badge>
                  <Badge variant="secondary">
                    <DropletsIcon className="h-4 w-4 mr-1" />
                    {car.mileage} kmpl
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="flex flex-col items-center">
                  <GaugeIcon className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">{car.topSpeed}</span>
                  <span className="text-xs text-muted-foreground">km/h</span>
                </div>
                <div className="flex flex-col items-center">
                  <CogIcon className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">
                    {car.transmission}
                  </span>
                  <span className="text-xs text-muted-foreground">Trans.</span>
                </div>
                <div className="flex flex-col items-center">
                  <UsersIcon className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">{car.seats}</span>
                  <span className="text-xs text-muted-foreground">Seats</span>
                </div>
                <div className="flex flex-col items-center">
                  <FuelIcon className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">{car.fuelType}</span>
                  <span className="text-xs text-muted-foreground">Fuel</span>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Book Your Ride</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-full">
                    <Label htmlFor="pickupDate">
                      {t("search.fields.pickupDate")}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full max-w-sm justify-start text-left font-normal px-3 py-5 rounded-lg",
                            !pickupDate && "text-muted-foreground"
                          )}
                        >
                          {pickupDate ? (
                            // @ts-ignore
                            format(pickupDate, "PPP")
                          ) : (
                            <span>{t("search.fields.pickupDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={pickupDate ?? undefined}
                          onSelect={(date) => {
                            if (date) {
                              setPickupDate(date);
                              if (!dropDate || date > dropDate) {
                                setDropDate(date);
                              }
                            }
                          }}
                          fromDate={todayDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-full">
                    <Label htmlFor="dropDate">
                      {t("search.fields.dropOffDate")}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full max-w-sm justify-start text-left font-normal px-3 py-5 rounded-lg",
                            !dropDate && "text-muted-foreground"
                          )}
                        >
                          {dropDate ? (
                            // @ts-ignore
                            format(dropDate, "PPP")
                          ) : (
                            <span>{t("search.fields.dropOffDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dropDate ?? undefined}
                          onSelect={(date) => {
                            if (date) {
                              setDropDate(date);
                            }
                          }}
                          fromDate={pickupDate ?? todayDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Distance Included</span>
                    <span>200 KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("booking.avg-price-per-day")} (24 hours)</span>
                    <span>₹{car.ratePerHour * 24}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleBookNow.mutateAsync()}
                  disabled={!pickupDate || !dropDate || handleBookNow.isPending}
                >
                  {handleBookNow.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {t("booknow-button")}
                </Button>
              </CardFooter>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <h2 className="text-xl font-semibold">
                  {branch.name} - {branch.address}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg">
                <APIProvider apiKey={import.meta.env.VITE_MAPS_API}>
                  <Map
                    gestureHandling="cooperative"
                    zoom={zoom}
                    center={center}
                    streetViewControl={false}
                    fullscreenControl={false}
                    onZoomChanged={(ev) => {
                      setZoom(ev.detail.zoom);
                    }}
                    onCenterChanged={(ev) => {
                      setCenter(ev.detail.center);
                    }}
                    className="w-full aspect-square [&>div]:rounded-lg border rounded-lg"
                  />
                </APIProvider>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AutoScrollCarousel({ images }: { images: string[] }) {
  const [currentImage, setCurrentImage] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(goToNext, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    resetInterval();
  };

  const goToNext = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
    resetInterval();
  };

  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(goToNext, 5000);
    }
  };

  return (
    <div className="relative w-full aspect-[16/9]">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt="car"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 backdrop-blur-sm"
      >
        <ArrowRight className="transform rotate-180 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-2 backdrop-blur-sm"
      >
        <ArrowRight className="text-white" />
      </button>
    </div>
  );
}
