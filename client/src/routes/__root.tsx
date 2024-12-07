import { Nav } from "@/components/nav";
import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "sonner";
import { AuthProvider, getUser } from "@/providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hasCompletedOnboarding } from "@/data/user";

const whiteList = ["/user/login", "/user/register", "/"];

const client = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
  async beforeLoad(ctx) {
    const user = await getUser();

    if (whiteList.includes(ctx.location.pathname)) {
      if (user && ctx.location.pathname !== "/") {
        if (user.role === "admin" || user.role === "super_admin") {
          throw redirect({
            to: "/admin/dashboard",
          });
        }

        throw redirect({
          to: "/",
        });
      }

      return;
    } else {
      if (user && ctx.location.pathname !== '/settings/profile' && !hasCompletedOnboarding(user)) {
        throw redirect({
          to: "/settings/profile",
        });
      }
    }

    if (!user) {
      throw redirect({
        to: "/user/login",
      });
    }
  },
});

function RootComponent() {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <div className="flex min-h-screen w-full flex-col">
          <Nav />
          <Outlet />
        </div>
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
