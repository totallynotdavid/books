import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseGetPhpUrl, parseIpfsUrl } from "../src/parsers/download.ts";

const fixture = (name: string) =>
  readFileSync(join(import.meta.dir, "fixtures", name), "utf8");
const md5 = "840e6f0826109b93b4355dadd04240ee";
const adsUrl = `https://libgen.li/ads.php?md5=${md5}`;

describe("parseIpfsUrl", () => {
  it("extracts the IPFS.io gateway link from a real file.php page", () => {
    const url = parseIpfsUrl(fixture("libgen-file.html"));
    expect(url).toStartWith("https://gateway.ipfs.io/ipfs/");
    expect(url).toContain("?filename=");
  });

  it("ignores other gateways", () => {
    const html =
      '<a title="IPFS cloudflare" href="https://cloudflare-ipfs.com/x">IPFS</a>';
    expect(parseIpfsUrl(html)).toBe(null);
  });

  it("returns null when there is no link", () => {
    expect(parseIpfsUrl("")).toBe(null);
  });
});

describe("parseGetPhpUrl", () => {
  it("extracts the keyed link from a real ads.php page", () => {
    expect(parseGetPhpUrl(fixture("libgen-ads.html"), adsUrl)).toBe(
      `https://libgen.li/get.php?md5=${md5}&key=LI8TUYAH2UR418AT`,
    );
  });

  it("decodes &amp; in the href", () => {
    const html = '<a href="get.php?md5=abc&amp;key=K1">GET</a>';
    expect(parseGetPhpUrl(html, adsUrl)).toBe(
      "https://libgen.li/get.php?md5=abc&key=K1",
    );
  });

  it("resolves root-relative and absolute links", () => {
    expect(parseGetPhpUrl('<a href="/get.php?md5=a&key=K">', adsUrl)).toBe(
      "https://libgen.li/get.php?md5=a&key=K",
    );
    expect(
      parseGetPhpUrl('<a href="https://cdn.example/get.php?md5=a&key=K">', adsUrl),
    ).toBe("https://cdn.example/get.php?md5=a&key=K");
  });

  it("returns null when there is no link", () => {
    expect(parseGetPhpUrl("<div>No link</div>", adsUrl)).toBe(null);
  });
});
