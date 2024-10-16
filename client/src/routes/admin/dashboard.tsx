import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { car } from "@/data/car";
import { cn } from "@/lib/classes";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRight, CalendarIcon } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex flex-col p-6 md:px-20">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1">
        Welcome to the dashboard! This is a protected route that only logged
        admin users can access.
      </p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 max-w-lg gap-2">
        <Button
          size="lg"
          asChild
          className="bg-blue-500 hover:bg-blue-600/90 text-white font-bold py-2 px-4 rounded-md"
        >
          <Link to="/admin/manage/cars">Manage Cars</Link>
        </Button>
        <Button
          size="lg"
          asChild
          className="bg-green-500 hover:bg-green-600/90 text-white font-bold py-2 px-4 rounded-md"
        >
          <Link to="/admin/manage/branches">Manage Branches</Link>
        </Button>
        <Button
          size="lg"
          asChild
          className="bg-yellow-600 hover:bg-yellow-700/90 text-white font-bold py-2 px-4 rounded-md"
        >
          <Link to="/admin/manage/admins">Manage Admins</Link>
        </Button>
      </div>
      <Tabs defaultValue="upcoming" className="w-full mt-4">
        <TabsList className="mb-2 flex flex-col md:flex-row h-full w-full md:w-max justify-start">
          <TabsTrigger value="upcoming" className="text-lg font-semibold w-full">
            Upcoming Bookings
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="text-lg font-semibold w-full">
            On-going Bookings
          </TabsTrigger>
          <TabsTrigger value="request" className="text-lg font-semibold w-full">
            Booking Requests
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          {new Array(5).fill(0).map((_, i) => (
            <div className="relative" key={i}>
              <h2 className="font-semibold text-sm text-muted-foreground absolute left-2 top-1">
                {i + 1}.
              </h2>
              <Booking />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="ongoing" className="space-y-4">
          {new Array(5).fill(0).map((_, i) => (
            <div className="relative" key={i}>
              <h2 className="font-semibold text-sm text-muted-foreground absolute left-2 top-1">
                {i + 1}.
              </h2>
              <Booking />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="request" className="space-y-4">
          {new Array(5).fill(0).map((_, i) => (
            <div className="relative" key={i}>
              <h2 className="font-semibold text-sm text-muted-foreground absolute left-2 top-1">
                {i + 1}.
              </h2>
              <Booking />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Booking() {
  return (
    <Card>
      <CardContent className="flex flex-col md:flex-row items-center md:space-x-4 pt-4">
        <div className="flex items-center space-x-4 w-full">
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="User Avatar"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-gray-600">john.doe@example.com</p>
            <p className="text-gray-600">(123) 456-7890</p>
          </div>
        </div>
        <hr className="border-r border-gray-300 my-2 md:my-0 w-full h-[1px] md:w-[1px] md:h-28" />
        <div className="w-full">
          <h1 className="text-gray-700">
            {car.brand} {car.model}
          </h1>
          <p className="text-2xl font-semibold">{car.regNo}</p>
        </div>
        <hr className="border-r border-gray-300 w-full my-2 md:my-0 h-[1px] md:w-[1px] md:h-28" />
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div className="w-full flex flex-col gap-2">
              <Label
                htmlFor="dropDate"
                className="text-muted-foreground font-normal"
              >
                Pick up date
              </Label>
              <Button
                variant="outline"
                className={cn(
                  "w-full max-w-sm justify-start text-left font-normal px-3 py-5 rounded-lg disabled:pointer-events-none"
                )}
              >
                {/* @ts-ignore */}
                {format(new Date(), "PPP")}
                <CalendarIcon className="ml-auto h-4 w-4" />
              </Button>
            </div>
            <div className="w-full flex flex-col gap-2">
              <Label
                htmlFor="dropDate"
                className="text-muted-foreground font-normal"
              >
                Drop off date
              </Label>
              <Button
                variant="outline"
                className={cn(
                  "w-full max-w-sm justify-start text-left font-normal px-3 py-5 rounded-lg disabled:pointer-events-none"
                )}
              >
                {/* @ts-ignore */}
                {format(new Date(), "PPP")}
                <CalendarIcon className="ml-auto h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 justify-between">
            <Button
              className="w-full bg-black hover:bg-black/90 text-white font-semibold py-2 px-4 rounded-md"
              size="lg"
              asChild
            >
              <Link
                to="/track/car/$carId"
                params={{
                  carId: car.id,
                }}
              >
                Track Car <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button
              className="w-full font-semibold py-2 px-4 rounded-md"
              size="lg"
              asChild
            >
              <Link
                to="/track/car/$carId"
                params={{
                  carId: car.id,
                }}
              >
                Complete Ride
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
