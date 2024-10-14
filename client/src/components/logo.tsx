import { cn } from "@/lib/classes";
import { Link } from "@tanstack/react-router";

export const BrandLogo = ({ className, ...props }: React.ComponentProps<"span">) => {
  return (
    <Link to="/">
      <span className={cn("text-xl font-semibold", className)} {...props}>
        uDrive
      </span>
    </Link>
  );
};
