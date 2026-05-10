"use client";

import Link from "next/link";
import { useState } from "react";
import { AGENTS, type AgentConfig } from "@/lib/agents";

const previewGradients: Record<string, string> = {
  blue:   "from-blue-50 to-blue-100 border-blue-200",
  green:  "from-green-50 to-emerald-100 border-green-200",
  purple: "from-purple-50 to-violet-100 border-purple-200",
  orange: "from-orange-50 to-amber-100 border-orange-200",
};

const previewAccent: Record<string, string> = {
  blue:   "text-blue-600",
  green:  "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
};

const rowHoverBg: Record<string, string> = {
  blue:   "hover:bg-blue-50/40",
  green:  "hover:bg-green-50/40",
  purple: "hover:bg-purple-50/40",
  orange: "hover:bg-orange-50/40",
};

const accentBar: Record<string, string> = {
  blue:   "bg-blue-400",
  green:  "bg-green-400",
  purple: "bg-purple-400",
  orange: "bg-orange-400",
};

const accentIndex: Record<string, string> = {
  blue:   "group-hover:text-blue-500",
  green:  "group-hover:text-green-500",
  purple: "group-hover:text-purple-500",
  orange: "group-hover:text-orange-500",
};

function AgentPreview({ agent }: { agent: AgentConfig }) {
  return (
    <div className={`w-72 rounded-2xl border bg-gradient-to-br p-6 ${previewGradients[agent.color]}`}>
      <div className="text-4xl mb-4 leading-none flex items-center">{agent.icon}</div>
      <p className={`text-xs font-mono font-medium mb-2 ${previewAccent[agent.color]}`}>
        {String(AGENTS.indexOf(agent) + 1).padStart(2, "0")}
      </p>
      <h3 className="text-base font-semibold text-[#1d1d1f] mb-2">{agent.name}</h3>
      <p className="text-xs text-[#6e6e73] leading-relaxed mb-4">{agent.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {agent.concepts.map((c) => (
          <span
            key={c}
            className="text-xs font-mono bg-white/70 text-[#1d1d1f] px-2 py-0.5 rounded-full border border-white"
          >
            {c}
          </span>
        ))}
      </div>
      <p className={`mt-5 text-xs font-medium ${previewAccent[agent.color]}`}>
        Click to explore →
      </p>
    </div>
  );
}

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredAgent = AGENTS.find((a) => a.id === hovered);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-8 pt-20 pb-14">
        <p className="text-xs font-mono text-[#6e6e73] mb-6 tracking-widest uppercase">
          yaminiadari.com
        </p>
        <h1 className="text-3xl font-semibold text-[#1d1d1f] leading-snug mb-4">
          Hi, I&apos;m Yamini.
          <br />
          I build and publish AI agents.
        </h1>
        <p className="text-sm text-[#6e6e73] leading-relaxed max-w-sm">
          Self-taught, experiment-driven. I pick a concept, build something real
          with it, and post it here — so you can see exactly what these agents
          do and how they work.
        </p>
      </div>

      {/* Agent list */}
      <div className="max-w-2xl mx-auto px-8 pb-24 relative">
        <div className="border-t border-[#e5e5ea]">
          {AGENTS.map((agent, i) => (
            <Link
              key={agent.id}
              href={agent.path}
              onMouseEnter={() => setHovered(agent.id)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative flex items-center justify-between py-6 border-b border-[#e5e5ea] transition-colors pl-4 ${rowHoverBg[agent.color]}`}
            >
              {/* Left accent bar — grows from center on hover */}
              <span
                className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full origin-center scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ${accentBar[agent.color]}`}
              />

              <div className="flex items-center gap-6">
                {/* Index number — picks up accent color on hover */}
                <span className={`text-xs font-mono text-[#c7c7cc] w-5 shrink-0 transition-colors duration-200 ${accentIndex[agent.color]}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Text */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{agent.icon}</span>
                    <span className="text-base font-medium text-[#1d1d1f] group-hover:text-black transition-colors">{agent.name}</span>
                  </div>
                  <p className="text-sm text-[#6e6e73] mt-0.5">{agent.description.split("—")[0].trim()}</p>
                </div>
              </div>

              {/* Arrow */}
              <span className="text-[#c7c7cc] group-hover:text-[#1d1d1f] group-hover:translate-x-1 transition-all text-sm">
                →
              </span>
            </Link>
          ))}
        </div>

        {/* Hover preview — slides in from right */}
        <div
          className={`fixed top-1/2 right-12 -translate-y-1/2 transition-all duration-300 pointer-events-none z-50 ${
            hoveredAgent
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-6"
          }`}
        >
          {hoveredAgent && <AgentPreview agent={hoveredAgent} />}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto px-8 pb-12">
        <p className="text-xs text-[#c7c7cc] font-mono">
          Built with Pydantic AI · AG-UI · Next.js
        </p>
      </div>
    </div>
  );
}
