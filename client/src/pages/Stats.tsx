import { useState, useEffect } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Link } from "wouter";

interface StatsData {
  totalViews: number;
  pageBreakdown: { page: string; views: number }[];
  dailyViews: { date: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
}

export default function Stats() {
  const { isAuthenticated, password, login, logout } = useAdminAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    if (isAuthenticated && password) {
      fetchStats();
    }
  }, [isAuthenticated, password, days]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, days }),
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(passwordInput);
    if (!result.success) {
      setError(result.error || "Invalid password");
    }
  };

  const maxViews = stats?.dailyViews?.length
    ? Math.max(...stats.dailyViews.map((d) => d.views))
    : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white p-8 font-mono">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl mb-8 lowercase">statistics login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="password"
              className="w-full border border-black p-2 font-mono lowercase"
              data-testid="input-password"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white p-2 font-mono lowercase hover:bg-gray-800"
              data-testid="button-login"
            >
              login
            </button>
          </form>
          <Link href="/" className="block mt-4 text-gray-500 hover:underline text-sm">
            ← back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl lowercase">visitor statistics</h1>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="border border-black p-1 font-mono text-sm"
              data-testid="select-days"
            >
              <option value={7}>last 7 days</option>
              <option value={30}>last 30 days</option>
              <option value={90}>last 90 days</option>
            </select>
            <Link href="/admin" className="text-gray-500 hover:underline text-sm">
              admin
            </Link>
            <button
              onClick={logout}
              className="text-gray-500 hover:underline text-sm"
              data-testid="button-logout"
            >
              logout
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-400">loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {stats && (
          <div className="space-y-8">
            <div className="border border-black p-4">
              <h2 className="text-lg mb-2 lowercase">total views</h2>
              <p className="text-4xl font-bold" data-testid="text-total-views">
                {stats.totalViews}
              </p>
            </div>

            <div className="border border-black p-4">
              <h2 className="text-lg mb-4 lowercase">daily views</h2>
              {stats.dailyViews.length > 0 ? (
                <div className="flex items-end h-40 gap-1">
                  {stats.dailyViews.map((day) => (
                    <div
                      key={day.date}
                      className="flex-1 bg-black hover:bg-gray-700 transition-colors relative group"
                      style={{
                        height: maxViews > 0 ? `${(day.views / maxViews) * 100}%` : "0%",
                        minHeight: day.views > 0 ? "4px" : "0",
                      }}
                      data-testid={`bar-${day.date}`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-xs p-1 hidden group-hover:block whitespace-nowrap">
                        {day.date}: {day.views}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">no data</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-black p-4">
                <h2 className="text-lg mb-4 lowercase">pages</h2>
                {stats.pageBreakdown.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.pageBreakdown.slice(0, 10).map((page) => (
                      <li key={page.page} className="flex justify-between text-sm">
                        <span className="truncate mr-2">{page.page}</span>
                        <span className="font-bold">{page.views}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">no data</p>
                )}
              </div>

              <div className="border border-black p-4">
                <h2 className="text-lg mb-4 lowercase">referrers</h2>
                {stats.topReferrers.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.topReferrers.map((ref) => (
                      <li key={ref.referrer} className="flex justify-between text-sm">
                        <span className="truncate mr-2">
                          {ref.referrer || "(direct)"}
                        </span>
                        <span className="font-bold">{ref.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">no referrers</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
