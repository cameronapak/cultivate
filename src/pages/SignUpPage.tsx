import { signup } from "wasp/client/auth";
import {
  checkInviteCode,
  claimInviteCode
} from "wasp/client/operations";
import type { HttpError } from "wasp/server";
import "https://platform.twitter.com/widgets.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "wasp/client/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";
import Logo from "../components/custom/Logo";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { Footer } from "../components/custom/Footer";

export function SignUpPage({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isLoadingSignup, setIsLoadingSignup] = useState(false);
  const navigate = useNavigate();

  async function handleValidateCode() {
    if (!inviteCode) {
      toast.error("Please enter an invite code.");
      return;
    }
    setIsLoadingCode(true);
    try {
      await checkInviteCode({ code: inviteCode });
      setIsValidated(true);
      toast.success("Invite code is valid!");
    } catch (error: HttpError | any) {
      setIsValidated(false);
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Invalid or claimed invite code."
      );
    } finally {
      setIsLoadingCode(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidated) {
      toast.error("Please validate your invite code first.");
      return;
    }
    setIsLoadingSignup(true);
    try {
      await signup({ username, password });

      try {
        await claimInviteCode({ code: inviteCode });
      } catch (claimError: any) {
        console.error("Failed to claim invite code after signup:", claimError);
        toast.warning("Signup successful, but failed to claim invite code. Please contact support.");
      }

      navigate("/");
      
    } catch (error: HttpError | any) {
      toast.error(
        error?.data?.data?.message ||
          error?.data?.message ||
          error?.message ||
          "Signup failed. Please check your details."
      );
    } finally {
      setIsLoadingSignup(false);
    }
  }

  return (
    <div className={cn("flex flex-col py-12 gap-6", className)} {...props}>
      <Toaster />
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex gap-2 justify-center text-xl">
            <Logo />
          </CardTitle>
          <CardDescription className="text-balance">
            Enter your invite code to sign up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidated ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter your code"
                  required
                  disabled={isLoadingCode}
                />
              </div>
              <Button onClick={handleValidateCode} disabled={isLoadingCode} className="w-full">
                {isLoadingCode ? "Validating..." : "Validate Code"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="Username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    disabled={isLoadingSignup}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoadingSignup}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoadingSignup}>
                  {isLoadingSignup ? "Signing up..." : "Sign up"}
                </Button>
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                  By clicking continue, you agree to our{" "}
                  <a href="https://go.faith.tools/cultivate-tos">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="https://go.faith.tools/cultivate-privacy">
                    Privacy Policy
                  </a>
                  .
                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}

