import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders the brand and newsletter call to action", () => {
    render(<Footer />);

    expect(screen.getByText("TERRASSE")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Подписаться" }),
    ).toBeInTheDocument();
  });
});
