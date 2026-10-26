import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseNewsFeed } from "./news-feed.ts";

describe("parseNewsFeed", () => {
  it("decodes entities in titles and source links", () => {
    const headlines = parseNewsFeed(
      "<rss><item><title><![CDATA[Acme &amp; Co shares rise after strong earnings &#x1F4C8; - Daily News]]></title>" +
        "<link>https://example.test/story?a=1&amp;b=2</link>" +
        "<pubDate>Mon, 26 Oct 2026 10:00:00 GMT</pubDate></item></rss>",
    );

    assert.equal(headlines.length, 1);
    assert.equal(headlines[0]?.title, "Acme & Co shares rise after strong earnings 📈");
    assert.equal(headlines[0]?.publisher, "Daily News");
    assert.equal(headlines[0]?.url, "https://example.test/story?a=1&b=2");
    assert.equal(headlines[0]?.publishedAt, "2026-10-26T10:00:00.000Z");
  });

  it("retains a headline when its publication date is invalid", () => {
    const headlines = parseNewsFeed(
      "<item><title>Company shares rise</title><link>https://example.test/story</link>" +
        "<pubDate>not-a-date</pubDate></item>",
    );

    assert.equal(headlines.length, 1);
    assert.equal(headlines[0]?.publishedAt, null);
  });

  it("deduplicates titles case-insensitively and caps the feed at eight", () => {
    const items = [
      "<item><title>Company shares rise</title></item>",
      "<item><title>COMPANY SHARES RISE</title></item>",
      ...Array.from({ length: 9 }, (_, index) => `<item><title>Story ${index}</title></item>`),
    ].join("");

    const headlines = parseNewsFeed(items);

    assert.equal(headlines.length, 8);
    assert.equal(headlines[0]?.title, "Company shares rise");
  });

  it("ignores feed items without a title", () => {
    assert.deepEqual(parseNewsFeed("<item><link>https://example.test</link></item>"), []);
  });
});