import StatCards from "@/components/StatCards";
import RecentGenerations from "@/components/RecentGenerations";
import ProjectsList from "@/components/ProjectsList";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your hook generation activity and projects.
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Selamat datang kembali! 🎯</h2>
            <p className="mt-1 text-sm text-blue-200">
              Anda telah membuat 247 hooks minggu ini. Teruslah berkarya!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
            <span className="text-2xl">🚀</span>
            <div>
              <p className="text-xs font-medium text-blue-200">Quick Action</p>
              <p className="text-sm font-semibold">Generate New Hook</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatCards />

      {/* Recent Activity & Projects */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentGenerations />
        <ProjectsList />
      </div>
    </div>
  );
}
