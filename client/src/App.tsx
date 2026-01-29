import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieConsent } from "@/components/CookieConsent";
import { Analytics } from "@/components/Analytics";
import { CVProvider, useCV } from "@/lib/cvContext";
import { CVPopup } from "@/components/CVPopup";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Placeholder from "@/pages/Placeholder";
import Admin from "@/pages/Admin";
import Exhibitions from "@/pages/Exhibitions";
import ExhibitionsAdmin from "@/pages/ExhibitionsAdmin";
import Projects from "@/pages/Projects";
import ProjectsAdmin from "@/pages/ProjectsAdmin";
import Contact from "@/pages/Contact";
import Impressum from "@/pages/Impressum";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/archive" component={ExhibitionsAdmin} />
      <Route path="/projects" component={Projects} />
      <Route path="/admin/projects" component={ProjectsAdmin} />
      <Route path="/contact" component={Contact} />
      <Route path="/archive" component={Exhibitions} />
      <Route path="/impressum" component={Impressum} />
      <Route component={NotFound} />
    </Switch>
  );
}

function GlobalCV() {
  const { isOpen, closeCV } = useCV();
  return <CVPopup isOpen={isOpen} onClose={closeCV} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CVProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsent />
          <Analytics />
          <GlobalCV />
        </TooltipProvider>
      </CVProvider>
    </QueryClientProvider>
  );
}

export default App;
