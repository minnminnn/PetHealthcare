import assert from "node:assert/strict";
import test from "node:test";

type HomepageDesignModule = typeof import("../lib/homepage-design");

async function loadDesign(): Promise<HomepageDesignModule | null> {
  try {
    return await import("../lib/homepage-design");
  } catch {
    return null;
  }
}

test("homepage design contract keeps the hero concise and the bento gapless", async () => {
  const design = await loadDesign();

  assert.ok(design, "homepage design model must exist");

  const { HOME_CONTENT, HOME_FEATURES, HOME_BENTO_LAYOUT } = design;
  const allVisibleCopy = [
    ...Object.values(HOME_CONTENT.vi),
    ...Object.values(HOME_CONTENT.en),
    ...HOME_FEATURES.flatMap((feature) => [
      feature.title.vi,
      feature.title.en,
      feature.description.vi,
      feature.description.en,
    ]),
  ].join(" ");

  assert.ok(HOME_CONTENT.vi.heroDescription.split(/\s+/).length <= 20);
  assert.ok(HOME_CONTENT.en.heroDescription.split(/\s+/).length <= 20);
  assert.equal(/[—–]/.test(allVisibleCopy), false);
  assert.equal(HOME_CONTENT.vi.primaryCta, HOME_CONTENT.vi.footerCta);
  assert.equal(HOME_CONTENT.en.primaryCta, HOME_CONTENT.en.footerCta);

  const occupiedUnits = HOME_BENTO_LAYOUT.reduce(
    (total, cell) => total + cell.columns * cell.rows,
    0,
  );
  assert.equal(occupiedUnits, 24);
  assert.equal(new Set(HOME_FEATURES.map((feature) => feature.accent)).size, 1);
});

test("scrolling story cards have unique ascending paint layers", async () => {
  const design = await loadDesign();

  assert.ok(design, "homepage design model must exist");

  const layers = (
    design as HomepageDesignModule & { HOME_STACK_LAYERS?: readonly number[] }
  ).HOME_STACK_LAYERS;

  assert.ok(layers, "stack layers must be defined");
  assert.equal(layers.length, design.HOME_FEATURES.length);
  assert.equal(new Set(layers).size, layers.length);
  assert.deepEqual([...layers], [...layers].sort((a, b) => a - b));
});
