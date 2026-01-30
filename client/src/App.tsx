import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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

function DynamicFavicon() {
  const { data } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/faviconUrl"],
    queryFn: async () => {
      const res = await fetch("/api/settings/faviconUrl");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.value) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = data.value;
      }
    }
  }, [data?.value]);

  return null;
}

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
          <DynamicFavicon />
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
