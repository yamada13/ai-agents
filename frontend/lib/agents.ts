export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  concepts: string[];
  path: string;
  backendPath: string;
  color: string;
  icon: string;
}

export const AGENTS: AgentConfig[] = [
  {
    id: "pydantic",
    name: "Pydantic AI Agent",
    description:
      "A general-purpose assistant built with Pydantic AI. Streams responses via the AG-UI protocol with real-time tool calls.",
    concepts: ["Pydantic AI", "AG-UI", "Tool calls", "SSE streaming"],
    path: "/agents/pydantic",
    backendPath: "/agents/pydantic",
    color: "blue",
    icon: "🤖",
  },
  {
    id: "crawler",
    name: "Crawler Agent",
    description:
      "Give it a URL and a question. It scrapes pages, follows links, and synthesises a structured answer — streaming progress as it works.",
    concepts: ["Web scraping", "Firecrawl", "AG-UI generative UI", "httpx"],
    path: "/agents/crawler",
    backendPath: "/agents/crawler",
    color: "green",
    icon: "🕷️",
  },
  {
    id: "harness",
    name: "Harness Agent",
    description:
      "A coding & data-analysis agent powered by Pydantic AI Harness CodeMode — it writes and executes sandboxed Python to answer your questions.",
    concepts: ["pydantic-ai-harness", "CodeMode", "Monty sandbox", "AG-UI"],
    path: "/agents/harness",
    backendPath: "/agents/harness",
    color: "purple",
    icon: "⚙️",
  },
  {
    id: "productivity",
    name: "Productivity Agent",
    description:
      "An AI task manager with live shared state. Create, update, and delete tasks by chatting — the board updates in real-time via AG-UI StateSnapshotEvents.",
    concepts: ["AG-UI shared state", "StateDeps", "StateSnapshotEvent", "Pydantic AI"],
    path: "/agents/productivity",
    backendPath: "/agents/productivity",
    color: "orange",
    icon: "✅",
  },
];

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:9000";
