import { AutoForm } from "@/components/ui/autoform";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Branch } from "@/data/branch";
import { addCarSchema, type Car } from "@/data/car";
import { CarRequest, RequestStatus } from "@/data/request";
import {
  editUserFormSchema,
  newUserFormSchema,
  type EditUser,
  type NewUser,
  type User,
} from "@/data/user";
import { api, type APIResponse } from "@/lib/api";
import { cn } from "@/lib/classes";
import { toISODateWithLocalTimeZone, toTitleCase } from "@/lib/helpers";
import { useAuth } from "@/providers/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverClose } from "@radix-ui/react-popover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarIcon,
  CarIcon,
  Check,
  ChevronsUpDownIcon,
  Loader2Icon,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { FetchError } from "ofetch";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { z } from "zod";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

const carTransferSchema = z.object({
  newCarId: z
    .string({
      required_error: "Please select a car",
      invalid_type_error: "Please select a car",
      message: "Please select a car",
    })
    .uuid({
      message: "Please select a car",
    }),
});

function getCarFomatted(car: Car) {
  return `${car.regNo} - ${car.brand} ${car.model}`;
}

function Booking({
  booking,
}: {
  booking: { user: User; car: Car; car_request: CarRequest };
}) {
  const { user, car, car_request } = booking;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<null | (() => void)>(null);
  const [completeRideDialogOpen, setCompleteRideDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof carTransferSchema>>({
    resolver: zodResolver(carTransferSchema),
    defaultValues: {
      newCarId: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await updateCarRequestMutation.mutateAsync({
      status: RequestStatus.Transferred,
      newCarId: data.newCarId,
    });
  });

  const transferableCarsQuery = useQuery({
    queryKey: ["transferableCars"],
    queryFn: async () => {
      const response = await api<APIResponse<Car[]>>("/cars.transferable.get", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        query: {
          from: toISODateWithLocalTimeZone(new Date(car_request.from)),
          to: toISODateWithLocalTimeZone(new Date(car_request.to)),
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      return response.data;
    },
    enabled: isTransferDialogOpen,
    refetchInterval: 10000,
  });

  const router = useRouter();

  const queryClient = useQueryClient();

  const startCarRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await api<APIResponse<string>>(`/car.journey.start`, {
        body: {
          carRequestId: car_request.id,
        },
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Car journey started successfully");
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message ?? "An error occurred");
    },
    onSettled: () => {
      queryClient.refetchQueries();
    },
  });

  const updateCarRequestMutation = useMutation({
    mutationFn: async ({
      status,
      newCarId,
    }: {
      status: RequestStatus;
      newCarId?: string;
    }) => {
      if (status === RequestStatus.Transferred && !newCarId) {
        throw new Error("Please provide a new car ID");
      }

      const response = await api<APIResponse<string>>(`/car.request.update`, {
        body: {
          id: car_request.id,
          status,
          newCarId,
        },
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Car request updated successfully");
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message ?? "An error occurred");
    },
    onSettled: () => {
      queryClient.refetchQueries();

      if (isTransferDialogOpen) {
        form.reset();
        setIsTransferDialogOpen(false);
      }
    },
  });

  const handleDialogConfirm = () => {
    if (dialogAction) {
      dialogAction();
      setDialogAction(null);
    }
  };

  const renderActions = () => {
    switch (car_request.status) {
      case "pending":
        return (
          <>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                onClick={() => {
                  setDialogAction(
                    () => () =>
                      updateCarRequestMutation.mutate({
                        status: RequestStatus.Approved,
                      })
                  );
                }}
              >
                Approve
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => {
                  setDialogAction(
                    () => () =>
                      updateCarRequestMutation.mutate({
                        status: RequestStatus.Rejected,
                      })
                  );
                }}
              >
                Reject
              </Button>
            </DialogTrigger>
          </>
        );
      case "approved":
        return (
          <>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                onClick={() => {
                  setDialogAction(() => () => startCarRequestMutation.mutate());
                }}
              >
                Start Ride
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => {
                  setDialogAction(
                    () => () =>
                      updateCarRequestMutation.mutate({
                        status: RequestStatus.Cancelled,
                      })
                  );
                }}
              >
                Cancel
              </Button>
            </DialogTrigger>
          </>
        );
      case "cancelled":
      case "rejected":
      case "transferred":
        return (
          // This booking has been cancelled
          <Button className="w-full" variant="secondary" disabled>
            {toTitleCase(car_request.status)}
          </Button>
        );
      case "completed":
        return (
          // This booking has been completed
          <Button className="w-full" variant="secondary" disabled>
            Rs. {car_request.bill}
          </Button>
        );
      default:
        return null;
    }
  };

  const rideCompletionMutation = useMutation({
    mutationFn: async (bill: number) => {
      const response = await api<APIResponse<string>>(`/car.journey.end`, {
        body: {
          carRequestId: car_request.id,
          bill,
        },
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Ride completed successfully");
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message ?? "An error occurred");
    },
    onSettled: () => {
      queryClient.refetchQueries();
    },
  });

  const handleRideCompletion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bill = Number(formData.get("bill"));

    await rideCompletionMutation.mutateAsync(bill);
    setCompleteRideDialogOpen(false);
  };

  return (
    <Card>
      <CardContent className="flex flex-col md:flex-row items-center md:space-x-4 pt-4">
        <div className="flex items-center space-x-4 w-full">
          <div className="px-4">
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <a href={`tel:${user.phone}`} className="text-gray-600">
                {user.phone}
              </a>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="mt-2" asChild>
                <a href={user.panCard} target="_blank" rel="noreferrer">
                  View Pan Card
                </a>
              </Button>
              <Button variant="outline" className="mt-2" asChild>
                <a href={user.drivingLicense} target="_blank" rel="noreferrer">
                  View License
                </a>
              </Button>
            </div>
          </div>
        </div>
        <hr className="border-r border-gray-300 my-2 md:my-0 w-full h-[1px] md:w-[1px] md:h-28" />
        <div className="w-full">
          <h1 className="text-gray-700">
            {car.brand} {car.model}
          </h1>
          <p className="text-2xl font-semibold">{car.regNo}</p>
          <Button variant="outline" className="mt-2" asChild>
            <Link
              to="/car/$carId"
              params={{
                carId: car.id,
              }}
            >
              View Car
            </Link>
          </Button>
        </div>
        <hr className="border-r border-gray-300 w-full my-2 md:my-0 h-[1px] md:w-[1px] md:h-28" />
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div className="w-full flex flex-col gap-2">
              <Label
                htmlFor="pickupDate"
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
                {format(
                  car_request.status === "completed"
                    ? new Date(car_request.startTime!)
                    : new Date(car_request.from),
                  car_request.status === "completed" ? "hh:mm a, P" : "PPP"
                )}
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
                {format(
                  car_request.status === "completed"
                    ? new Date(car_request.endTime!)
                    : new Date(car_request.to),
                  car_request.status === "completed" ? "hh:mm a, P" : "PPP"
                )}
                <CalendarIcon className="ml-auto h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 justify-between">
            {car_request.status === "started" && (
              <>
                <Dialog
                  open={completeRideDialogOpen}
                  onOpenChange={setCompleteRideDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      End Ride
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-6 bg-white rounded-lg shadow-lg gap-0">
                    <h2 className="text-lg font-semibold mb-4">Billing</h2>
                    <p className="text-gray-600 mb-1">
                      Please enter the bill amount for this ride
                    </p>
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={handleRideCompletion}
                    >
                      <Input
                        type="number"
                        name="bill"
                        placeholder="Enter bill amount"
                        className="rounded-xl h-auto focus-visible:ring-0 outline-none p-2 text-5xl md:text-5xl font-bold shadow-none border-x-0 border-t-0 border-b remove-spin"
                        min={0}
                        required
                      />
                      <div className="flex gap-4 justify-end">
                        <Button
                          variant="secondary"
                          onClick={() => setCompleteRideDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
                          type="submit"
                        >
                          Confirm
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  disabled
                  className="w-full select-none"
                  variant="secondary"
                  onClick={() => {
                    router.navigate({
                      to: "/car/$carId",
                      params: {
                        carId: car.id,
                      },
                    });
                  }}
                >
                  Track Car <ArrowRight className="ml-2" />
                </Button>
              </>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              {renderActions()}
              <DialogContent>
                <h2 className="text-lg font-semibold">Confirm Action</h2>
                <p className="text-gray-600">
                  Are you sure you want to proceed with this action?
                </p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDialogConfirm();
                      setDialogOpen(false);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {car_request.status === "started" && (
            <div className="flex gap-2 justify-between">
              <Dialog
                open={isTransferDialogOpen}
                onOpenChange={(isOpen) => {
                  setIsTransferDialogOpen(isOpen);
                  form.reset();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-black text-white hover:bg-black/80">
                    Transfer Booking
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Transfer Booking</DialogTitle>
                  <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="newCarId"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                Select the car you want to transfer the booking
                                to
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full max-w-xs justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? getCarFomatted(
                                          transferableCarsQuery.data?.find(
                                            (car) => car.id === field.value
                                          )!
                                        )
                                      : "Select Car"}
                                    <ChevronsUpDownIcon className="opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-full p-0"
                                  align="start"
                                >
                                  <Command
                                    filter={(value, search) => {
                                      const car =
                                        transferableCarsQuery.data?.find(
                                          (car) => car.id === value
                                        );

                                      return Number(
                                        car?.regNo
                                          .toLowerCase()
                                          .includes(search.toLowerCase()) ||
                                          car?.brand
                                            .toLowerCase()
                                            .includes(search.toLowerCase()) ||
                                          car?.model
                                            .toLowerCase()
                                            .includes(search.toLowerCase())
                                      );
                                    }}
                                  >
                                    <CommandInput
                                      placeholder="Search for car..."
                                      className="h-9"
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        No cars available for transfer
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {transferableCarsQuery.data?.map(
                                          (car) => (
                                            <CommandItem
                                              key={car.id}
                                              value={car.id}
                                              onSelect={(currentValue) => {
                                                form.setValue(
                                                  "newCarId",
                                                  currentValue
                                                );
                                              }}
                                            >
                                              {getCarFomatted(car)}
                                              <Check
                                                className={cn(
                                                  "ml-auto",
                                                  field.value === car.id
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                            </CommandItem>
                                          )
                                        )}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <div className="flex gap-2 mt-4 float-right">
                        <DialogClose
                          asChild
                          disabled={updateCarRequestMutation.isPending}
                        >
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={updateCarRequestMutation.isPending}
                        >
                          {updateCarRequestMutation.isPending && (
                            <Loader2Icon className="animate-spin" />
                          )}
                          Transfer Booking
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomDrawer({
  title,
  triggerTitle,
  triggerComponentProps,
  drawerContentProps,
  children,
  nested = false,
  isLoading,
  onRefetch,
  drawerOpen,
  setDrawerOpen,
}: {
  title: string;
  triggerTitle?: string | React.ReactNode;
  triggerComponentProps?: React.ComponentPropsWithoutRef<typeof Button>;
  drawerContentProps?: React.ComponentPropsWithoutRef<typeof Drawer.Content>;
  children?: React.ReactNode;
  nested?: boolean;
  isLoading?: boolean;
  onRefetch?: () => void;
  drawerOpen?: boolean;
  setDrawerOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const Root = nested ? Drawer.Root : Drawer.NestedRoot;

  return (
    <Root
      direction="right"
      shouldScaleBackground
      repositionInputs={true}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
    >
      <Drawer.Trigger
        asChild
        onClick={() => {
          setDrawerOpen?.(false);
        }}
      >
        <Button {...triggerComponentProps}>{triggerTitle || title}</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content
          {...drawerContentProps}
          className={cn(
            "right-0 md:right-2 top-0 md:top-2 bottom-0 md:bottom-2 fixed z-50 outline-none w-full max-w-xl flex",
            drawerContentProps?.className
          )}
          // The gap between the edge of the screen and the drawer is 8px in this case.
          style={
            {
              "--initial-transform": "calc(100% + 8px)",
            } as React.CSSProperties
          }
        >
          <div className="bg-zinc-50 h-full w-full grow p-5 flex flex-col md:rounded-[16px]">
            <Drawer.Title className="font-medium mb-4 text-zinc-900 underline underline-offset-4 flex gap-2 items-center">
              {title}
              {isLoading !== undefined && onRefetch !== undefined && (
                <span>
                  <Button
                    variant="secondary"
                    className={cn("rounded-xl")}
                    onClick={onRefetch}
                    size="icon"
                  >
                    <RefreshCcw
                      className={cn("size-4 hidden", !isLoading && "block")}
                    />
                    <Loader2Icon
                      className={cn(
                        "animate-spin hidden size-4 text-gray-400",
                        isLoading && "block"
                      )}
                    />
                  </Button>
                </span>
              )}
            </Drawer.Title>
            {children}
            <Drawer.Close
              className="fixed left-1/2 -translate-x-1/2 bottom-5"
              onClick={() => {
                setDrawerOpen?.(false);
              }}
            >
              <Button
                variant="destructive"
                className="rounded-xl bg-black hover:bg-black/80"
              >
                Close Drawer
              </Button>
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Root>
  );
}

function OneBranch({ branch, user }: { branch: Branch; user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const handleDeleteBranch = useMutation({
    mutationFn: async (id: string) => {
      setIsOpen(false);
      const response = await api<APIResponse<string>>(`/branch.delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Branch deleted successfully");
      setIsEditDrawerOpen(false);
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["branches"],
      });
    },
  });

  const handleUpdateBranch = useMutation({
    mutationFn: async (branch: {
      id: string;
      name: string;
      address: string;
      admin: string;
    }) => {
      branch.admin =
        admins?.find((admin) => admin.email === branch.admin)?.id ??
        "no-admin-available";

      const response = await api<APIResponse<string>>(`/branch.update`, {
        body: branch,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Branch updated successfully");
      setIsEditDrawerOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["branches"],
      });
    },
  });

  const queryClient = useQueryClient();

  const admins = queryClient.getQueryData<User[]>(["admins"]);
  const selectAdmins = admins?.map((admin) => admin.email) ?? [];

  const editBranchSchema = z.object({
    name: z.string().max(255),
    address: z.string(),
    admin: z.string().email(),
  });

  const form = useForm<z.infer<typeof editBranchSchema>>({
    resolver: zodResolver(editBranchSchema),
    defaultValues: {
      name: branch.name,
      address: branch.address,
      admin: user.email,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await handleUpdateBranch.mutateAsync({
      ...data,
      id: branch.id,
    });
    form.reset();
  });

  return (
    <Button
      variant="outline"
      className="w-full justify-start items-start h-full bg-accent rounded-xl p-2 flex flex-col md:flex-row"
    >
      <div className="flex flex-col gap-1 text-left">
        <h2 className="text-lg font-semibold  inline-block mr-1">
          {branch.name}
        </h2>
        <p className="text-gray-600 inline-block">
          {user.name} ({user.email})
        </p>
        <div className="flex gap-2">
          <CustomDrawer
            title="Edit Branch"
            triggerComponentProps={{
              variant: "outline",
              className:
                "w-max bg-gray-100 rounded-lg flex justify-center items-center font-medium text-zinc-900 mt-2",
            }}
            drawerOpen={isEditDrawerOpen}
            setDrawerOpen={setIsEditDrawerOpen}
            nested
          >
            <ScrollArea>
              <Form {...form}>
                <form onSubmit={onSubmit} className="p-1 flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Branch Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="address">Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Branch Address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="admin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="admin">Admin</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>{field.value}</SelectTrigger>
                            <SelectContent>
                              {selectAdmins.map((admin) => (
                                <SelectItem key={admin} value={admin}>
                                  {admin}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full font-semibold py-2 px-4 rounded-md mt-4"
                  >
                    {handleUpdateBranch.isPending && (
                      <Loader2Icon className="animate-spin" />
                    )}
                    Update Branch
                  </Button>
                </form>
              </Form>
            </ScrollArea>
          </CustomDrawer>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="destructive"
                className="w-max rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                disabled={handleDeleteBranch.isPending}
              >
                <Loader2Icon
                  className={cn(
                    "animate-spin hidden",
                    handleDeleteBranch.isPending && "block"
                  )}
                />
                Delete Branch
              </Button>
            </PopoverTrigger>
            <PopoverContent className="rounded-lg">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  Are you absolutely sure?
                </h2>
                <p className="text-gray-600">
                  This action cannot be undone. This will permanently delete the
                  branch.
                </p>
                <div className="flex gap-2">
                  <PopoverClose asChild>
                    <Button
                      variant="secondary"
                      className="w-full rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                    >
                      Cancel
                    </Button>
                  </PopoverClose>
                  <Button
                    variant="destructive"
                    className="w-full rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                    onClick={() => handleDeleteBranch.mutateAsync(branch.id)}
                    disabled={handleDeleteBranch.isPending}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Button>
  );
}

function OneUser({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteAdmin = useMutation({
    mutationFn: async (id: string) => {
      setIsOpen(false);
      const response = await api<APIResponse<string>>(
        `/auth/admin.delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Admin deleted successfully");
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admins"],
      });
    },
  });

  const handleUpdateAdmin = useMutation({
    mutationFn: async (
      user: EditUser & {
        id: string;
      }
    ) => {
      const response = await api<APIResponse<string>>(
        `/auth/admin.update/${user.id}`,
        {
          body: user,
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Admin updated successfully");
      setIsEditDrawerOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admins"],
      });
    },
  });

  return (
    <Button
      variant="outline"
      className="w-full justify-start items-start h-full bg-accent rounded-xl p-2 flex flex-col md:flex-row"
    >
      <div className="flex flex-col gap-1 text-left">
        <h2 className="text-lg font-semibold  inline-block mr-1">
          {user.name}
        </h2>
        <p className="text-gray-600 inline-block">{user.email}</p>
        <div className="flex gap-2">
          <CustomDrawer
            title="Edit User"
            triggerComponentProps={{
              variant: "outline",
              className:
                "w-max bg-gray-100 rounded-lg flex justify-center items-center font-medium text-zinc-900 mt-2",
            }}
            drawerOpen={isEditDrawerOpen}
            setDrawerOpen={setIsEditDrawerOpen}
            nested
          >
            <ScrollArea>
              <AutoForm
                schema={editUserFormSchema}
                values={user}
                onSubmit={(data) =>
                  handleUpdateAdmin.mutateAsync({
                    ...data,
                    id: user.id,
                  })
                }
                uiComponents={{
                  SubmitButton: ({ children }) => {
                    return (
                      <Button
                        className="w-full font-semibold py-2 px-4 rounded-md mt-4"
                        size="lg"
                        disabled={handleUpdateAdmin.isPending}
                      >
                        {handleUpdateAdmin.isPending && (
                          <Loader2Icon className="animate-spin" />
                        )}
                        {children}
                      </Button>
                    );
                  },
                }}
                formProps={{
                  className: "pl-1 pr-5 mb-20 flex flex-col gap-2",
                }}
                withSubmit
              />
            </ScrollArea>
          </CustomDrawer>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="destructive"
                className="w-max rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                disabled={handleDeleteAdmin.isPending}
              >
                <Loader2Icon
                  className={cn(
                    "animate-spin hidden",
                    handleDeleteAdmin.isPending && "block"
                  )}
                />
                Delete User
              </Button>
            </PopoverTrigger>
            <PopoverContent className="rounded-lg">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  Are you absolutely sure?
                </h2>
                <p className="text-gray-600">
                  This action cannot be undone. This will permanently delete the
                  user.
                </p>
                <div className="flex gap-2">
                  <PopoverClose asChild>
                    <Button
                      variant="secondary"
                      className="w-full rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                    >
                      Cancel
                    </Button>
                  </PopoverClose>
                  <Button
                    variant="destructive"
                    className="w-full rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                    onClick={() => handleDeleteAdmin.mutateAsync(user.id)}
                    disabled={handleDeleteAdmin.isPending}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Button>
  );
}

function OneCar({ car, branch }: { car: Car; branch: Branch }) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteCarMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api<APIResponse<string>>(`/car.delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Car deleted successfully");
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["cars"],
      });
    },
  });

  return (
    <Button
      variant="outline"
      className="w-full justify-start items-start h-full bg-accent rounded-xl p-2 flex flex-col md:flex-row"
    >
      <img
        src={car.images[0]}
        alt={car.brand + " " + car.model}
        className="w-auto h-full md:h-[150px] rounded-lg aspect-video md:aspect-square object-cover object-left"
      />
      <div className="flex flex-col gap-1 text-left">
        <div>
          <h2 className="text-lg font-semibold  inline-block mr-1">
            {car.brand} {car.model}
          </h2>
          <p className="text-gray-600 inline-block">{car.regNo}</p>
        </div>
        <div className="flex gap-1">
          <p className="text-gray-600">{car.ratePerHour} / hr</p>
        </div>
        <div>
          <p className="text-gray-600">{branch.name},</p>
          <p className="text-gray-600 mr-1">{branch.address}</p>
        </div>
        <div className="flex gap-2">
          <CustomDrawer
            title="Edit Car"
            triggerComponentProps={{
              variant: "outline",
              className:
                "w-max bg-gray-100 rounded-lg flex justify-center items-center font-medium text-zinc-900 mt-2",
            }}
            setDrawerOpen={setIsEditDrawerOpen}
            drawerOpen={isEditDrawerOpen}
            nested
          >
            <ScrollArea className="mb-12">
              <CarForm
                car={car}
                branch={branch}
                onCarAdded={() => {
                  setIsEditDrawerOpen(false);
                }}
              />
            </ScrollArea>
          </CustomDrawer>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="destructive"
                className="w-max rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                disabled={deleteCarMutation.isPending}
              >
                <Loader2Icon
                  className={cn(
                    "animate-spin hidden",
                    deleteCarMutation.isPending && "block"
                  )}
                />
                Delete Car
              </Button>
            </PopoverTrigger>
            <PopoverContent className="rounded-lg">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  Are you absolutely sure?
                </h2>
                <p className="text-gray-600">
                  This action cannot be undone. This will permanently delete the
                  car.
                </p>
                <div className="flex gap-2">
                  <PopoverClose asChild>
                    <Button
                      variant="secondary"
                      className="w-full rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                    >
                      Cancel
                    </Button>
                  </PopoverClose>
                  <Button
                    variant="destructive"
                    className="w-full rounded-lg flex justify-center items-center font-medium mt-2 border border-input"
                    onClick={() => deleteCarMutation.mutateAsync(car.id)}
                    disabled={deleteCarMutation.isPending}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Button>
  );
}

async function addNewAdmin(admin: NewUser) {
  const response = await api<APIResponse<string>>("/auth/admin.create", {
    body: admin,
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.data) {
    throw new Error(response.error!);
  }
}

function CarForm({
  car,
  branch,
  onCarAdded,
}: {
  car?: Car;
  branch?: Branch;
  onCarAdded?: () => void;
}) {
  const queryClient = useQueryClient();
  const branches = queryClient.getQueryData<{ branch: Branch; user: User }[]>([
    "branches",
  ]);

  const branchNames = branches?.map((branch) => branch.branch.name) ?? [];

  if (car) {
    const carBranch = branches?.find((data) => data.branch.id === branch?.id);
    if (carBranch) {
      car.branch = carBranch.branch.name;
    }
  }

  const form = useForm<z.infer<typeof addCarSchema>>({
    resolver: zodResolver(addCarSchema),
    defaultValues: car,
  });

  const [images, setImages] = useState<File[]>([]);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const uploadImageInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useMutation({
    mutationFn: async (image: File) => {
      setCurrentImage(image);
      const formData = new FormData();
      formData.append("image", image);

      const response = await api<APIResponse<string>>("/image.upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      return response.data;
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message ?? "An error occurred");
    },
    onSettled: () => {
      uploadImageInputRef.current?.value &&
        (uploadImageInputRef.current.value = "");
      setCurrentImage(null);
    },
  });

  const route = car ? `/car.update` : "/car.create";
  const method = car ? "PUT" : "POST";

  const createCarMutation = useMutation({
    mutationFn: async (car: z.infer<typeof addCarSchema>) => {
      const response = await api<APIResponse<string>>(route, {
        body: {
          ...car,
          id: car.id,
        },
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      onCarAdded?.();

      toast.success("Car added successfully");
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occurred");
        return;
      }
      toast.error(error.message ?? "An error occurred");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["cars"],
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (url: string) => {
      const imageKey = url.split("/").pop();

      if (!imageKey) {
        throw new Error("Invalid image url");
      }

      const imageName = images.find(
        (image) => image.name === imageKey.slice(0, imageKey.lastIndexOf("-"))
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await api<APIResponse<string>>(
        `/image.delete/${imageKey}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.data) {
        throw new Error(response.error!);
      }

      setImages(images.filter((image) => image.name !== imageName?.name));
      form.setValue(
        "images",
        (form.getValues("images") ?? []).filter((imgUrl) => imgUrl !== url)
      );
      return response.data;
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message ?? "An error occurred");
    },
  });

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    if (images.some((image) => image.name === file.name)) {
      return;
    }

    event.currentTarget.value = "";

    const imageUrl = await uploadImageMutation.mutateAsync(file);
    form.setValue("images", [...(form.getValues("images") ?? []), imageUrl]);

    setImages([...images, file]);
    setCurrentImage(null);
  }

  const onSubmit = form.handleSubmit(async (data) => {
    const car = data;
    car.branch =
      branches?.find((branch) => branch.branch.name === car.branch)?.branch
        .id ?? "no-branch-available";

    await createCarMutation.mutateAsync(car);
  });

  return (
    <Form {...form}>
      <form className="p-1 mr-4 flex flex-col gap-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="brand">Brand</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Car Brand" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="model">Model</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Car Model" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="year">Year</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Car Year" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="regNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="regNo">Registration Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Registration Number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="images">Images</FormLabel>
              <FormControl>
                <Input
                  onChange={handleImageUpload}
                  accept="image/jpg,image/jpeg,image/png,image/webp"
                  type="file"
                  placeholder="image"
                  disabled={uploadImageMutation.isPending}
                />
              </FormControl>
              <div
                className={cn(
                  "bg-accent rounded-xl grid grid-cols-1 md:grid-cols-3 text-zinc-900 p-2 gap-2 text-sm min-h-[100px]"
                )}
              >
                {field.value?.map((image) => (
                  <div className="relative bg-accent border border-input rounded-md">
                    <img
                      src={image}
                      alt="Car"
                      className={cn(
                        "w-full rounded-md object-cover aspect-square",
                        deleteImageMutation.isPending && "opacity-20"
                      )}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      className="rounded-lg size-7 absolute right-1 top-1"
                      onClick={async () => {
                        await deleteImageMutation.mutateAsync(image);
                      }}
                      disabled={deleteImageMutation.isPending}
                    >
                      {deleteImageMutation.isPending ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <Trash2 />
                      )}
                    </Button>
                  </div>
                ))}
                {uploadImageMutation.isPending ? (
                  <div className="bg-accent border border-input rounded-md relative">
                    <img
                      src={
                        currentImage
                          ? URL.createObjectURL(currentImage)
                          : undefined
                      }
                      alt="Car"
                      className="w-full rounded-md object-cover opacity-20 aspect-square"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      type="button"
                      className="rounded-lg size-7 absolute right-1 top-1"
                      disabled
                    >
                      <Loader2Icon className="animate-spin" />
                    </Button>
                  </div>
                ) : (
                  (field.value ?? []).length === 0 && (
                    <div className="w-full h-full row-span-3 col-span-3 flex justify-center items-center">
                      <p>No images uploaded</p>
                    </div>
                  )
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ratePerHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="ratePerHour">Rate Per Hour</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Rate Per Hour" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mileage"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="mileage">Mileage</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Mileage" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="branch">Branch</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    {field.value ?? "Select a branch"}
                  </SelectTrigger>
                  <SelectContent>
                    {branchNames.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* fuelType, transmission, seats, topSpeed */}
        <FormField
          control={form.control}
          name="fuelType"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="fuelType">Fuel Type</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    {field.value ?? "Select Fuel Type"}
                  </SelectTrigger>
                  <SelectContent>
                    {["Petrol", "Diesel", "Electric"].map((fuelType) => (
                      <SelectItem key={fuelType} value={fuelType}>
                        {fuelType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transmission"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="transmission">Transmission</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    {field.value ?? "Select Transmission"}
                  </SelectTrigger>
                  <SelectContent>
                    {["Automatic", "Manual"].map((transmission) => (
                      <SelectItem key={transmission} value={transmission}>
                        {transmission}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seats"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="seats">Seats</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Seats" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topSpeed"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="topSpeed">Top Speed</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Top Speed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full font-semibold py-2 px-4 rounded-md mt-4"
          disabled={createCarMutation.isPending}
        >
          {createCarMutation.isPending && (
            <Loader2Icon className="animate-spin" />
          )}
          {car ? "Update Car" : "Add Car"}
        </Button>
      </form>
    </Form>
  );
}

function Dashboard() {
  const router = useRouter();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [addNewUserDrawerOpen, setAddNewUserDrawerOpen] = useState(false);
  const [addNewBranchDrawerOpen, setAddNewBranchDrawerOpen] = useState(false);
  const [addNewCarDrawerOpen, setAddNewCarDrawerOpen] = useState(false);

  const admins = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const admins = await api<APIResponse<User[]>>(
        "/auth/admin.getAllAdmins",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!admins.data) {
        throw new Error(admins.error);
      }

      return admins.data;
    },
    refetchInterval: 5000,
    enabled: auth.user?.role === "super_admin",
  });

  const selectAdmins = admins.data?.map((admin) => admin.email) ?? [];

  const addBranchSchema = z.object({
    name: z.string().max(255),
    address: z.string(),
    admin: z.string().email(),
  });

  type AddBranch = z.infer<typeof addBranchSchema>;

  const form = useForm<z.infer<typeof addBranchSchema>>({
    resolver: zodResolver(addBranchSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await handleAddBranch.mutateAsync(data);
    form.reset();
  });

  const handleAddAdmin = useMutation({
    mutationFn: addNewAdmin,
    onSuccess: () => {
      setAddNewUserDrawerOpen(false);
      toast.success("Admin added successfully");
      queryClient.invalidateQueries({
        queryKey: ["admins"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddBranch = useMutation({
    mutationFn: async (branch: AddBranch) => {
      branch.admin =
        admins.data?.find((admin) => admin.email === branch.admin)?.id ??
        "no-admin-available";

      const response = await api<APIResponse<string>>("/branch.create", {
        body: branch,
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Branch added successfully");
      setAddNewBranchDrawerOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["branches"],
      });
    },
  });

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
    refetchInterval: 5000,
    enabled: auth.user?.role === "super_admin",
  });

  const cars = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const cars = await api<
        APIResponse<
          {
            car: Car;
            branch: Branch;
          }[]
        >
      >("/car.getAll", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!cars.data) {
        throw new Error(cars.error);
      }

      return cars.data;
    },
    refetchInterval: 5000,
    enabled: auth.user?.role === "super_admin",
  });

  const bookingRequestsQuery = useQuery({
    queryFn: async () => {
      const response = await api<
        APIResponse<
          {
            user: User;
            car: Car;
            car_request: CarRequest;
          }[]
        >
      >("/car.request.list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      return response.data;
    },
    queryKey: ["bookingRequests"],
    refetchInterval: 5000,
  });

  const cancelledBookingRequestsQuery = useQuery({
    queryFn: async () => {
      const response = await api<
        APIResponse<
          {
            user: User;
            car: Car;
            car_request: CarRequest;
          }[]
        >
      >("/car.booking.cancelled", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      return response.data;
    },
    queryKey: ["cancelledBookings"],
    refetchInterval: 5000,
  });

  const completedBookingRequestsQuery = useQuery({
    queryFn: async () => {
      const response = await api<
        APIResponse<
          {
            user: User;
            car: Car;
            car_request: CarRequest;
          }[]
        >
      >("/car.booking.completed", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      return response.data;
    },
    queryKey: ["completedBookings"],
    refetchInterval: 5000,
  });

  const upcommingBookingRequestsQuery = useQuery({
    queryFn: async () => {
      const response = await api<
        APIResponse<
          {
            user: User;
            car: Car;
            car_request: CarRequest;
          }[]
        >
      >("/car.booking.upcomming", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      return response.data;
    },
    queryKey: ["upcommingBookings"],
    refetchInterval: 5000,
  });

  const ongoingBookingRequestsQuery = useQuery({
    queryFn: async () => {
      const response = await api<
        APIResponse<
          {
            user: User;
            car: Car;
            car_request: CarRequest;
          }[]
        >
      >("/car.booking.ongoing", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      return response.data;
    },
    queryKey: ["ongoingBookings"],
    refetchInterval: 5000,
  });

  if (auth.user?.role === "user") {
    router.navigate({
      to: "/",
    });
    return;
  }

  return (
    <div className="flex flex-col p-6 md:px-20">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1">Welcome to the dashboard!</p>
      {auth.user?.role === "super_admin" && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 max-w-lg gap-2">
          <CustomDrawer
            title="Manage Cars"
            triggerComponentProps={{
              size: "lg",
              className:
                "bg-blue-500 hover:bg-blue-600/90 text-white font-bold py-2 px-4 rounded-md",
            }}
            isLoading={cars.isPending || cars.isRefetching}
            onRefetch={cars.refetch}
          >
            <CustomDrawer
              title="Add Car"
              triggerTitle={
                <>
                  <CarIcon className="mr-2" /> Add a new car
                </>
              }
              triggerComponentProps={{
                variant: "outline",
                className:
                  "w-full h-[100px] bg-accent rounded-xl flex justify-center items-center font-medium text-zinc-900 mb-4",
              }}
              drawerOpen={addNewCarDrawerOpen}
              setDrawerOpen={setAddNewCarDrawerOpen}
              nested
            >
              <ScrollArea className="mb-12">
                <CarForm
                  onCarAdded={() => {
                    setAddNewCarDrawerOpen(false);
                  }}
                />
              </ScrollArea>
            </CustomDrawer>
            <ScrollArea>
              <div className="flex flex-col gap-4 mb-20">
                {cars.data?.map(({ car, branch }) => (
                  <OneCar key={car.id} car={car} branch={branch} />
                ))}
              </div>
            </ScrollArea>
          </CustomDrawer>
          <CustomDrawer
            title="Manage Branches"
            triggerComponentProps={{
              size: "lg",
              className:
                "bg-green-500 hover:bg-green-600/90 text-white font-bold py-2 px-4 rounded-md",
            }}
            isLoading={branches.isPending || branches.isRefetching}
            onRefetch={branches.refetch}
          >
            <CustomDrawer
              title="Add Branch"
              triggerTitle="Add a new branch"
              triggerComponentProps={{
                variant: "outline",
                className:
                  "w-full h-[100px] bg-accent rounded-xl flex justify-center items-center font-medium text-zinc-900 mb-4",
              }}
              drawerOpen={addNewBranchDrawerOpen}
              setDrawerOpen={setAddNewBranchDrawerOpen}
              nested
            >
              <ScrollArea>
                <Form {...form}>
                  <form onSubmit={onSubmit} className="p-1 flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="name">Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Branch Name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="address">Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Branch Address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="admin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="admin">Admin</FormLabel>
                          <FormControl>
                            <Select
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                {field.value ?? "Select Admin"}
                              </SelectTrigger>
                              <SelectContent>
                                {selectAdmins.map((admin) => (
                                  <SelectItem key={admin} value={admin}>
                                    {admin}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full font-semibold py-2 px-4 rounded-md mt-4"
                    >
                      {handleAddBranch.isPending && (
                        <Loader2Icon className="animate-spin" />
                      )}
                      Update Branch
                    </Button>
                  </form>
                </Form>
              </ScrollArea>
            </CustomDrawer>
            <ScrollArea>
              <div className="flex flex-col gap-4 mb-20">
                {branches.data?.map((data) => (
                  <OneBranch
                    key={data.branch.id}
                    branch={data.branch}
                    user={data.user}
                  />
                ))}
              </div>
            </ScrollArea>
          </CustomDrawer>
          <CustomDrawer
            title="Manage Admins"
            triggerComponentProps={{
              size: "lg",
              className:
                "bg-yellow-600 hover:bg-yellow-700/90 text-white font-bold py-2 px-4 rounded-md",
            }}
            isLoading={admins.isPending || admins.isRefetching}
            onRefetch={admins.refetch}
          >
            <CustomDrawer
              title="Add Admin"
              triggerTitle="Add a new admin"
              triggerComponentProps={{
                variant: "outline",
                className:
                  "w-full h-[100px] bg-accent rounded-xl flex justify-center items-center font-medium text-zinc-900 mb-4",
              }}
              drawerOpen={addNewUserDrawerOpen}
              setDrawerOpen={setAddNewUserDrawerOpen}
              nested
            >
              <ScrollArea>
                <AutoForm
                  schema={newUserFormSchema}
                  onSubmit={(data) => handleAddAdmin.mutateAsync(data)}
                  uiComponents={{
                    SubmitButton: ({ children }) => {
                      return (
                        <Button
                          className="w-full font-semibold py-2 px-4 rounded-md mt-4"
                          size="lg"
                          disabled={handleAddAdmin.isPending}
                        >
                          {handleAddAdmin.isPending && (
                            <Loader2Icon className="animate-spin" />
                          )}
                          {children}
                        </Button>
                      );
                    },
                  }}
                  formProps={{
                    className: "pl-1 pr-5 mb-20 flex flex-col gap-2",
                  }}
                  withSubmit
                />
              </ScrollArea>
            </CustomDrawer>
            <ScrollArea>
              <div className="flex flex-col gap-4 mb-20">
                {admins.data?.map((user) => (
                  <OneUser key={user.id} user={user} />
                ))}
              </div>
            </ScrollArea>
          </CustomDrawer>
        </div>
      )}
      <Tabs defaultValue="request" className="w-full mt-4">
        <TabsList className="mb-2 flex flex-col md:flex-row h-full w-full md:w-max justify-start">
          <TabsTrigger value="request" className="text-lg font-semibold w-full">
            Booking Requests
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="text-lg font-semibold w-full"
          >
            Upcoming Bookings
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="text-lg font-semibold w-full">
            On-going Bookings
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-lg font-semibold w-full"
          >
            Completed Bookings
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="text-lg font-semibold w-full"
          >
            Cancelled Bookings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="request" className="space-y-4">
          {bookingRequestsQuery.data &&
          bookingRequestsQuery.data?.length !== 0 ? (
            bookingRequestsQuery.data.map((booking, index) => (
              <div className="relative" key={booking.car_request.id}>
                <h2 className="font-semibold text-sm text-muted-foreground absolute left-2 top-1">
                  {index + 1}.
                </h2>
                <Booking booking={booking} />
              </div>
            ))
          ) : (
            <NoRequestsCard message="booking requests" />
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          {upcommingBookingRequestsQuery.data &&
          upcommingBookingRequestsQuery.data?.length !== 0 ? (
            upcommingBookingRequestsQuery.data.map((booking, index) => (
              <div className="relative" key={booking.car_request.id}>
                <h2 className="font-semibold text-sm text-muted-foreground absolute left-2 top-1">
                  {index + 1}.
                </h2>
                <Booking booking={booking} />
              </div>
            ))
          ) : (
            <NoRequestsCard message="upcoming bookings" />
          )}
        </TabsContent>
        <TabsContent value="ongoing" className="space-y-4">
          {ongoingBookingRequestsQuery.data &&
          ongoingBookingRequestsQuery.data?.length !== 0 ? (
            ongoingBookingRequestsQuery.data.map((booking, index) => (
              <div className="relative" key={booking.car_request.id}>
                <h2 className="font-semibold text-sm text-muted-foreground absolute left-2 top-1">
                  {index + 1}.
                </h2>
                <Booking booking={booking} />
              </div>
            ))
          ) : (
            <NoRequestsCard message="ongoing bookings" />
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {completedBookingRequestsQuery.data &&
          completedBookingRequestsQuery.data?.length !== 0 ? (
            completedBookingRequestsQuery.data.map((booking, index) => (
              <div className="relative" key={booking.car_request.id}>
                <h2 className="font-semibold text-sm text-muted-foreground absolute left-2 top-1">
                  {index + 1}.
                </h2>
                <Booking booking={booking} />
              </div>
            ))
          ) : (
            <NoRequestsCard message="completed bookings" />
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookingRequestsQuery.data &&
          cancelledBookingRequestsQuery.data?.length !== 0 ? (
            cancelledBookingRequestsQuery.data.map((booking, index) => (
              <div className="relative" key={booking.car_request.id}>
                <h2 className="font-semibold text-sm text-muted-foreground absolute left-2 top-1">
                  {index + 1}.
                </h2>
                <Booking booking={booking} />
              </div>
            ))
          ) : (
            <NoRequestsCard message="cancelled bookings" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NoRequestsCard({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No {message} Available</CardTitle>
        <CardDescription>
          <p>There are no {message} at the moment. Please check back later.</p>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
