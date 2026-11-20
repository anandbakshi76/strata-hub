import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Review finding S3: colours come from tokens.css only.
describe("stylesheets", () => {
  it("site.css and base.css use tokens, with no raw colour values", () => {
    for (const file of ["./styles/site.css", "./styles/base.css"]) {
      const css = readFileSync(new URL(file, import.meta.url), "utf8").replace(
        /\/\*[\s\S]*?\*\//g,
        "",
      );
      expect(css.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi) ?? [], file).toEqual([]);
    }
  });
});
