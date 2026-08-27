import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { BrandMark } from "@/components/farmer/AppShell";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useFarmer } from "@/lib/farmer/store";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    mobile: typeof search["mobile"] === "string" ? search["mobile"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in with OTP — Smart Farmer" },
      { name: "description", content: "Mobile-first login: enter your number, verify the OTP and reach your farm day." },
      { property: "og:title", content: "Sign in with OTP — Smart Farmer" },
      { property: "og:description", content: "Mobile-first login with a one-time code sent to your phone." },
    ],
  }),
  component: LoginPage,
});

const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

/** Mobile + OTP login. The OTP is mocked (any 6 digits, demo code shown in a toast). */
function LoginPage() {
  const { t, login } = useFarmer();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mobile, setMobile] = useState(search.mobile ?? "");
  const [stage, setStage] = useState<"mobile" | "otp">("mobile");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  function sendOtp() {
    const parsed = mobileSchema.safeParse(mobile);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid number");
      return;
    }
    setError(null);
    setStage("otp");
    // Mock SMS gateway: in production this calls the notification service.
    toast.success(`OTP sent to +91 ${parsed.data}`, { description: "Demo code: 123456" });
  }

  function verify() {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setError(null);
    login(mobile);
    toast.success("Verified. Welcome back!");
    navigate({ to: "/app" });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-6">
      <BrandMark />
      <div className="mt-12 flex-1">
        <p className="eyebrow">Step 3 of 3</p>
        {stage === "mobile" ? (
          <>
            <h1 className="mt-2 font-display text-3xl font-bold">{t("login.title")}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{t("login.body")}</p>
            <div className="mt-7">
              <Label className="mb-2 block text-sm font-medium">{t("register.mobile")}</Label>
              <div className="flex items-center gap-2">
                <span className="grid h-12 shrink-0 place-items-center rounded-xl bg-secondary px-3 text-sm font-semibold">
                  +91
                </span>
                <Input
                  value={mobile}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="h-12 rounded-xl bg-card"
                />
              </div>
              {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-3xl font-bold">{t("login.otpTitle")}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("login.otpBody")} +91 {mobile}
            </p>
            <div className="mt-7">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="size-12 rounded-xl bg-card text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
              <div className="mt-4 flex gap-4 text-sm">
                <button type="button" onClick={sendOtp} className="font-medium text-highlight hover:underline">
                  {t("login.resend")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStage("mobile");
                    setOtp("");
                  }}
                  className="text-muted-foreground hover:underline"
                >
                  {t("login.change")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 bg-background/90 py-4 backdrop-blur">
        <button
          type="button"
          onClick={stage === "mobile" ? sendOtp : verify}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {stage === "mobile" ? t("login.send") : t("login.verify")} <ArrowRight className="size-4" />
        </button>
        <Link to="/register" className="mt-3 block text-center text-sm text-muted-foreground hover:underline">
          Create a new farmer profile
        </Link>
      </div>
    </div>
  );
}
