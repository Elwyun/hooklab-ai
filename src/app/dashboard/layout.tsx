import type { Metadata } from "next";
import DashboardSidebar from "@/components/DashboardSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard - HookLab AI",
  description: "Manage your hooks, projects, and account settings.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar user={{ name: session.user.name, email: session.user.email, image: session.user.image }} />
      <div className="flex-1 overflow-auto">
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
