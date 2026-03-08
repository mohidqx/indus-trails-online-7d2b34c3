import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import PageTransition from "@/components/common/PageTransition";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import Tours from "./pages/Tours";
import Vehicles from "./pages/Vehicles";
import Hotels from "./pages/Hotels";
import Deals from "./pages/Deals";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Feedback from "./pages/Feedback";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function VisitorTracker() {
  useVisitorTracking();
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/destinations" element={<PageTransition><Destinations /></PageTransition>} />
        <Route path="/tours" element={<PageTransition><Tours /></PageTransition>} />
        <Route path="/vehicles" element={<PageTransition><Vehicles /></PageTransition>} />
        <Route path="/hotels" element={<PageTransition><Hotels /></PageTransition>} />
        <Route path="/deals" element={<PageTransition><Deals /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/booking" element={<PageTransition><Booking /></PageTransition>} />
        <Route path="/feedback" element={<PageTransition><Feedback /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <VisitorTracker />
            <AnimatedRoutes />
            <WhatsAppButton />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
