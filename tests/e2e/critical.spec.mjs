import { expect, test } from "./test.mjs";

test("accessible navigation supports direct URL, refresh, and browser Back", async ({
  page,
}) => {
  await page.goto("/items");
  await expect(
    page.getByRole("heading", { name: "Inventory E2E fixture" }),
  ).toBeVisible();
  await expect(page.locator("#location")).toHaveText("Items");
  await page.reload();
  await expect(page.locator("#location")).toHaveText("Items");
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.goBack();
  await expect(page).toHaveURL(/\/items$/);
  await expect(page.locator("#location")).toHaveText("Items");
});

test("push and replace preserve the intended history semantics", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Push route" }).click();
  await expect(page).toHaveURL(/\/items\?created=1$/);
  await page.getByRole("button", { name: "Replace route" }).click();
  await expect(page).toHaveURL(/\/items\?edited=1$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("user-visible status is announced through an accessible live region", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Announce" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved");
});
