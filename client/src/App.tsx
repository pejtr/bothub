import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./lib/i18n";
import { CookieConsent } from "./components/CookieConsent";

// Critical path — load immediately
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Secondary pages — lazy loaded for code splitting
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Activate = lazy(() => import("./pages/Activate"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const IBotDetail = lazy(() => import("./pages/IBotDetail"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Preferences = lazy(() => import("./pages/Preferences"));
const Account = lazy(() => import("./pages/Account"));

// Minimal loading fallback — no layout shift
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
