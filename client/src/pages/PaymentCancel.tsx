/**
 * Payment Cancel Page
 * Shown when user cancels Stripe checkout
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function PaymentCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-[#1A1A1F] border-[#2A2A2F] p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold mb-2">
          Platba <span className="text-red-400">zrušena</span>
        </h1>

        <p className="text-gray-400 mb-6">
          Vaše platba nebyla dokončena. Nebyli jste nijak zatíženi.
          Pokud máte otázky, neváhejte nás kontaktovat.
        </p>

        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] font-semibold hover:opacity-90"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Zpět na ceník
          </Button>
          <Button
            variant="outline"
            className="w-full border-[#2A2A2F] text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]"
            onClick={() => {
              navigate("/");
              setTimeout(() => {
                document.getElementById("cenik")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            <MessageSquare className="mr-2 w-4 h-4" />
            Porovnat plány
          </Button>
        </div>
      </Card>
    </div>
  );
}
