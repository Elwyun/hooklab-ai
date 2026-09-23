interface StatCardData {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

const stats: StatCardData[] = [
  {
    title: "Total Projects",
    value: "8",
    change: "+2 this month",
    changeType: "up",
    icon: "📁",
    color: "blue",
  },
  {
    title: "Hooks Generated",
    value: "247",
    change: "+43 this week",
    changeType: "up",
    icon: "🎯",
    color: "violet",
  },
  {
    title: "Credits Used",
    value: "153",
    change: "5 remaining",
    changeType: "neutral",
    icon: "⚡",
    color: "amber",
  },
  {
    title: "Saved Hooks",
    value: "18",
    change: "+3 this week",
    changeType: "up",
    icon: "⭐",
    color: "emerald",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 ring-blue-200",
  violet: "bg-violet-50 text-violet-600 ring-violet-200",
  amber: "bg-amber-50 text-amber-600 ring-amber-200",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200",
};

const changeColorMap: Record<string, string> = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-slate-500",
};

export default function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${colorMap[stat.color]}`}>
              <span className="text-base">{stat.icon}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {stat.title}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className={`mt-1 text-xs font-medium ${changeColorMap[stat.changeType]}`}>
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
