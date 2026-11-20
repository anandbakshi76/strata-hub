import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const doc = new JSDOM(html).window.document;
const text = (doc.body.textContent ?? "").replace(/\s+/g, " ");

describe("page structure (SPEC 5 and 8)", () => {
  it("has the sections in the SPEC 5 order", () => {
    const order = [
      "top",
      "inside",
      "lights",
      "climate",
      "security",
      "energy",
      "reassemble",
      "bundles",
      "register",
      "faq",
    ];
    const ids = [...doc.querySelectorAll("main [id]")]
      .map((el) => el.id)
      .filter((id) => order.includes(id));
    expect(ids).toEqual(order);
    expect(doc.querySelector("footer")).not.toBeNull();
  });

  it("has one h1 and no skipped heading levels", () => {
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    const levels = [...doc.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
      Number(h.tagName[1]),
    );
    levels.forEach((level, i) => {
      if (i > 0) expect(level - (levels[i - 1] ?? 1)).toBeLessThanOrEqual(1);
    });
  });

  it("has a header with links to Modules, Bundles, FAQ and the Register interest button", () => {
    const links = [...doc.querySelectorAll("header a")].map((a) => [
      a.textContent?.trim(),
      a.getAttribute("href"),
    ]);
    expect(links).toEqual(
      expect.arrayContaining([
        ["Modules", "#inside"],
        ["Bundles", "#bundles"],
        ["FAQ", "#faq"],
        ["Register interest", "#register"],
      ]),
    );
  });
});

describe("content matches content.ts", async () => {
  const { content } = await import("./content");

  it("shows every module's name, story and 3 specs (SPEC 4.3)", () => {
    expect(content.modules.map((m) => m.id)).toEqual(["lights", "climate", "security", "energy"]);
    for (const m of content.modules) {
      expect(text).toContain(m.name);
      expect(text).toContain(m.story);
      expect(m.story.split(/\s+/).length).toBeLessThanOrEqual(40);
      expect(m.specs).toHaveLength(3);
      for (const s of m.specs) {
        expect(text).toContain(s.label);
        expect(text).toContain(s.value);
      }
    }
  });

  it("shows the three bundles with their prices and modules (SPEC 4.4, A6)", () => {
    expect(content.bundles.map((b) => [b.name, b.price])).toEqual([
      ["Starter", "$199"],
      ["Home", "$349"],
      ["Complete", "$499"],
    ]);
    const cards = [...doc.querySelectorAll("#bundles article")];
    expect(cards).toHaveLength(3);
    content.bundles.forEach((b, i) => {
      const card = cards[i]?.textContent ?? "";
      expect(card).toContain(b.name);
      expect(card).toContain(b.price);
      for (const m of content.modules) {
        const state = b.includes.includes(m.id) ? "included" : "not included";
        expect(card).toContain(`${m.name}: ${state}`);
      }
    });
  });

  it("says every bundle includes the hub, on the page and in CONTENT.md (review S2, rule 7)", () => {
    expect(content.bundlesNote).toBe("Every bundle includes the hub.");
    expect(doc.querySelector("#bundles")?.textContent).toContain(content.bundlesNote);
    const approved = readFileSync(new URL("../docs/CONTENT.md", import.meta.url), "utf8");
    expect(approved).toContain(content.bundlesNote);
  });

  it("shows the six FAQ questions and answers (SPEC 4.6, A8)", () => {
    expect(content.faq).toHaveLength(6);
    expect(doc.querySelectorAll("#faq details")).toHaveLength(6);
    for (const q of content.faq) {
      expect(text).toContain(q.question);
      expect(text).toContain(q.answer);
    }
  });

  it("shows the hero, reassemble line, privacy note and fictional-product note", () => {
    expect(doc.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      content.hero.headline,
    );
    expect(text).toContain(content.hero.lede);
    expect(text).toContain(content.reassemble);
    expect(text).toContain(content.privacy);
    expect(doc.querySelector("footer")?.textContent).toContain(content.footer);
  });

  it("is approved by the person, in content.ts and CONTENT.md (rule 7)", () => {
    expect(content.status).toBe("approved");
    const doc = readFileSync(new URL("../docs/CONTENT.md", import.meta.url), "utf8");
    expect(doc).toMatch(/^Status: Approved by .+ on .+\./m);
    // The page must show only the words the person approved: every string is still in CONTENT.md.
    const strings = [
      content.hero.headline,
      content.hero.lede,
      content.reassemble,
      content.privacy,
      content.footer,
      ...content.modules.flatMap((m) => [
        m.name,
        m.story,
        ...m.specs.flatMap((s) => [s.label, s.value]),
      ]),
      ...content.bundles.map((b) => b.price),
      ...content.faq.flatMap((q) => [q.question, q.answer]),
    ];
    for (const s of strings) expect(doc).toContain(s);
  });
});

describe("register-interest form (SPEC 6, rule 3)", () => {
  const form = doc.querySelector("#register form");

  it("has exactly three fields: email, module of interest and consent", () => {
    const fields = [...(form?.querySelectorAll("input, select, textarea") ?? [])].map(
      (f) => `${f.tagName.toLowerCase()}:${f.getAttribute("type") ?? ""}:${f.getAttribute("name")}`,
    );
    expect(fields).toEqual(["input:email:email", "select::module", "input:checkbox:consent"]);
  });

  it("gives every field a visible label", () => {
    for (const f of form?.querySelectorAll("input, select") ?? []) {
      const label = doc.querySelector(`label[for="${f.id}"]`);
      expect(label?.textContent?.trim()).toBeTruthy();
    }
  });

  it("offers the five module choices", () => {
    const options = [...(form?.querySelectorAll("option") ?? [])].map((o) => o.textContent?.trim());
    expect(options).toEqual(["Not sure yet", "Lights", "Climate", "Security", "Energy"]);
  });

  it("says what to do when JavaScript is off (SPEC 9)", () => {
    expect(form?.innerHTML).toContain("Turn on JavaScript to register interest.");
  });
});
