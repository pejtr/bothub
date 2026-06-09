/**
 * Auth Modal Component
 * Login / Register modal with dark premium design
 * Supports email + password and social login buttons
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle, 
  Brain,
  Sparkles,
  Chrome,
  Github
} from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast.success("Úspěšně přihlášen!", {
      description: "Vítejte zpět v iBots.",
    });
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (regPassword !== regConfirm) {
      toast.error("Hesla se neshodují", {
        description: "Zkontrolujte prosím obě hesla.",
      });
      return;
    }

    if (regPassword.length < 8) {
      toast.error("Heslo je příliš krátké", {
        description: "Heslo musí mít alespoň 8 znaků.",
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast.success("Registrace úspěšná!", {
      description: "Zkontrolujte svůj email pro potvrzení účtu.",
    });
    onClose();
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Přihlášení přes ${provider}`, {
      description: "Funkce bude brzy dostupná.",
    });
  };

  const registerBenefits = [
    "3 iBoti zdarma navždy",
    "100 zpráv měsíčně",
    "Přístup ke komunitě",
    "Žádná kreditní karta",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            <Card className="bg-[#12121A] border-[#2A2A2F] overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-[#2A2A2F] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-b from-[#D4AF37]/10 to-transparent p-6 pb-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-7 h-7 text-[#0A0A0F]" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {tab === "login" ? "Vítejte zpět" : "Vytvořte si účet"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {tab === "login" 
                    ? "Přihlaste se ke svým iBotům" 
                    : "Začněte chatovat s AI osobnostmi zdarma"
                  }
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="px-6">
                <div className="flex bg-[#1A1A1F] rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setTab("login")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      tab === "login"
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Přihlášení
                  </button>
                  <button
                    onClick={() => setTab("register")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      tab === "register"
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Registrace
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <AnimatePresence mode="wait">
                  {tab === "login" ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white pl-10 py-5"
                          />
                        </div>
                        
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Heslo"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white pl-10 pr-10 py-5"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex justify-end">
                          <button type="button" className="text-xs text-[#D4AF37] hover:underline">
                            Zapomenuté heslo?
                          </button>
                        </div>

                        <Button 
                          type="submit" 
                          className="btn-gold w-full py-5"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                          ) : (
                            <>
                              Přihlásit se
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </form>

                      {/* Divider */}
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[#2A2A2F]" />
                        <span className="text-xs text-gray-500">nebo</span>
                        <div className="flex-1 h-px bg-[#2A2A2F]" />
                      </div>

                      {/* Social Login */}
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full bg-[#1A1A1F] border-[#2A2A2F] text-gray-300 hover:border-[#D4AF37]/30 hover:text-white py-5"
                          onClick={() => handleSocialLogin("Google")}
                        >
                          <Chrome className="mr-2 w-4 h-4" />
                          Pokračovat s Google
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-[#1A1A1F] border-[#2A2A2F] text-gray-300 hover:border-[#D4AF37]/30 hover:text-white py-5"
                          onClick={() => handleSocialLogin("GitHub")}
                        >
                          <Github className="mr-2 w-4 h-4" />
                          Pokračovat s GitHub
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {/* Benefits */}
                      <div className="bg-[#1A1A1F] rounded-xl p-4 mb-6 border border-[#2A2A2F]">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-sm font-medium text-white">FREE plán zahrnuje:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {registerBenefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                              <CheckCircle className="w-3 h-3 text-[#D4AF37] shrink-0" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handleRegister} className="space-y-3">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type="text"
                            placeholder="Celé jméno"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                            className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white pl-10 py-5"
                          />
                        </div>

                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type="email"
                            placeholder="Email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                            className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white pl-10 py-5"
                          />
                        </div>
                        
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Heslo (min. 8 znaků)"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                            minLength={8}
                            className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white pl-10 pr-10 py-5"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type="password"
                            placeholder="Potvrdit heslo"
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                            required
                            className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white pl-10 py-5"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="btn-gold w-full py-5"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                          ) : (
                            <>
                              Vytvořit účet zdarma
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </form>

                      <p className="text-xs text-gray-500 text-center mt-4">
                        Registrací souhlasíte s{" "}
                        <a href="#" className="text-[#D4AF37] hover:underline">obchodními podmínkami</a>
                        {" "}a{" "}
                        <a href="#" className="text-[#D4AF37] hover:underline">ochranou soukromí</a>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
