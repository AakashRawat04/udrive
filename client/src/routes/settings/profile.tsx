import { createFileRoute } from "@tanstack/react-router";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { z } from "zod";

export const Route = createFileRoute("/settings/profile")({
  component: Profile,
});

export const description =
  "A settings page. The settings page has a sidebar navigation and a main content area. The main content area has a form to update the store name and a form to update the plugins directory. The sidebar navigation has links to general, security, integrations, support, organizations, and advanced settings.";

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
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10 pb-20 md:pb-20">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Profile</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav
          className="grid gap-4 text-sm text-muted-foreground"
          x-chunk="dashboard-04-chunk-0"
        >
          <a href="#" className="font-semibold text-primary">
            General
          </a>
        </nav>
        <div className="grid gap-6">
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
            className="w-full max-w-md"
          >
            <AutoFormSubmit>Save</AutoFormSubmit>
          </AutoForm>
        </div>
      </div>
    </main>
  );
}
