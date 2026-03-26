import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import CV from "./pages/CV";
import ExperienceDetail from "./pages/ExperienceDetail";
import EducationDetail from "./pages/EducationDetail";
import NotFound from "./pages/NotFound";
import { useAnalytics } from "./hooks/use-analytics";

const Analytics = () => { useAnalytics(); return null; };

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <HashRouter>
          <Analytics />
          <Routes>
            <Route path="/" element={<CV />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/education/:id" element={<EducationDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
