"use client";

import { signIn } from "next-auth/react";
import { motion } from "motion/react";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";

 const springConfig = { type: "spring", stiffness: 300, damping: 30 } as const;

export default function Home() {
  
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground selection:bg-primary/10">
      
      {/* --- Ambient Background Layer --- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Slow breathing ambient glow */}
        <motion.div 
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px] dark:bg-primary/10" 
        />
        
        {/* Top-down Zen Beam */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "8rem" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-1/2 w-px bg-linear-to-b from-border via-border/50 to-transparent" 
        />
      </div>

      {/* --- Main Content Section --- */}
      <main className="relative z-10 flex flex-col items-center">
        
        {/* Branding - Staggered Entry */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 flex flex-col items-center gap-6"
        >
          <h1 className="text-5xl font-extralight tracking-[0.5em] uppercase text-foreground/90">
            Vibecode
          </h1>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.5, duration: 2 }}
            className="font-serif text-4xl italic"
          >
            和
          </motion.span>
        </motion.div>

        {/* Auth Group - Physics-based Interaction */}
        <div className="flex w-72 flex-col gap-4">
          {[
            { id: "github", name: "GitHub", icon: SiGithub, delay: 0.1 },
            { id: "google", name: "Google", icon: SiGoogle, delay: 0.2 }
          ].map((provider) => (
            <motion.button
              key={provider.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springConfig, delay: provider.delay }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-card/50 px-6 py-4 backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-card"
            >
              {/* Subtle sweeping light on hover */}
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-primary/[0.05] to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
              
              <span className="relative text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                {provider.name}
              </span>
              <provider.icon size={18} className="relative opacity-30 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>

        {/* Footer Status - Breathing pulse */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-32 flex items-center gap-4 group cursor-default"
        >
          <div className="relative flex h-1.5 w-1.5">
            <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
            <div className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
          </div>
          <span className="font-mono text-[9px] tracking-[0.6em] uppercase text-muted-foreground/50 group-hover:text-primary transition-colors duration-500">
            System Operational
          </span>
        </motion.div>
      </main>

      {/* Vertical Edge Text - Aesthetic Framing */}
      <motion.aside 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 1.2 }}
        className="pointer-events-none fixed bottom-12 left-12 hidden rotate-90 origin-left font-mono text-[8px] tracking-[1em] uppercase text-muted-foreground lg:block"
      >
        Protocol v.04
      </motion.aside>
    </div>
  );
}