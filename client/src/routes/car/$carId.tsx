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
import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/car/$carId")({
  component: BookCar,
  loader(ctx) {
    const { carId } = ctx.params;

    return {
      id: carId,
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      images: [
        "https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?q=80&w=1920&h=1080&auto=format&fit=crop",
        "https://plus.unsplash.com/premium_photo-1683134240084-ba074973f75e?q=80&w=1920&h=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1920&h=1080&auto=format&fit=crop",
      ],
      ratePerHour: 360,
      rating: 4,
      mileage: 14,
      fuelType: "Petrol",
      transmission: "Automatic",
      seats: 5,
      topSpeed: 180,
      branch: "Downtown",
      address: "123 Yonge St, Toronto, ON M5C 1W4",
      description:
        "The Toyota Corolla is a line of subcompact and compact cars manufactured by Toyota. Introduced in 1966, the Corolla was the best-selling car worldwide by 1974 and has been one of the best-selling cars in the world since then.",
      coordinates: {
        lat: 43.653225,
        lng: -79.383186,
      },
    };
  },
});

function BookCar() {
  const car = Route.useLoaderData();
  const todayDate = new Date();

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
              Rs. <span className="font-semibold">{car.ratePerHour * 24}</span>{" "}
              /day
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
          <p>{car.branch}</p>
          <h2 className="text-xl font-semibold mt-4">Description</h2>
          <p>{car.description}</p>
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
            <span>60 KM</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Avg Price</span>
            <span>Rs. 123</span>
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
                {car.address} ({car.branch})
              </h2>
            </div>
            <APIProvider apiKey="">
              <Map
                center={car.coordinates}
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
                <Marker position={car.coordinates} />
              </Map>
            </APIProvider>
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
