import { createFileRoute, Link } from "@tanstack/react-router";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { z } from "zod";

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
  country: z.string().min(3).max(50),
  zip: z.string().min(6).max(6),
});

function Profile() {
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>
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
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </CardHeader>
            <CardContent>
              <AutoForm
                formSchema={profileSchema}
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
                  country: {
                    inputProps: {
                      placeholder: "India",
                    },
                  },
                  zip: {
                    inputProps: {
                      placeholder: "400001",
                    },
                  },
                  email: {
                    description: "Your email may be used for account recovery",
                    inputProps: {
                      placeholder: "aakashrawat@gmail.com",
                    },
                  },
                  phone: {
                    description: "Your phone number will be used to contact you",
                    inputProps: {
                      placeholder: "9876543210",
                    },
                  },
                }}
              >
                <AutoFormSubmit>Save Changes</AutoFormSubmit>
              </AutoForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
