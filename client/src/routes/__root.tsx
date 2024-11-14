import { Nav } from "@/components/nav";
import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/AuthProvider";

const whiteList = ["/user/login", "/user/register", "/admin/login", "/"];

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad(ctx) {
    const token = localStorage.getItem("token");

    if (whiteList.includes(ctx.location.pathname)) {
      return;
    }

    if (!token) {
      throw redirect({
        to: "/user/login",
      });
    }
  },
});

function RootComponent() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Nav />
        <Outlet />
      </div>
      <Toaster />
      <TanStackRouterDevtools position="bottom-right" />
    </AuthProvider>
  );
}


