export interface Capability {
  icon: string;
  title: string;
  detail: string; // shown on hover — concrete real-world example
}

export interface PromptSuggestion {
  text: string;
  preview: string; // shown on hover — "here's what the agent will do"
}

export interface ConceptPill {
  term: string;
  plain: string; // plain-English tooltip for a layman
}

export interface AgentPageContent {
  tagline: string;
  whatIsIt: string;
  capabilities: Capability[];
  prompts: PromptSuggestion[];
  whyPowerful: string;
  concepts: ConceptPill[];
}

export const AGENT_CONTENT: Record<string, AgentPageContent> = {
  pydantic: {
    tagline: "A general AI assistant that can actually look things up.",
    whatIsIt:
      "Most AI chatbots only know what they were trained on — which could be months out of date. This agent can fetch live web pages and check the real current time anywhere in the world, right now.",
    capabilities: [
      {
        icon: "🌐",
        title: "Fetch any web page",
        detail:
          "Give it a URL and it reads the actual page — not a cached version. Try: a news article, a documentation page, or a product page.",
      },
      {
        icon: "🕐",
        title: "Real current time, any timezone",
        detail:
          "Not estimated — it uses your server's clock with proper timezone math. Ask for the time in Tokyo, Lagos, or Reykjavik.",
      },
      {
        icon: "🤔",
        title: "Reason over what it finds",
        detail:
          "It doesn't just return raw data — it reads the content and answers your actual question about it.",
      },
    ],
    prompts: [
      {
        text: "What time is it right now in Tokyo and New York?",
        preview: "Calls current_time twice with Asia/Tokyo and America/New_York, then compares them for you.",
      },
      {
        text: "Fetch https://pydantic.dev and explain what Pydantic is in one paragraph.",
        preview: "Fetches the live page, reads the content, and writes a plain-English summary.",
      },
      {
        text: "What's on the front page of https://news.ycombinator.com right now?",
        preview: "Scrapes Hacker News and lists the current top posts — live, not cached.",
      },
    ],
    whyPowerful:
      "A regular chatbot is stuck in the past. This agent lives in the present — it can read the internet and tell you what's happening right now. That's the difference between a library and a researcher.",
    concepts: [
      { term: "Pydantic AI", plain: "A Python framework for building AI agents with strict data types — like guardrails that prevent the AI from making up wrong-shaped answers." },
      { term: "Tool calls", plain: "When the agent decides to run actual code (like fetching a URL) instead of just generating text. You can see these happening live in the chat." },
      { term: "AG-UI streaming", plain: "The agent sends you its thinking piece by piece as it happens — you don't wait for the full answer, you watch it arrive in real time." },
    ],
  },

  crawler: {
    tagline: "Give it a website. Get back structured intelligence.",
    whatIsIt:
      "This agent doesn't just visit one page — it can crawl through a site, follow links, and synthesise what it finds into a clear answer. Think of it as sending a very fast, very thorough research assistant to any corner of the web.",
    capabilities: [
      {
        icon: "📄",
        title: "Scrape any page cleanly",
        detail:
          "Strips away ads, navigation and noise — returns just the meaningful text. Works on documentation sites, blogs, product pages, news articles.",
      },
      {
        icon: "🔗",
        title: "Follow internal links",
        detail:
          "Discovers and visits related pages automatically. Point it at a docs site and it finds all the relevant sections for you.",
      },
      {
        icon: "📊",
        title: "Summarise across multiple pages",
        detail:
          "Reads up to 5 pages in one go and synthesises the findings into one coherent answer — not a dump of raw text.",
      },
    ],
    prompts: [
      {
        text: "What does https://pydantic.dev do? Summarise it for a non-technical person.",
        preview: "Crawls the site, reads the key pages, and writes a jargon-free explanation.",
      },
      {
        text: "Find all the main sections of https://docs.pydantic.dev and list them.",
        preview: "Extracts internal links and maps out the documentation structure for you.",
      },
      {
        text: "What are the top 3 stories on https://news.ycombinator.com right now?",
        preview: "Scrapes the live page and picks out the top stories with titles and links.",
      },
    ],
    whyPowerful:
      "Competitive research, documentation mapping, content auditing — tasks that take a human hours can be done in seconds. The agent reads the web the same way you would, just much faster.",
    concepts: [
      { term: "Web scraping", plain: "Automatically reading the text of a web page — the same as opening a page and reading it, but done by code in milliseconds." },
      { term: "Firecrawl", plain: "An optional upgrade that makes crawling more powerful — handles JavaScript-heavy sites and returns cleaner output. Works without it too." },
      { term: "Generative UI", plain: "As the agent crawls each page, you see progress streaming live in the chat — not a spinner, actual status updates." },
    ],
  },

  harness: {
    tagline: "An agent that writes code, runs it, and shows you the answer.",
    whatIsIt:
      "Most AI tools generate code and hope it's right. This agent actually executes the code in a safe sandbox and returns the real output. It can analyse data, do maths, process text — anything Python can do.",
    capabilities: [
      {
        icon: "🐍",
        title: "Write and run Python",
        detail:
          "Generates code to solve your problem, runs it in an isolated sandbox, and returns the actual output — not a guess.",
      },
      {
        icon: "🧮",
        title: "Real calculations",
        detail:
          "No hallucinated maths. It computes: fibonacci sequences, compound interest, statistics, unit conversions — and shows its working.",
      },
      {
        icon: "📈",
        title: "Data processing",
        detail:
          "Give it raw numbers or a table and it can calculate averages, find patterns, sort and filter — like a very obedient spreadsheet.",
      },
    ],
    prompts: [
      {
        text: "Calculate the first 20 fibonacci numbers.",
        preview: "Writes a Python loop, executes it, and returns all 20 numbers — computed, not recalled.",
      },
      {
        text: "If I invest $1000 at 7% annual interest, how much will I have after 10, 20, and 30 years?",
        preview: "Runs compound interest calculations and returns a table of real computed values.",
      },
      {
        text: "What is 17 to the power of 13?",
        preview: "Computes the exact answer in Python — no estimation, no rounding.",
      },
    ],
    whyPowerful:
      "Regular AI confidently makes up numbers. This agent won't answer until it's actually run the code and got a real result. That's the difference between a student who guesses and one who shows their working.",
    concepts: [
      { term: "Pydantic AI Harness", plain: "An extension for Pydantic AI that adds extra capabilities like code execution. Think of it as a plugin system for your agent." },
      { term: "CodeMode", plain: "A mode where the agent wraps all its tools into runnable Python — so instead of calling tools one by one, it can write a script that uses them all at once." },
      { term: "Monty sandbox", plain: "A secure box where Python code runs in isolation — it can't access your files or the internet, it just computes and returns the result safely." },
    ],
  },

  productivity: {
    tagline: "An AI that manages your tasks and updates your UI live.",
    whatIsIt:
      "This is not a chatbot that tells you to make a to-do list. It IS the to-do list. When you ask it to create a task, the board on the left updates instantly — no refresh, no saving. The agent and your UI share the same live state.",
    capabilities: [
      {
        icon: "✅",
        title: "Create tasks by chatting",
        detail:
          "Say 'remind me to review the report by Friday' and a task appears on the board with the right priority and due date — inferred from your words.",
      },
      {
        icon: "✏️",
        title: "Update tasks in plain English",
        detail:
          "No forms, no clicking. Say 'mark the report task as done' or 'change the priority to high' and it updates immediately.",
      },
      {
        icon: "🔄",
        title: "Live board sync",
        detail:
          "The task board updates the moment the agent acts — powered by AG-UI state snapshots, not polling or page refreshes.",
      },
    ],
    prompts: [
      {
        text: "Add a high-priority task to review the Q2 report by this Friday.",
        preview: "Creates a task with priority: high and due date inferred — watch the board update instantly.",
      },
      {
        text: "Add three tasks: buy groceries (low priority), call dentist (high), and finish the presentation (medium, due Monday).",
        preview: "Creates all three in one go — the board fills up as the agent works through them.",
      },
      {
        text: "Mark all done tasks as deleted and show me what's left.",
        preview: "Agent reads the current list, deletes completed items, and the board reflects the changes live.",
      },
    ],
    whyPowerful:
      "The magic is the live sync. Traditional apps save data to a database, fetch it back, and re-render. Here the agent pushes state directly to your UI as it acts — you're watching the AI work in real time.",
    concepts: [
      { term: "Shared state", plain: "The agent and your browser hold the same data at the same time. When the agent changes something, your screen changes too — instantly." },
      { term: "StateDeps", plain: "A Pydantic AI feature that gives the agent access to the current state of your app, so it can read and modify it during a conversation." },
      { term: "StateSnapshotEvent", plain: "Every time the agent changes a task, it sends a 'snapshot' of the full updated list to your browser over the AG-UI stream." },
    ],
  },
};
