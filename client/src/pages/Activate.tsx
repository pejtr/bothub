import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function Activate() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const activate = trpc.registration.activate.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const token = params.get("token");

    if (!id || !token) {
      setStatus("error");
      setMessage("Neplatný aktivační odkaz. Chybí parametry.");
      return;
    }

    activate.mutate(
      { registrationId: Number(id), token },
      {
        onSuccess: (data) => {
          setStatus(data.success ? "success" : "error");
          setMessage(data.message);
        },
        onError: () => {
          setStatus("error");
          setMessage("Došlo k chybě při aktivaci. Zkuste to prosím znovu.");
        },
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <a href="/" className="inline-flex items-center gap-2 mb-8">
          <Bot className="w-8 h-8 text-amber-400" />
          <span className="font-[Space_Grotesk] font-bold text-xl text-white">
            <span className="text-amber-400">BOT</span>HUB
          </span>
        </a>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
              <h1 className="font-[Space_Grotesk] text-xl font-bold text-white mb-2">Aktivuji váš plán...</h1>
              <p className="text-gray-400 text-sm">Prosím vyčkejte.</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h1 className="font-[Space_Grotesk] text-xl font-bold text-white mb-2">Aktivace úspěšná!</h1>
              <p className="text-gray-400 text-sm mb-6">{message}</p>
              <a href="/">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">Přejít na BOTHUB.cz</Button>
              </a>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h1 className="font-[Space_Grotesk] text-xl font-bold text-white mb-2">Chyba aktivace</h1>
              <p className="text-gray-400 text-sm mb-6">{message}</p>
              <a href="/">
                <Button variant="outline" className="border-white/10 text-gray-300">Zpět na hlavní stránku</Button>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
