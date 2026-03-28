import { describe, expect, it } from "vitest";

import { categoryToRoute } from "@/lib/categoryToRoute";

describe("categoryToRoute", () => {
  it("returns known category routes", () => {
    expect(categoryToRoute("Джинсы")).toBe("/jeans");
    expect(categoryToRoute("Платья")).toBe("/dresses");
  });

  it("falls back to tops for unknown categories", () => {
    expect(categoryToRoute("Неизвестно")).toBe("/tops");
  });
});
