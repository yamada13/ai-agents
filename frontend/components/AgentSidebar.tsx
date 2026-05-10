"use client";

import { useState } from "react";
import { AGENT_CONTENT } from "@/lib/agentContent";

interface Props {
  agentId: string;
  color: string;
  onSend: (text: string) => void;
  /** Optional content rendered at the bottom (e.g. live task board for the productivity agent) */
  bottomContent?: React.ReactNode;
}

const accent: Record<string, { text: string; bg: string; border: string }> = {
  blue:   { text: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
  green:  { text: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
  purple: { text: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  orange: { text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
};

export default function AgentSidebar({ agentId, color, onSend, bottomContent }: Props) {
  const content = AGENT_CONTENT[agentId];
  const [hoveredCap, setHoveredCap] = useState<number | null>(null);
  const [hoveredPrompt, setHoveredPrompt] = useState<number | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<number | null>(null);

  const a = accent[color] ?? accent.blue;

  if (!content) return null;

  return (
    <div className="w-72 shrink-0 border-r border-[#e5e5ea] bg-white flex flex-col overflow-y-auto">
      <div className="p-5 space-y-6">

        {/* What is it */}
        <div>
          <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest mb-2 ${a.text}`}>
            What is this?
          </p>
          <p className="text-sm font-semibold text-[#1d1d1f] leading-snug mb-2">
            {content.tagline}
          </p>
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            {content.whatIsIt}
          </p>
        </div>

        {/* Capabilities — hover to expand detail */}
        <div>
          <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest mb-3 ${a.text}`}>
            What it can do
          </p>
          <div className="space-y-2">
            {content.capabilities.map((cap, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 cursor-default transition-colors duration-150 ${
                  hoveredCap === i
                    ? `${a.bg} ${a.border}`
                    : "border-[#e5e5ea] bg-[#fafafa]"
                }`}
                onMouseEnter={() => setHoveredCap(i)}
                onMouseLeave={() => setHoveredCap(null)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{cap.icon}</span>
                  <span className="text-xs font-medium text-[#1d1d1f]">{cap.title}</span>
                </div>

                {/* Expanding detail */}
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    hoveredCap === i ? "max-h-24 mt-2 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs text-[#6e6e73] leading-relaxed">{cap.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt suggestions — hover shows preview, click sends */}
        <div>
          <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest mb-3 ${a.text}`}>
            Try these
          </p>
          <div className="space-y-2">
            {content.prompts.map((prompt, i) => (
              <button
                key={i}
                className={`w-full text-left rounded-xl border p-3 transition-colors duration-150 group ${
                  hoveredPrompt === i
                    ? `${a.bg} ${a.border}`
                    : "border-[#e5e5ea] bg-[#fafafa] hover:bg-white"
                }`}
                onMouseEnter={() => setHoveredPrompt(i)}
                onMouseLeave={() => setHoveredPrompt(null)}
                onClick={() => onSend(prompt.text)}
              >
                <p className="text-xs text-[#1d1d1f] leading-relaxed">{prompt.text}</p>

                {/* Expanding preview */}
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    hoveredPrompt === i ? "max-h-20 mt-2 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className={`text-xs leading-relaxed ${a.text}`}>
                    <span className="font-medium">What happens: </span>
                    {prompt.preview}
                  </p>
                  <p className="text-[10px] text-[#6e6e73] mt-1.5">Click to send →</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Why powerful */}
        <div className={`rounded-xl border ${a.border} ${a.bg} p-4`}>
          <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest mb-2 ${a.text}`}>
            Why it&apos;s powerful
          </p>
          <p className="text-xs text-[#1d1d1f] leading-relaxed">{content.whyPowerful}</p>
        </div>

        {/* Concept pills — hover shows plain-English explanation */}
        <div>
          <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest mb-3 ${a.text}`}>
            Concepts used
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {content.concepts.map((concept, i) => (
              <span
                key={i}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-full border cursor-default transition-colors duration-150 ${
                  hoveredConcept === i
                    ? `${a.bg} ${a.border} ${a.text}`
                    : "bg-[#f5f5f7] border-[#e5e5ea] text-[#6e6e73] hover:border-[#c7c7cc]"
                }`}
                onMouseEnter={() => setHoveredConcept(i)}
                onMouseLeave={() => setHoveredConcept(null)}
              >
                {concept.term}
              </span>
            ))}
          </div>

          {/* Concept explanation box — appears when any pill is hovered */}
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out rounded-xl border ${
              hoveredConcept !== null
                ? `max-h-32 opacity-100 ${a.border} ${a.bg} p-3`
                : "max-h-0 opacity-0 border-transparent"
            }`}
          >
            {hoveredConcept !== null && (
              <>
                <p className={`text-xs font-semibold mb-1 ${a.text}`}>
                  {content.concepts[hoveredConcept].term}
                </p>
                <p className="text-xs text-[#1d1d1f] leading-relaxed">
                  {content.concepts[hoveredConcept].plain}
                </p>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Bottom slot — used by productivity page to embed the task board */}
      {bottomContent && (
        <div className="border-t border-[#e5e5ea] flex-1 min-h-0 flex flex-col">
          {bottomContent}
        </div>
      )}
    </div>
  );
}
