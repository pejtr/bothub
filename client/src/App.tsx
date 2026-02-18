import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./lib/i18n";
import { CookieConsent } from "./components/CookieConsent";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Activate from "./pages/Activate";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import UserDashboard from "./pages/UserDashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import IBotDetail from "./pages/IBotDetail";
import Wishlist from "./pages/Wishlist";
import Preferences from "./pages/Preferences";
import Account from "./pages/Account";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/activate"} component={Activate} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/payment-success"} component={PaymentSuccess} />
      <Route path={"/payment-cancel"} component={PaymentCancel} />
      <Route path={"/dashboard"} component={UserDashboard} />
      <Route path={"/affiliate-dashboard"} component={AffiliateDashboard} />
      <Route path={"/ibot/:id"} component={IBotDetail} />
      <Route path={"/wishlist"} component={Wishlist} />
      <Route path={"/preferences"} component={Preferences} />
      <Route path={"/account"} component={Account} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <CookieConsent />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
