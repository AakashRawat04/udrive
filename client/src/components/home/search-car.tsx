import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/classes";
import { format } from "date-fns/format";
import {
  Calendar as CalendarIcon,
  CheckIcon,
  MapPinIcon,
  SearchIcon,
} from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { useQueryState } from "nuqs";
import { api, type APIResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Branch } from "@/data/branch";
import type { User } from "@/data/user";
import { Link } from "@tanstack/react-router";

export const SearchForm: React.FC = () => {
  const [location, setLocation] = useQueryState("location");
  const [pickupDate, setPickupDate] = useQueryState<Date>("pickupDate", {
    parse: (v) => new Date(v),
    serialize: (v) => `${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`,
  });
  const [dropDate, setDropDate] = useQueryState<Date>("dropDate", {
    parse: (v) => new Date(v),
    serialize: (v) => `${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`,
  });
  const today = new Date();

  const branches = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const branches = await api<
        APIResponse<
          {
            branch: Branch;
            user: User;
          }[]
        >
      >("/branch.getAll", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!branches.data) {
        throw new Error(branches.error);
      }

      return branches.data;
    },

  });

  const canSubmit = location && pickupDate && dropDate;

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardContent className="p-6">
        <form className="flex flex-col md:flex-row items-end gap-6 md:gap-4">
          <div className="grid gap-6 md:grid-cols-3 w-full">
            <div className="flex flex-col gap-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-[42px]",
                      !location && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPinIcon className="h-4 w-4 shrink-0 opacity-50" />
                      <span className="truncate">
                        {branches.data?.find(
                          ({ branch }) => branch.id === location
                        )?.branch.name ?? "Select Location..."}
                      </span>
                    </div>
                    <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search location..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No locations found.</CommandEmpty>
                      <CommandGroup>
                        {branches.data?.map(({ branch }) => (
                          <CommandItem
                            key={branch.id}
                            value={branch.id}
                            onSelect={() => setLocation(branch.id)}
                          >
                            <MapPinIcon className="h-4 w-4 mr-2 opacity-50" />
                            {branch.name}
                            <CheckIcon
                              className={cn(
                                "ml-auto h-4 w-4",
                                location === branch.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="pickupDate" className="text-sm font-medium">
                Pick up date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start h-[42px]",
                      !pickupDate && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                      {pickupDate ? (
                        // @ts-ignore
                        format(pickupDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                    fromDate={today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dropDate" className="text-sm font-medium">
                Drop off date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start h-[42px]",
                      !dropDate && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                      {dropDate ? (
                        // @ts-ignore
                        format(dropDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dropDate ?? undefined}
                    onSelect={(date) => {
                      if (date) {
                        setDropDate(date);
                      }
                    }}
                    fromDate={pickupDate ?? today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            disabled={!canSubmit}
            className="w-full md:w-auto h-[42px] gap-2"
            asChild
          >
            <Link
              to="/search"
              search={{
                location,
                pickupDate: `${pickupDate?.getFullYear()}-${(pickupDate?.getMonth() ?? 0) + 1}-${pickupDate?.getDate()}`,
                dropDate: `${dropDate?.getFullYear()}-${(dropDate?.getMonth() ?? 0) + 1}-${dropDate?.getDate()}`,
              }}
            >
              <SearchIcon className="h-4 w-4" />
              Search Cars
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
