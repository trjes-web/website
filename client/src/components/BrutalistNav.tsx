import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function BrutalistNav() {
  const [location, setLocation] = useLocation();

  const { data: portfolioData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/portfolioLink"],
    queryFn: async () => {
      const res = await fetch("/api/settings/portfolioLink");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    
    if (value === "/portfolio" && portfolioData?.value) {
      window.open(portfolioData.value, "_blank");
      e.target.value = getCurrentValue();
      return;
    }
    
    setLocation(value);
  };

  const getCurrentValue = () => {
    if (location === "/") return "/";
    const path = location.split('/')[1];
    return `/${path}`;
  };

  return (
    <nav className="fixed top-4 right-4 z-50">
      <select
        id="nav-menu"
        onChange={handleChange}
        value={getCurrentValue()}
        className="appearance-none bg-white text-black px-3 py-1 font-mono text-xs cursor-pointer focus:outline-none rounded-none lowercase"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1' stroke-linecap='square' stroke-linejoin='miter'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 6px center",
          backgroundSize: "10px",
          paddingRight: "24px"
        }}
        data-testid="nav-menu"
      >
        <option value="/">home</option>
        <option value="/portfolio">portfolio</option>
        <option value="/cv">cv</option>
        <option value="/projects">projects</option>
        <option value="/contact">contact</option>
        <option value="/archive">archive</option>
        <option value="/admin">admin</option>
      </select>
    </nav>
  );
}
