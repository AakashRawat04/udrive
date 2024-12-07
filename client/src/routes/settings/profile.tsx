import { createFileRoute, Link } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { z } from "zod";
import { getUser, useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type APIResponse } from "@/lib/api";
import { Loader2Icon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FetchError } from "ofetch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/classes";
import { hasCompletedOnboarding } from "@/data/user";

export const Route = createFileRoute("/settings/profile")({
  component: Profile,
  loader: getUser,
});

const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be 10 digits").max(10),
  address: z.string().min(1, "Address is required").max(200),
  city: z.string().min(3, "City must be at least 3 characters").max(50),
  state: z.string().min(3, "State must be at least 3 characters").max(50),
  panCard: z.string().min(1, "Pan Card is required"),
  drivingLicense: z.string().min(1, "Driving License is required"),
});

function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const panCardInputRef = useRef<HTMLInputElement>(null);
  const drivingLicenseInputRef = useRef<HTMLInputElement>(null);
  const initialUserData = Route.useLoaderData();
  const [deleteMutationType, setDeleteMutationType] = useState<
    "panCard" | "drivingLicense" | null
  >(null);

  useEffect(() => {
    if (user && !hasCompletedOnboarding(user)) {
      toast.error("Please complete your profile to continue!");
    }
  }, [user]);

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    initialData: initialUserData,
    enabled: !user,
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userQuery.data?.name,
      email: userQuery.data?.email,
      phone: userQuery.data?.phone,
      address: userQuery.data?.address,
      city: userQuery.data?.city,
      state: userQuery.data?.state,
      panCard: userQuery.data?.panCard,
      drivingLicense: userQuery.data?.drivingLicense,
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({
      file,
    }: {
      file: File;
      type: "panCard" | "drivingLicense";
    }) => {
      const formData = new FormData();
      formData.append("image", file);

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
    onSuccess: (data, variables) => {
      const fieldName = variables.type;
      form.setValue(fieldName, data);
      if (fieldName === "panCard") {
        panCardInputRef.current!.value = "";
      }
      if (fieldName === "drivingLicense") {
        drivingLicenseInputRef.current!.value = "";
      }
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message ?? "File upload failed");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const response = await api<APIResponse<string>>("/auth/user.update", {
        method: "PUT",
        body: data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occured");
        return;
      }
      toast.error(error.message);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async ({
      url,
      type,
    }: {
      url: string;
      type: "panCard" | "drivingLicense";
    }) => {
      setDeleteMutationType(type);
      const imageKey = url.split("/").pop();

      if (!imageKey) {
        throw new Error("Invalid image url");
      }

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

      // Reset the image field
      form.setValue(type, "");
      setDeleteMutationType(null);
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

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    console.log(event.target.name);
    if (!file) return;
    await uploadFileMutation.mutateAsync({
      file,
      type: event.target.name as "panCard" | "drivingLicense",
    });
  }

  const onSubmit = form.handleSubmit(async (data) => {
    await updateUserMutation.mutateAsync(data);
  });

  if (userQuery.isPending) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh_-_theme(spacing.16))]">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh_-_theme(spacing.16))]">
        <p className="text-destructive">Failed to load profile</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences.
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
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p className="text-sm text-muted-foreground">
                Update your personal details and documents
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="hey@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" />
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
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123, ABC Street" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mumbai" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Maharashtra" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="panCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pan Card</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              name="panCard"
                              onChange={handleFileUpload}
                              ref={panCardInputRef}
                              disabled={uploadFileMutation.isPending}
                            />
                            {field.value && (
                              <div className="relative bg-accent border border-input rounded-md w-max">
                                <img
                                  src={field.value}
                                  alt="Pan Card"
                                  className={cn(
                                    "w-full h-full max-w-lg object-contain rounded-md",
                                    deleteImageMutation.isPending &&
                                      deleteMutationType === "panCard" &&
                                      "opacity-20"
                                  )}
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  type="button"
                                  className="rounded-lg size-7 absolute right-1 top-1"
                                  onClick={async () => {
                                    await deleteImageMutation.mutateAsync({
                                      url: field.value,
                                      type: "panCard",
                                    });
                                  }}
                                  disabled={deleteImageMutation.isPending}
                                >
                                  {deleteImageMutation.isPending &&
                                  deleteMutationType === "panCard" ? (
                                    <Loader2Icon className="animate-spin" />
                                  ) : (
                                    <Trash2 />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="drivingLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driving License</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              name="drivingLicense"
                              onChange={handleFileUpload}
                              ref={drivingLicenseInputRef}
                              disabled={uploadFileMutation.isPending}
                            />
                            {field.value && (
                              <div className="relative bg-accent border border-input rounded-md w-max">
                                <img
                                  src={field.value}
                                  alt="Driving License"
                                  className={cn(
                                    "w-full h-full max-w-lg object-contain rounded-md",
                                    deleteImageMutation.isPending &&
                                      deleteMutationType === "drivingLicense" &&
                                      "opacity-20"
                                  )}
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  type="button"
                                  className="rounded-lg size-7 absolute right-1 top-1"
                                  onClick={async () => {
                                    await deleteImageMutation.mutateAsync({
                                      url: field.value,
                                      type: "drivingLicense",
                                    });
                                  }}
                                  disabled={deleteImageMutation.isPending}
                                >
                                  {deleteImageMutation.isPending &&
                                  deleteMutationType === "drivingLicense" ? (
                                    <Loader2Icon className="animate-spin" />
                                  ) : (
                                    <Trash2 />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={
                      updateUserMutation.isPending ||
                      uploadFileMutation.isPending
                    }
                  >
                    {updateUserMutation.isPending && (
                      <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
