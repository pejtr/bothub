import { useAuth } from "../_core/hooks/useAuth";
import { getLoginUrl } from "../const";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { User, Mail, Key, Calendar, LogIn, ExternalLink } from "lucide-react";

export default function Account() {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-amber-500">🤖</span>
            <span>BOTHUB</span>
          </a>
          <nav className="flex items-center gap-6">
            <a href="/dashboard" className="hover:text-amber-500 transition-colors">Dashboard</a>
            <a href="/preferences" className="hover:text-amber-500 transition-colors">Nastavení</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Můj účet</h1>
          <p className="text-gray-400">Správa vašeho BOTHUB účtu</p>
        </div>

        <div className="grid gap-6">
          {/* Account Info Card */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Informace o účtu
              </CardTitle>
              <CardDescription>Základní údaje o vašem účtu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                <Mail className="w-5 h-5 text-amber-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 mb-1">E-mailová adresa</div>
                  <div className="font-medium">{user.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                <User className="w-5 h-5 text-amber-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 mb-1">Jméno</div>
                  <div className="font-medium">{user.name || "Nenastaveno"}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                <LogIn className="w-5 h-5 text-amber-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 mb-1">Metoda přihlášení</div>
                  <div className="font-medium capitalize">{user.loginMethod || "Manus OAuth"}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 mb-1">Datum registrace</div>
                  <div className="font-medium">{formatDate(user.createdAt)}</div>
                </div>
              </div>

              {user.lastSignedIn && (
                <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-amber-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">Poslední přihlášení</div>
                    <div className="font-medium">{formatDate(user.lastSignedIn)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                Zabezpečení
              </CardTitle>
              <CardDescription>Správa hesla a zabezpečení účtu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-200 mb-4">
                  Váš účet je spravován přes Manus OAuth. Pro změnu hesla nebo e-mailové adresy použijte Manus portál.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.open("https://manus.im/account/security", "_blank")}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Změnit heslo
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => window.open("https://manus.im/account/profile", "_blank")}
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Změnit e-mail
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Badge */}
          {user.role === "admin" && (
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl">👑</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Administrátorský účet</div>
                    <div className="text-sm text-gray-300">Máte plný přístup k admin dashboardu</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
