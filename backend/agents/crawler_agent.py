"""Crawler Agent — scrapes and analyzes web pages.

Demonstrates:
- Multi-tool agent with real HTTP/HTML parsing
- Optional Firecrawl integration (set FIRECRAWL_API_KEY for richer output)
- AG-UI generative streaming while crawling

Tools:
  scrape_page  — fetch + parse a single URL into clean markdown
  crawl_links  — extract all internal links from a page
  summarize_pages — crawl a list of URLs and produce a combined summary
"""
from __future__ import annotations

import os
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from pydantic_ai import Agent

MODEL = os.getenv("DEFAULT_MODEL", "anthropic:claude-sonnet-4-6")

_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; AIBot/1.0)"}


async def _fetch_html(url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True, timeout=20) as client:
        resp = await client.get(url, headers=_HEADERS)
        resp.raise_for_status()
        return resp.text


def _html_to_markdown(html: str, base_url: str = "") -> str:
    """Strip boilerplate and convert main content to readable text."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)
    # Collapse blank lines
    lines = [l for l in text.splitlines() if l.strip()]
    return "\n".join(lines)[:6000]


def _extract_links(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    base_domain = urlparse(base_url).netloc
    links: list[str] = []
    for a in soup.find_all("a", href=True):
        href = urljoin(base_url, a["href"])
        parsed = urlparse(href)
        if parsed.netloc == base_domain and parsed.scheme in ("http", "https"):
            links.append(href)
    return list(dict.fromkeys(links))  # dedupe, preserve order


# ── Optional Firecrawl upgrade ─────────────────────────────────────────────────
_firecrawl_key = os.getenv("FIRECRAWL_API_KEY")
_firecrawl_client = None
if _firecrawl_key:
    try:
        from firecrawl import FirecrawlApp  # type: ignore
        _firecrawl_client = FirecrawlApp(api_key=_firecrawl_key)
    except ImportError:
        pass  # firecrawl-py not installed — fallback to httpx


async def _scrape(url: str) -> str:
    if _firecrawl_client:
        result = _firecrawl_client.scrape_url(url, formats=["markdown"])
        return result.get("markdown", "")[:6000]
    html = await _fetch_html(url)
    return _html_to_markdown(html, url)


# ── Agent ──────────────────────────────────────────────────────────────────────

agent = Agent(
    MODEL,
    name="crawler",
    instructions="""You are a web research agent. Given a URL and an optional topic,
you crawl and analyze web content. Use scrape_page to read a URL, crawl_links to
discover related pages, and summarize_pages to analyze multiple URLs at once.
Always cite the URLs you used. Be thorough and structured in your summaries.""",
)


@agent.tool_plain
async def scrape_page(url: str) -> str:
    """Scrape a URL and return its main text content as markdown.

    Args:
        url: The full URL to scrape.
    """
    try:
        return await _scrape(url)
    except Exception as e:
        return f"Error scraping {url}: {e}"


@agent.tool_plain
async def crawl_links(url: str, max_links: int = 10) -> list[str]:
    """Return internal links found on a page.

    Args:
        url: The page to crawl for links.
        max_links: Maximum number of links to return.
    """
    try:
        html = await _fetch_html(url)
        return _extract_links(html, url)[:max_links]
    except Exception as e:
        return [f"Error: {e}"]


@agent.tool_plain
async def summarize_pages(urls: list[str]) -> str:
    """Scrape multiple URLs and return a combined content dump for analysis.

    Args:
        urls: List of URLs to scrape (max 5 to avoid timeouts).
    """
    results: list[str] = []
    for url in urls[:5]:
        try:
            content = await _scrape(url)
            results.append(f"## {url}\n{content}")
        except Exception as e:
            results.append(f"## {url}\nError: {e}")
    return "\n\n---\n\n".join(results)


app = agent.to_ag_ui()
