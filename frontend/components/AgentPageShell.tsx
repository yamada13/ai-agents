"use client";

import { useState } from "react";
import Link from "next/link";
import type { AgentConfig } from "@/lib/agents";
import { AGENT_CONTENT } from "@/lib/agentContent";

interface Props {
  agent: AgentConfig;
  children: React.ReactNode;
}

const borderMap: Record<string, string> = {
  blue:   "border-blue-100",
  green:  "border-green-100",
  purple: "border-purple-100",
  orange: "border-orange-100",
};

const badgeMap: Record<string, string> = {
  blue:   "bg-blue-50 text-blue-600 border-blue-200",
  green:  "bg-green-50 text-green-600 border-green-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  orange: "bg-orange-50 text-orange-600 border-orange-200",
};

const tooltipAccent: Record<string, string> = {
  blue:   "text-blue-600",
  green:  "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
};

export default function AgentPageShell({ agent, children }: Props) {
  const [hoveredConcept, setHoveredConcept] = useState<number | null>(null);
  const content = AGENT_CONTENT[agent.id];

  // Match rich concept data by term name (falls back gracefully if missing)
  const richConcepts = agent.concepts.map((term) =>
    content?.concepts.find((c) => c.term === term) ?? { term, plain: null }
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3.25rem)]">
      {/* Header */}
      <div className={`border-b px-6 py-3 flex items-center gap-3 bg-white ${borderMap[agent.color]}`}>
        <Link href="/" className="text-xs font-mono text-[#6e6e73] hover:text-[#1d1d1f] transition-colors mr-1">
          ← back
        </Link>
        <span className="text-[#e5e5ea]">|</span>
        <span className="text-xl leading-none flex items-center">{agent.icon}</span>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-[#1d1d1f] text-sm">{agent.name}</h1>
          <p className="text-xs text-[#6e6e73] truncate">{agent.description}</p>
        </div>

        {/* Concept pills with hover tooltips */}
        <div className="flex gap-1.5 shrink-0">
          {richConcepts.map((concept, i) => (
            <div
              key={concept.term}
              className="relative hidden md:block"
              onMouseEnter={() => setHoveredConcept(i)}
              onMouseLeave={() => setHoveredConcept(null)}
            >
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono border cursor-default select-none transition-all duration-150 ${badgeMap[agent.color]} ${
                  hoveredConcept === i ? "opacity-100" : "opacity-80"
                }`}
              >
                {concept.term}
              </span>

              {/* Tooltip — appears below the pill */}
              {hoveredConcept === i && concept.plain && (
                <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white border border-[#e5e5ea] rounded-xl shadow-lg p-3">
                  <p className={`text-xs font-semibold mb-1 ${tooltipAccent[agent.color]}`}>
                    {concept.term}
                  </p>
                  <p className="text-xs text-[#1d1d1f] leading-relaxed">{concept.plain}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-[#f5f5f7]">{children}</div>
    </div>
  );
}
