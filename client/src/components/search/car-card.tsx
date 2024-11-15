import Autoplay from "embla-carousel-autoplay";
import {
  CogIcon,
  DropletsIcon,
  FuelIcon,
  GaugeIcon, UsersIcon
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Car } from "@/data/car";
import { branch } from "@/data/branch";

export const CarCard = ({ car }: { car: Car }) => (
  <Card className="w-full hover:shadow-lg transition-shadow duration-200 overflow-hidden">
    <CardHeader className="p-0">
      <Carousel
        className="w-full"
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
              <div className="relative aspect-[16/9]">
                <img
                  src={image}
                  alt={`${car.model} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </CardHeader>
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold">
            {car.brand} {car.model}
          </h3>
          <p className="text-sm text-muted-foreground">
            {car.year} • {car.regNo}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold">₹{car.ratePerHour}</span>
          <span className="text-sm text-muted-foreground">per hour</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="flex items-center gap-1">
          <DropletsIcon className="h-3 w-3" />
          {car.mileage} kmpl
        </Badge>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center">
          <GaugeIcon className="h-5 w-5 text-muted-foreground mb-1" />
          <span className="text-sm font-medium">{car.topSpeed}</span>
          <span className="text-xs text-muted-foreground">km/h</span>
        </div>
        <div className="flex flex-col items-center">
          <CogIcon className="h-5 w-5 text-muted-foreground mb-1" />
          <span className="text-sm font-medium">{car.transmission}</span>
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
    </CardContent>
    <CardFooter className="p-6 pt-0">
      <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
        Available at {branch.name} ({branch.address})
      </Badge>
    </CardFooter>
  </Card>
);
