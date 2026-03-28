import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("transliterates Cyrillic text into URL-friendly slugs", () => {
    expect(slugify("Платье из шерсти")).toBe("plate-iz-shersti");
  });

  it("trims repeated separators at the edges", () => {
    expect(slugify("  Новая коллекция!  ")).toBe("novaya-kollektsiya");
  });
});
