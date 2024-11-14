import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { Menu, CircleUser } from "lucide-react";
import { BrandLogo } from "./logo";
import { useAuth } from "@/providers/AuthProvider";

export function Nav() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b border-b-black/10 bg-white/70 backdrop-blur-sm px-4 md:px-6 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <BrandLogo />
            <a
              href="#contactus"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </a>
            <a
              href="#about"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              About Us
            </a>
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="flex-col gap-6 text-lg ml-auto md:ml-0 font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <BrandLogo />
      </nav>
      <div className="flex w-max items-center gap-4 ml-auto md:gap-2 lg:gap-4">
        <nav className="hidden md:flex w-max items-center gap-4 ml-auto md:gap-2 lg:gap-4 mr-2">
          <Link
            to="/"
            hash="contactus"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Contact
          </Link>
          <Link
            to="/"
            hash="about"
            className="text-foreground transition-colors hover:text-foreground"
          >
            About Us
          </Link>
        </nav>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.role === "user" ? (
                <Link to="/settings/profile">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
              ) : null}
              {user.role === "super_admin" || user.role === "admin" ? (
                <Link to="/admin/dashboard">
                  <DropdownMenuItem>Admin</DropdownMenuItem>
                </Link>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/user/login">
            <Button variant="outline" className="rounded-lg">
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
