"use client";

import { X, Zap, Star, Rocket } from "lucide-react";
import { useState } from "react";

interface PricingModalProps {
  onClose: () => void;
}

const PACKAGES = [
  {
    id: "starter",
    label: "Starter",
    icon: Zap,
    credits: 10,
    price: "$0.99",
    pricePerCredit: "~$0.10",
    color: "blue",
    popular: false,
    description: "Perfect for trying out",
  },
  {
    id: "basic",
    label: "Basic",
    icon: Star,
    credits: 35,
    price: "$2.99",
    pricePerCredit: "~$0.09",
    color: "purple",
    popular: true,
    description: "Best for regular learners",
  },
  {
    id: "pro",
    label: "Pro",
    icon: Rocket,
    credits: 100,
    price: "$5.99",
    pricePerCredit: "~$0.06",
    color: "green",
    popular: false,
    description: "For serious students",
  },
];

export default function PricingModal({ onClose }: PricingModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-2xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Get More Credits</h2>
            <p className="text-gray-400 mt-1 text-sm">
              Each credit = one AI mnemonic generation. No subscription. Pay once.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Prop */}
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-purple-300">
          💡 You&apos;ve already seen the results — now unlock unlimited access for less than a coffee!
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const isLoading = loading === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`relative glass-card p-5 text-center cursor-pointer transition-all hover:scale-105 ${
                  pkg.popular ? "border-purple-500/50 glow-purple" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <Icon className={`w-7 h-7 mx-auto mb-3 ${
                  pkg.color === "blue" ? "text-blue-400" :
                  pkg.color === "purple" ? "text-purple-400" : "text-green-400"
                }`} />
                <div className="text-xl font-bold text-white">{pkg.price}</div>
                <div className="text-3xl font-black gradient-text my-1">{pkg.credits}</div>
                <div className="text-xs text-gray-400 mb-1">credits</div>
                <div className="text-xs text-gray-500 mb-4">{pkg.pricePerCredit} each</div>
                <p className="text-xs text-gray-400 mb-4">{pkg.description}</p>
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isLoading}
                  className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
                    pkg.popular
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? "Redirecting..." : `Get ${pkg.credits} Credits`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-500">
          Secure payment via Stripe · No subscription · Credits never expire
        </p>
      </div>
    </div>
  );
}
