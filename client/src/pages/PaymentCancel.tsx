import { Link } from "wouter";
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-red-500/10 border-2 border-red-500/20">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-[Space_Grotesk] text-white">
            Platba zrušena
          </h1>
          <p className="text-gray-400">
            Vaše platba nebyla dokončena. Žádné peníze nebyly strženy.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-400 space-y-2">
          <p>Pokud jste narazili na problém, neváhejte nás kontaktovat.</p>
          <p>Vaše registrace zůstává aktivní — můžete platbu dokončit kdykoli.</p>
        </div>

        <div className="space-y-3 pt-4">
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na hlavní stránku
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
