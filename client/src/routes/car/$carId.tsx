import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GearIcon, PersonIcon } from "@radix-ui/react-icons";
import { createFileRoute, useParams } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarIcon,
  DropletsIcon,
  FuelIcon,
  GaugeIcon,
  MapPin,
  StarIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Car } from "@/data/car";
import { api, type APIResponse } from "@/lib/api";
import type { Branch } from "@/data/branch";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/car/$carId")({
  component: BookCar,
});

function BookCar() {
  const todayDate = new Date();
  const { carId } = Route.useParams();

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
    refetchInterval: 10000,
  })

  if (carDetails.isLoading || !carDetails.data) {
    return <div>Loading...</div>
  }

  if (carDetails.isError) {
    return <div>Error: {carDetails.error.message}</div>
  }

  const { car, branch } = carDetails.data;

  return (
    <div className="flex flex-col p-4 md:p-10">
      <div className="max-h-[450px] overflow-hidden rounded-xl">
        <AutoScrollCarousel images={car.images} />
      </div>
      <div className="flex flex-col md:flex-row mt-10 px-4 gap-8">
        <div className="flex-[2]">
          <h1 className="text-3xl font-bold">
            {car.brand} {car.model}
          </h1>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xl">
              ₹{car.ratePerHour}/hr
              <span className="text-muted-foreground text-sm">
                {" "}
                | ₹{car.ratePerHour * 24}
                /day
              </span>
            </span>
            <span className="flex items-center">
              <DropletsIcon className="mr-1" />
              {car.mileage} kmpl
            </span>
          </div>
          <div className="flex items-center mt-2">
            <StarIcon fill="orange" stroke="0" className="h-5 w-5" />
            <span className="ml-2">{car.rating} out of 5</span>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="flex flex-col items-center">
              <GaugeIcon className="h-5 w-5" />
              <span>{car.topSpeed} km/h</span>
            </div>
            <div className="flex flex-col items-center">
              <GearIcon className="h-5 w-5" />
              <span>{car.transmission}</span>
            </div>
            <div className="flex flex-col items-center">
              <PersonIcon className="h-5 w-5" />
              <span>{car.seats} seats</span>
            </div>
            <div className="flex flex-col items-center">
              <FuelIcon className="h-5 w-5" />
              <span>{car.fuelType}</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4">Managed By</h2>
          <p>{branch.name}</p>
          <div className="flex flex-col space-y-4 mt-4">
            <div className="flex gap-2 w-full">
              <div className="w-full">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between py-5 mt-1"
                    >
                      <span>Pick a date</span>
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={todayDate}
                      fromDate={todayDate}
                      onSelect={() => {}}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-full">
                <Label htmlFor="dropDate">Drop Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between py-5 mt-1"
                    >
                      <span>Pick a date</span>
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={todayDate}
                      fromDate={todayDate}
                      onSelect={() => {}}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <span>Distance Included</span>
            <span>200 KM</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Avg Price</span>
            <span>Rs. {car.ratePerHour * 24} (24 hours)</span>
          </div>
          <Button
            variant="default"
            className="w-full mt-4 bg-black hover:bg-black/90 text-white py-6 rounded-lg"
          >
            Book Now
          </Button>
        </div>
        <div className="flex-[3]">
          <div className="max-w-2xl ml-auto">
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="h-6 w-6" />
              <h2 className="text-xl font-semibold">
                {branch.address} ({branch.name})
              </h2>
            </div>
            <div>
              <APIProvider apiKey="">
                <Map
                  // center={car.coordinates}
                  zoom={14}
                  className="w-full h-full aspect-square"
                  fullscreenControl={false}
                  zoomControl={false}
                  styles={[
                    {
                      featureType: "all",
                      elementType: "labels.text",
                      stylers: [
                        {
                          color: "#878787",
                        },
                      ],
                    },
                    {
                      featureType: "all",
                      elementType: "labels.text.stroke",
                      stylers: [
                        {
                          visibility: "off",
                        },
                      ],
                    },
                    {
                      featureType: "landscape",
                      elementType: "all",
                      stylers: [
                        {
                          color: "#f9f5ed",
                        },
                      ],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "all",
                      stylers: [
                        {
                          color: "#f5f5f5",
                        },
                      ],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "geometry.stroke",
                      stylers: [
                        {
                          color: "#c9c9c9",
                        },
                      ],
                    },
                    {
                      featureType: "water",
                      elementType: "all",
                      stylers: [
                        {
                          color: "#aee0f4",
                        },
                      ],
                    },
                  ]}
                >
                  {/* <Marker position={car.coordinates} /> */}
                </Map>
              </APIProvider>
            </div>
          </div>
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
    <div className="relative w-full h-[500px]">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt="car"
          className={`absolute w-full h-full object-cover transition-opacity duration-300 ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
      >
        <ArrowRight className="transform rotate-180" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
      >
        <ArrowRight />
      </button>
    </div>
  );
}
