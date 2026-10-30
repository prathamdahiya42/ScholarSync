"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Smartphone,
  Lock,
  ArrowRight,
  RefreshCw,
  Building2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MockBadge } from "@/components/shared/mock-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface AadhaarVerifiedData {
  aadhaarNumber: string;
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  state: string;
  district: string;
  address: string;
  isBankSeeded: boolean;
  seededBankName?: string;
  maskedAccount?: string;
}

interface AadhaarSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: AadhaarVerifiedData) => void;
  lang?: "en" | "hi";
}

export function AadhaarSandboxModal({
  isOpen,
  onClose,
  onSuccess,
  lang = "en",
}: AadhaarSandboxModalProps) {
  const [aadhaarInput, setAadhaarInput] = React.useState("5429-8839-8892");
  const [step, setStep] = React.useState<"enter_aadhaar" | "enter_otp" | "verified">("enter_aadhaar");
  const [otpValue, setOtpValue] = React.useState("");
  const [isSeededForDbt, setIsSeededForDbt] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleFormatAadhaar = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 12);
    let formatted = val.match(/.{1,4}/g)?.join("-") || val;
    setAadhaarInput(formatted);
  };

  const handleSendOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("enter_otp");
      toast.info("Aadhaar OTP Dispatched", {
        description: "Simulated 6-digit OTP sent to linked mobile +91 XXXXXX4920",
      });
    }, 700);
  };

  const handleVerifyOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("verified");
      toast.success("eKYC Identity Verified", {
        description: "UIDAI 2.5 verifiable XML profile successfully parsed.",
      });
    }, 800);
  };

  const handleConfirmImport = () => {
    onSuccess({
      aadhaarNumber: aadhaarInput,
      fullName: "Ramesh Kumar Gond",
      fatherName: "Mansingh Gond",
      dob: "2001-04-14",
      gender: "Male",
      state: "Madhya Pradesh",
      district: "Dindori",
      address: "Gram Panchayat Samnapur, Tehsil Dindori, Madhya Pradesh - 481778",
      isBankSeeded: isSeededForDbt,
      seededBankName: isSeededForDbt ? "State Bank of India (Dindori Branch)" : undefined,
      maskedAccount: isSeededForDbt ? "XXXX-XXXX-1455" : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="bg-white rounded-xl border border-[#CFC9BD] max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-[#E8E4DC] bg-[#FBF9F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F4C4A] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm text-[#1B2321]">
                  Aadhaar eKYC Sandbox
                </span>
                <MockBadge label="UIDAI 2.5 SPEC" />
              </div>
              <p className="text-[10px] text-[#5B6663]">
                Official UIDAI Verified Identity Simulation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#8A938F] hover:text-[#1B2321] p-1 rounded-md hover:bg-[#EFECE5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* STEP 1: Enter Aadhaar */}
          {step === "enter_aadhaar" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B2321] block">
                  12-Digit Aadhaar / Virtual ID Number
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={aadhaarInput}
                    onChange={handleFormatAadhaar}
                    placeholder="5429-8839-8892"
                    className="font-mono text-base tracking-widest pl-10"
                    maxLength={14}
                  />
                  <Lock className="w-4 h-4 text-[#8A938F] absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-[#5B6663]">
                  Your identity is protected under the Aadhaar (Targeted Delivery of Financial and Other Subsidies) Act, 2016.
                </p>
              </div>

              {/* Demo Toggle: Seeded vs Unseeded Bank */}
              <div className="rounded-lg border border-[#E8E4DC] p-3 bg-[#FBF9F5] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1B2321]">Simulate NPCI Bank Seeding:</span>
                  <button
                    type="button"
                    onClick={() => setIsSeededForDbt(!isSeededForDbt)}
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded font-semibold cursor-pointer border transition-colors",
                      isSeededForDbt
                        ? "bg-[#E3EFEE] text-[#0F4C4A] border-[#C5DDD9]"
                        : "bg-[#FDF4F2] text-[#A63A2B] border-[#F2C2BA]"
                    )}
                  >
                    {isSeededForDbt ? "✓ ACTIVE (PASS)" : "✗ NOT SEEDED (FAIL)"}
                  </button>
                </div>
                <p className="text-[10px] text-[#5B6663]">
                  Toggle this to demonstrate either a smooth pass or the **Aadhaar Seeding Doctor** resolution flow.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleSendOtp}
                disabled={loading || aadhaarInput.replace(/\D/g, "").length !== 12}
                className="w-full text-xs font-semibold py-2.5"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5 mr-2" />
                )}
                Get Simulated OTP via SMS
              </Button>
            </div>
          )}

          {/* STEP 2: Enter OTP */}
          {step === "enter_otp" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#E3EFEE] text-[#0F4C4A] flex items-center justify-center mx-auto">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1B2321]">
                  Enter 6-Digit OTP
                </h4>
                <p className="text-[11px] text-[#5B6663]">
                  Sent to mobile registered with Aadhaar ending in ...8892
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.slice(0, 6))}
                  placeholder="1 2 3 4 5 6"
                  className="font-mono text-center text-lg tracking-[0.5em]"
                  maxLength={6}
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-[#8A938F]">Valid for 09:42 min</span>
                  <button
                    type="button"
                    onClick={() => setOtpValue("123456")}
                    className="text-[11px] text-[#0F4C4A] font-semibold underline cursor-pointer"
                  >
                    ⚡ Auto-fill 123456 (Demo Helper)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("enter_aadhaar")}
                  className="text-xs flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleVerifyOtp}
                  disabled={loading || otpValue.length < 4}
                  className="text-xs font-semibold flex-1"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Verify & Pull Profile
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Verified Result Profile */}
          {step === "verified" && (
            <div className="space-y-3">
              <div className="rounded-lg bg-[#E3EFEE] border border-[#C5DDD9] p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0F4C4A] text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F4C4A]">
                    UIDAI Verified eKYC Record
                  </h4>
                  <p className="text-[11px] text-[#1B2321]">
                    Identity authenticated against Government Population Registry
                  </p>
                </div>
              </div>

              {/* Data Rows */}
              <div className="bg-[#FBF9F5] rounded-lg border border-[#E8E4DC] p-3 text-xs space-y-2">
                <div className="flex justify-between border-b border-[#EFECE5] pb-1.5">
                  <span className="text-[#8A938F]">Full Name:</span>
                  <span className="font-semibold text-[#1B2321]">Ramesh Kumar Gond</span>
                </div>
                <div className="flex justify-between border-b border-[#EFECE5] pb-1.5">
                  <span className="text-[#8A938F]">Care Of (Father):</span>
                  <span className="font-semibold text-[#1B2321]">Mansingh Gond</span>
                </div>
                <div className="flex justify-between border-b border-[#EFECE5] pb-1.5">
                  <span className="text-[#8A938F]">Date of Birth / Gender:</span>
                  <span className="font-semibold text-[#1B2321]">2001-04-14 (Male)</span>
                </div>
                <div className="flex justify-between border-b border-[#EFECE5] pb-1.5">
                  <span className="text-[#8A938F]">Domicile District & State:</span>
                  <span className="font-semibold text-[#1B2321]">Dindori, Madhya Pradesh</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[#8A938F]">NPCI DBT Seeding Status:</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded font-bold",
                      isSeededForDbt
                        ? "bg-[#E3EFEE] text-[#0F4C4A]"
                        : "bg-[#FDF4F2] text-[#A63A2B]"
                    )}
                  >
                    {isSeededForDbt ? "✓ SEEDED (SBI ...1455)" : "✗ NOT SEEDED"}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleConfirmImport}
                className="w-full text-xs font-semibold py-2.5 shadow-sm"
              >
                Auto-fill Application with Verified Data
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
