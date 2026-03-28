import { NextResponse } from "next/server";

function stripCdata(str) {
  return str
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

export async function GET() {
  try {
    const rssUrl = "https://economictimes.indiatimes.com/rssfeedstopstories.cms";
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

    const res = await fetch(proxyUrl, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("RSS fetch failed");

    const json = await res.json();
    const xml = json.contents || "";

    const headlines = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && headlines.length < 5) {
      const itemXml = match[1];
      const rawTitle = (itemXml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
      const rawLink = (itemXml.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
      const title = stripCdata(rawTitle);
      const link = stripCdata(rawLink);
      if (title && link) {
        headlines.push({ title, link });
      }
    }

    return NextResponse.json({ headlines });
  } catch (error) {
    console.error("RSS fetch error:", error);
    return NextResponse.json({ headlines: [
      { title: "Markets Today: Key developments you need to watch", link: "https://economictimes.indiatimes.com" },
      { title: "Budget 2026: What it means for your investments", link: "https://economictimes.indiatimes.com" },
      { title: "RBI Policy: Rate decision impact on EMIs and deposits", link: "https://economictimes.indiatimes.com" }
    ]});
  }
}
