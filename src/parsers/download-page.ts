import { load } from "cheerio";
import { createParseError } from "../errors.ts";

export function parseLibgenMirrors(html: string): string[] {
  try {
    const $ = load(html);
    const mirrors: string[] = [];

    $('a:has(h2:contains("GET"))').each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        mirrors.push(href);
      }
    });

    return mirrors;
  } catch (_err) {
    throw createParseError("Failed to parse download page");
  }
}
