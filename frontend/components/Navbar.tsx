import Link from "next/link";
import { AGENTS } from "@/lib/agents";

export default function Navbar() {
  return (
    <nav className="border-b border-[#e5e5ea] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-13 flex items-center gap-6">
        <Link href="/" className="font-semibold text-[#1d1d1f] tracking-tight text-sm">
          AI Agents
        </Link>
        <div className="flex items-center gap-0.5 ml-2">
          {AGENTS.map((a) => (
            <Link
              key={a.id}
              href={a.path}
              className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              {a.icon} {a.name.split(" ")[0]}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
