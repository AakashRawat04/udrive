import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api, type APIResponse } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { FetchError } from "ofetch";
import { useState } from "react";
import { string } from "zod";
import {
  InputOTP,
  InputOTPGroup, InputOTPSlot
} from "@/components/ui/input-otp";
import { sleep } from "@/lib/helpers";

export const Route = createFileRoute("/user/register")({
  component: LoginForm,
});

export const description =
  "A sign up form with first name, last name, email and password inside a card. There's an option to sign up with GitHub and a link to login if you already have an account";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const sendOTPMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api<APIResponse<string>>("/auth/user.getOTP", {
        body: { email },
        method: "POST",
      });

      if (!response.data) {
        throw new Error(response.error!);
      }

      toast.success(response.data);
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        toast.error(error.data.error ?? "An error occurred");
        return;
      }
      toast.error(error.message ?? "An error occurred");
    },
  });

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = firstName + " " + lastName;
    try {
      const { data, error } = await api<APIResponse<string>>("/auth/register", {
        body: { name, email, password, otp },
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!data) {
        toast.error(error);
        return;
      }

      toast.success("Account created successfully. Redirecting to login...");
      await sleep(1000);
      router.navigate({
        to: "/user/login",
      });
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while registering");
    }
  };

  return (
    <div className="flex min-h-0 flex-grow justify-center items-center -mt-16">
      <Card className="mx-auto max-w-sm h-max">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="h-max">
          <form className="grid gap-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  name="first-name"
                  placeholder="Max"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  name="last-name"
                  placeholder="Robinson"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="w-full flex justify-between items-end">
                <Label htmlFor="email">Email</Label>
                <Button
                  type="button"
                  className="text-black h-auto"
                  variant="link"
                  size="sm"
                  disabled={sendOTPMutation.isPending}
                  onClick={async () => {
                    if (string().email().safeParse(email).success === false) {
                      toast.error("Email is required");
                      return;
                    }

                    await sendOTPMutation.mutateAsync(email);
                  }}
                >
                  {sendOTPMutation.isPending ? "Sending OTP..." : "Send OTP"}
                </Button>
              </div>
              <Input
                name="email"
                type="email"
                placeholder="m@example.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 place-items-center">
              <Label htmlFor="otp">OTP</Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(otp) => setOTP(otp)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/user/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
