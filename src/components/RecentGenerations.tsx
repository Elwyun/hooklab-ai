interface Generation {
  id: string;
  productName: string;
  platform: string;
  tone: string;
  hooksCount: number;
  createdAt: string;
  status: "completed" | "processing" | "failed";
}

const recentGenerations: Generation[] = [
  {
    id: "GEN-001",
    productName: "Kopi Nikmat Premium",
    platform: "Meta Ads",
    tone: "Professional",
    hooksCount: 5,
    createdAt: "2 jam yang lalu",
    status: "completed",
  },
  {
    id: "GEN-002",
    productName: "Tas Kulit Handmade",
    platform: "Instagram Reels",
    tone: "Casual",
    hooksCount: 5,
    createdAt: "5 jam yang lalu",
    status: "completed",
  },
  {
    id: "GEN-003",
    productName: "Vitamin Imun Tubuh",
    platform: "TikTok",
    tone: "Urgent",
    hooksCount: 3,
    createdAt: "1 hari yang lalu",
    status: "completed",
  },
  {
    id: "GEN-004",
    productName: "Aplikasi Belajar Online",
    platform: "Meta Ads",
    tone: "Empathetic",
    hooksCount: 5,
    createdAt: "2 hari yang lalu",
    status: "failed",
  },
  {
    id: "GEN-005",
    productName: "Kursus Public Speaking",
    platform: "YouTube Shorts",
    tone: "Humorous",
    hooksCount: 5,
    createdAt: "3 hari yang lalu",
    status: "completed",
  },
];

const statusMap: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  processing: { label: "Processing", color: "bg-amber-100 text-amber-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
};

export default function RecentGenerations() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Recent Generations</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
          View All →
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {recentGenerations.map((gen) => (
          <div key={gen.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50">
            {/* Status dot */}
            <span className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${
              gen.status === "completed" ? "bg-emerald-500" :
              gen.status === "processing" ? "bg-amber-500" : "bg-red-500"
            }`} />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {gen.productName}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>📱 {gen.platform}</span>
                <span>•</span>
                <span>🎙️ {gen.tone}</span>
                <span>•</span>
                <span>🎯 {gen.hooksCount} hooks</span>
              </div>
            </div>

            {/* Status badge + time */}
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusMap[gen.status].color}`}>
                {statusMap[gen.status].label}
              </span>
              <span className="text-[11px] text-slate-400">{gen.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
