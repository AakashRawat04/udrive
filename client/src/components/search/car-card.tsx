import Autoplay from "embla-carousel-autoplay";
import {
  CogIcon,
  DropletsIcon,
  FuelIcon,
  GaugeIcon,
  UsersIcon,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { Car } from "@/data/car";

export const CarCard = ({ car }: { car: Car }) => (
  <Card className="w-full max-w-7xl">
    <CardContent className="p-0 flex flex-col md:flex-row">
      <div className="w-full md:w-2/5">
        <Carousel
          className="rounded-md"
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
        >
          <CarouselContent>
            {car.images.map((image, index) => (
              <CarouselItem key={index}>
                <img
                  src={image}
                  alt={`${car.model} - Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="w-full md:w-3/5 p-4 space-y-2 md:pl-8">
        <h3 className="text-xl font-bold">
          {car.brand} {car.model}
        </h3>
        <p className="font-medium">
          <DropletsIcon className="h-4 w-4 inline-block mr-1" />
          {car.mileage} kmpl
        </p>
        <p className="text-lg font-semibold">
          ₹{car.ratePerHour * 24}
          <span className="text-muted-foreground text-sm">/day</span>
        </p>
        <p className="text-muted-foreground">{car.address}</p>
        <div className="flex gap-4 pt-6 justify-between max-w-sm">
          <div className="flex flex-col items-center">
            <GaugeIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">{car.topSpeed}</span>
          </div>
          <div className="flex flex-col items-center">
            <CogIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">{car.transmission}</span>
          </div>
          <div className="flex flex-col items-center">
            <UsersIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">{car.seats}</span>
          </div>
          <div className="flex flex-col items-center">
            <FuelIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">{car.fuelType}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
