import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test } from "vitest";

function QuantityControl() {
  const [quantity, setQuantity] = useState(1);

  return (
    <section aria-labelledby="quantity-heading">
      <h1 id="quantity-heading">Quantity</h1>
      <output aria-live="polite">{quantity}</output>
      <button
        type="button"
        onClick={() => setQuantity((current) => current + 1)}
      >
        Increase quantity
      </button>
    </section>
  );
}

describe("component integration foundation", () => {
  test("drives an accessible component through a user interaction", async () => {
    const user = userEvent.setup();
    render(<QuantityControl />);

    const increase = screen.getByRole("button", { name: "Increase quantity" });
    expect(
      screen.getByRole("heading", { name: "Quantity" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    await user.click(increase);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(increase).toHaveFocus();
  });
});
