import { createFileRoute, Link } from "@tanstack/react-router";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { z } from "zod";
import { getUser, useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type APIResponse } from "@/lib/api";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { FetchError } from "ofetch";

export const Route = createFileRoute("/settings/profile")({
  component: Profile,
});

const profileSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  address: z.string().max(200),
  city: z.string().min(3).max(50),
  state: z.string().min(3).max(50),
});

function Profile() {
  const { user } = useAuth();

  const userQuery = useQuery({
    queryKey: ["user", user?.id],
    queryFn: getUser,
    enabled: user !== null,
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
      // Refresh user data
      userQuery.refetch();
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error);
        return;
      }
      toast.error(error.message);
    },
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

  const userData = userQuery.data;

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
                Update your personal details
              </p>
            </CardHeader>
            <CardContent>
              <AutoForm
                formSchema={profileSchema}
                values={{
                  name: userData?.name,
                  email: userData?.email,
                  phone: userData?.phone,
                  address: userData?.address,
                  city: userData?.city,
                  state: userData?.state,
                }}
                onSubmit={async (data) => {
                  await updateUserMutation.mutateAsync(data);
                }}
                fieldConfig={{
                  name: {
                    description: "Your full name",
                    inputProps: {
                      placeholder: "Aakash Rawat",
                    },
                  },
                  city: {
                    inputProps: {
                      placeholder: "Mumbai",
                    },
                  },
                  address: {
                    fieldType: "textarea",
                    inputProps: {
                      placeholder: "123, ABC Street",
                    },
                  },
                  state: {
                    inputProps: {
                      placeholder: "Maharashtra",
                    },
                  },
                  email: {
                    description: "Your email may be used for account recovery",
                    inputProps: {
                      placeholder: "aakashrawat@gmail.com",
                    },
                  },
                  phone: {
                    description:
                      "Your phone number will be used to contact you",
                    inputProps: {
                      placeholder: "9876543210",
                    },
                  },
                }}
              >
                <AutoFormSubmit>
                  {updateUserMutation.isPending ? (
                    <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </AutoFormSubmit>
              </AutoForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
