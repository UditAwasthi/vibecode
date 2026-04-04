"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/project.store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  LayoutTemplate, 
  ArrowRight, 
  Sun, 
  Moon, 
  Zap, 
  MoreVertical, 
  Clock 
} from "lucide-react";

export default function StructuredDashboard({ projects }: { projects: any[] }) {
  const router = useRouter();
  const { projects: storeProjects, setProjects, addProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Functionality remains exactly the same
  useEffect(() => {
    setProjects(projects);
  }, [projects, setProjects]);

  const createProject = async () => {
    setLoading(true);
    const res = await fetch("/api/project", {
      method: "POST",
      body: JSON.stringify({ title: "New Exploration", template: "React" }),
    });
    const data = await res.json();
    if (data?.id) {
      addProject(data);
      router.push(`/playground/${data.id}`);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 
      ${isDark ? "bg-[#080808] text-white" : "bg-[#FBFBFD] text-slate-900"}`}>
      
      {/* 1. Pro Sticky Navigation */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md 
        ${isDark ? "border-white/10 bg-[#080808]/80" : "border-slate-200 bg-[#FBFBFD]/80"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center 
                ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="font-bold tracking-tight">Nexus Labs</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium opacity-60">
              <a href="#" className="hover:opacity-100 transition-opacity">Workspaces</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Deployments</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Settings</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-md transition-colors 
                ${isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-black/5 text-slate-600"}`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className={`h-5 w-[1px] ${isDark ? "bg-white/20" : "bg-black/20"}`} />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Labs</h1>
            <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-slate-500"}`}>
              Build, test, and deploy from one spatial plane.
            </p>
          </div>
          
          <button
            onClick={createProject}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-[0.98]
              ${isDark ? "bg-white text-black hover:bg-slate-200" : "bg-black text-white hover:bg-slate-800"}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
            ) : (
              <Plus size={16} />
            )}
            Create Lab
          </button>
        </div>

        {/* 3. Standard SaaS Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {storeProjects.map((project, i) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isDark={isDark} 
                onClick={() => router.push(`/playground/${project.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {storeProjects.length === 0 && (
          <div className={`mt-10 py-20 rounded-xl border-2 border-dashed text-center
            ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-300 bg-slate-50"}`}>
            <LayoutTemplate size={32} className={`mx-auto mb-4 ${isDark ? "text-white/20" : "text-slate-400"}`} />
            <h3 className="text-lg font-medium tracking-tight mb-1">Awaiting Materialization</h3>
            <p className={`text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>
              Click "Create Lab" to spin up your first environment.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// 4. Refactored Node to a Proper Card Component
function ProjectCard({ project, isDark, onClick }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`group flex flex-col p-5 rounded-xl border cursor-pointer transition-all
        ${isDark 
          ? "bg-[#111] border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50" 
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center
          ${isDark ? "bg-white/5 text-white/70" : "bg-slate-100 text-slate-600"}`}>
          <LayoutTemplate size={20} />
        </div>
        <button className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity
          ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
          <MoreVertical size={16} className={isDark ? "text-white/50" : "text-slate-400"} />
        </button>
      </div>
      
      <div className="flex-1">
        <h3 className="text-base font-semibold tracking-tight mb-2 truncate">
          {project.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider
            ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
            {project.template}
          </span>
        </div>
      </div>

      <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs
        ${isDark ? "border-white/10 text-white/40" : "border-slate-100 text-slate-500"}`}>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>Local Sync</span>
        </div>
        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}