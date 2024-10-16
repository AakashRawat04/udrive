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
import { Menu, Search, CircleUser } from "lucide-react";
import { BrandLogo } from "./logo";

export function Nav() {
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
          <a
            href="#contactus"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Contact
          </a>
          <a
            href="#about"
            className="text-foreground transition-colors hover:text-foreground"
          >
            About Us
          </a>
        </nav>
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
            <DropdownMenuItem>
              <Link to="/settings/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
