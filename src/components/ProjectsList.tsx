interface Project {
  id: string;
  name: string;
  description: string;
  hooksCount: number;
  lastGenerated: string;
  platform: string;
}

const projects: Project[] = [
  {
    id: "PRJ-001",
    name: "Coffee Campaign",
    description: "Meta Ads campaign for premium coffee brand",
    hooksCount: 25,
    lastGenerated: "2 jam yang lalu",
    platform: "📱 Meta Ads",
  },
  {
    id: "PRJ-002",
    name: "Fashion Collection Launch",
    description: "Instagram Reels hooks for new leather bag line",
    hooksCount: 15,
    lastGenerated: "5 jam yang lalu",
    platform: "📸 Instagram",
  },
  {
    id: "PRJ-003",
    name: "Health Supplement Q2",
    description: "TikTok viral hooks for immunity vitamins",
    hooksCount: 8,
    lastGenerated: "1 hari yang lalu",
    platform: "🎵 TikTok",
  },
  {
    id: "PRJ-004",
    name: "Education Platform",
    description: "YouTube Shorts hooks for online learning app",
    hooksCount: 20,
    lastGenerated: "3 hari yang lalu",
    platform: "▶️ YouTube",
  },
];

export default function ProjectsList() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Projects</h3>
        <button className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-700">
          <span>+</span> New Project
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
          >
            {/* Number */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-slate-200">
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600">
                  {project.name}
                </p>
                <span className="text-xs text-slate-400">{project.platform}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {project.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex shrink-0 items-center gap-4 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{project.hooksCount} hooks</span>
              <span>{project.lastGenerated}</span>
              <button className="rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 opacity-0 transition-all hover:bg-blue-50 group-hover:opacity-100">
                Open →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
