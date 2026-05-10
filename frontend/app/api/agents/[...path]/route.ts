/**
 * Server-side proxy for all agent requests.
 *
 * Why this exists:
 *   - Keeps the Railway backend URL out of the browser (no NEXT_PUBLIC_ prefix)
 *   - Adds the X-Site-Token secret header that the backend requires
 *   - The browser only ever talks to yaminiadari.com — Railway is invisible
 */
import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9000";
const SITE_SECRET = process.env.SITE_SECRET ?? "";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const agentPath = path.join("/");
  const body = await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/agents/${agentPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Site-Token": SITE_SECRET,
      },
      body,
      // Required for SSE streaming — don't buffer the response
      // @ts-expect-error: Node 18+ fetch supports this
      duplex: "half",
    });
  } catch {
    return new Response(JSON.stringify({ error: "Backend unreachable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the SSE response back to the browser as-is
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
