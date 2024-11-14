import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer } from "vaul";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { car, carFormSchema, type Car } from "@/data/car";
import { cn } from "@/lib/classes";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { format, set } from "date-fns";
import {
  ArrowRight,
  CalendarIcon,
  CarIcon,
  Loader2Icon,
  RefreshCcw,
} from "lucide-react";
import type React from "react";
import { AutoForm } from "@/components/ui/autoform";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  editUserFormSchema,
  newUserFormSchema,
  type EditUser,
  type NewUser,
  type User,
} from "@/data/user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { useState } from "react";
import {
  addBranchFormSchema,
  editBranchFormSchema,
  type Branch,
} from "@/data/branch";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type APIResponse } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function CustomDrawer({
  title,
  triggerTitle,
  triggerComponentProps,
  drawerContentProps,
  children,
  nested = false,
  isLoading = false,
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

function OneBranch({ branch }: { branch: Branch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsOpen(false);
    setIsDeleting(true);
    console.log("Deleting user");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsDeleting(false);
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start items-start h-full bg-accent rounded-xl p-2 flex flex-col md:flex-row"
    >
      <div className="flex flex-col gap-1 text-left">
        <h2 className="text-lg font-semibold  inline-block mr-1">
          {branch.name}
        </h2>
        <p className="text-gray-600 inline-block">{branch.admin}</p>
        <div className="flex gap-2">
          <CustomDrawer
            title="Edit Branch"
            triggerComponentProps={{
              variant: "outline",
              className:
                "w-max bg-gray-100 rounded-lg flex justify-center items-center font-medium text-zinc-900 mt-2",
            }}
            nested
          >
            <ScrollArea>
              <AutoForm
                schema={editBranchFormSchema}
                values={branch}
                onSubmit={(data) => console.log(data)}
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
                disabled={isDeleting}
              >
                <Loader2Icon
                  className={cn("animate-spin hidden", isDeleting && "block")}
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
                    onClick={handleDelete}
                    disabled={isDeleting}
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
        }
      );

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success("Admin deleted successfully");
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

function OneCar({ car }: { car: Car }) {
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
          <p className="text-gray-600 mr-1">{car.branch}</p>
          <p className="text-gray-600">{car.address.slice(0, 40)}...</p>
        </div>
        <CustomDrawer
          title="Edit Car"
          triggerComponentProps={{
            variant: "outline",
            className:
              "w-max bg-gray-100 rounded-lg flex justify-center items-center font-medium text-zinc-900 mt-2",
          }}
          nested
        >
          <ScrollArea>
            <AutoForm
              schema={carFormSchema}
              values={car}
              onSubmit={(data) => console.log(data)}
              formProps={{
                className: "pl-1 pr-5 mb-20 flex flex-col gap-2",
              }}
              withSubmit
            />
          </ScrollArea>
        </CustomDrawer>
      </div>
    </Button>
  );
}

async function addNewAdmin(admin: NewUser) {
  const response = await api<APIResponse<string>>("/auth/admin.create", {
    body: admin,
    method: "POST",
  });

  if (!response.data) {
    throw new Error(response.error!);
  }
}

function Dashboard() {
  const router = useRouter();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [addNewUserDrawerOpen, setAddNewUserDrawerOpen] = useState(false);

  const admins = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const admins = await api<APIResponse<User[]>>("/auth/admin.getAllAdmins");

      if (!admins.data) {
        throw new Error(admins.error);
      }

      return admins.data;
    },
    refetchInterval: 10000,
    enabled: auth.user?.role === "super_admin",
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

  const branches = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const branches = await api<APIResponse<Branch[]>>("/branch.getAll");

      if (!branches.data) {
        throw new Error(branches.error);
      }

      return branches.data;
    },
    refetchInterval: 10000,
    enabled: auth.user?.role === "super_admin",
  });

  const cars = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const cars = await api<APIResponse<Car[]>>("/car.getAll");

      if (!cars.data) {
        throw new Error(cars.error);
      }

      return cars.data;
    },
    refetchInterval: 10000,
    enabled: auth.user?.role === "super_admin",
  });

  console.log(admins.isLoading, admins.isRefetching);

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
              nested
            >
              <ScrollArea>
                <AutoForm
                  schema={carFormSchema}
                  onSubmit={(data) => console.log(data)}
                  formProps={{
                    className: "pl-1 pr-5 mb-20 flex flex-col gap-2",
                  }}
                  withSubmit
                />
              </ScrollArea>
            </CustomDrawer>
            <ScrollArea>
              <div className="flex flex-col gap-4 mb-20">
                {cars.data?.map((car) => <OneCar key={car.id} car={car} />)}
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
              nested
            >
              <ScrollArea>
                <AutoForm
                  schema={addBranchFormSchema}
                  onSubmit={(data) => console.log(data)}
                  formProps={{
                    className: "pl-1 pr-5 mb-20 flex flex-col gap-2",
                  }}
                  withSubmit
                />
              </ScrollArea>
            </CustomDrawer>
            <ScrollArea>
              <div className="flex flex-col gap-4 mb-20">
                {branches.data?.map((branch) => (
                  <OneBranch key={branch.id} branch={branch} />
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
      <Tabs defaultValue="upcoming" className="w-full mt-4">
        <TabsList className="mb-2 flex flex-col md:flex-row h-full w-full md:w-max justify-start">
          <TabsTrigger
            value="upcoming"
            className="text-lg font-semibold w-full"
          >
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
