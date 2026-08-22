import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  Link,
  RouterProvider,
  useNavigate,
} from "react-router";
import { describe, expect, test } from "vitest";

function Inventory() {
  return (
    <main>
      <h1>Inventory</h1>
      <Link to="/items/item-1/edit">Edit item</Link>
    </main>
  );
}

function EditItem() {
  const navigate = useNavigate();

  return (
    <main>
      <h1>Edit item</h1>
      <button
        type="button"
        onClick={() => {
          void navigate("/items/item-1", { replace: true });
        }}
      >
        Save item
      </button>
    </main>
  );
}

function ItemDetail() {
  const navigate = useNavigate();

  return (
    <main>
      <h1>Item detail</h1>
      <button
        type="button"
        onClick={() => {
          void navigate(-1);
        }}
      >
        Go back
      </button>
    </main>
  );
}

const routes = [
  { path: "/inventory", element: <Inventory /> },
  { path: "/items/:itemId", element: <ItemDetail /> },
  { path: "/items/:itemId/edit", element: <EditItem /> },
];

describe("router integration foundation", () => {
  test("renders a stable direct entry", async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/items/item-1"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", { name: "Item detail" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/items/item-1");
  });

  test("supports push, replace, and Back semantics", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, {
      initialEntries: ["/inventory"],
    });
    render(<RouterProvider router={router} />);

    await user.click(await screen.findByRole("link", { name: "Edit item" }));
    expect(
      await screen.findByRole("heading", { name: "Edit item" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save item" }));
    expect(
      await screen.findByRole("heading", { name: "Item detail" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go back" }));
    expect(
      await screen.findByRole("heading", { name: "Inventory" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/inventory");
  });
});
