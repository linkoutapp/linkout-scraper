const test = require("node:test");
const assert = require("node:assert/strict");

const salesNavScraper = require("../../lib/linkedin/linkedin.sales.nav.scraper");
const {
  FILTER_DEFINITIONS,
  normalizeSalesRows,
} = require("../../lib/linkedin/linkedin.sales.nav.scraper");

function element() {
  return {
    async boundingBox() {
      return { x: 0, y: 0, width: 20, height: 10 };
    },
  };
}

function salesPage(rows = []) {
  const calls = [];
  const matches = {
    'fieldset[title="Current job title"]': element(),
    'fieldset[title="Current job title"] button[aria-expanded="false"]': element(),
    'input[placeholder="Add current titles"]': element(),
    '[role="option"][aria-label*="Include"]': element(),
    'main ol[role="list"]': element(),
    'main li[data-x-search-result]': element(),
  };
  const page = {
    calls,
    currentUrl: "https://www.linkedin.com/feed/",
    frames: () => [],
    url() {
      return page.currentUrl;
    },
    async goto(url) {
      page.currentUrl = url;
      calls.push(["goto", url]);
    },
    async $(selector) {
      calls.push(["query", selector]);
      return matches[selector] || null;
    },
    async $$eval(selector) {
      calls.push(["extract", selector]);
      return rows;
    },
    async evaluate() {
      return {
        text: "Sales Navigator",
        hasAuthenticatedUi: true,
        unexpectedModal: false,
      };
    },
    async focus(selector) {
      calls.push(["focus", selector]);
    },
    keyboard: {
      async type(character) {
        calls.push(["type", character]);
      },
    },
    cursor: {
      async click(target) {
        calls.push(["click", target]);
      },
    },
  };
  return page;
}

function policy() {
  const calls = [];
  return {
    calls,
    async begin(input) {
      calls.push(["begin", input.operation, input.confirm]);
      if (!input.confirm) {
        const error = new Error("confirmation required");
        error.code = "CONFIRMATION_REQUIRED";
        throw error;
      }
      return {
        async complete() {
          calls.push(["complete"]);
        },
        async reject(code) {
          calls.push(["reject", code]);
        },
      };
    },
  };
}

test("Sales Navigator defines every supported 2026 filter", () => {
  assert.deepEqual(Object.keys(FILTER_DEFINITIONS).sort(), [
    "currentTitle",
    "geography",
    "headcount",
    "industry",
  ]);
});

test("normalizeSalesRows canonicalizes and bounds lead records", () => {
  const rows = normalizeSalesRows(
    [
      {
        name: " Ada Lovelace ",
        title: " Engineer ",
        url: "https://www.linkedin.com/sales/lead/abc?tracking=secret",
        company: " Analytical Engines ",
        location: " London ",
        jobTitle: " CTO ",
      },
      { name: "Ignored overflow" },
    ],
    1
  );
  assert.deepEqual(rows, [
    {
      name: "Ada Lovelace",
      title: "Engineer",
      url: "https://www.linkedin.com/sales/lead/abc",
      company: "Analytical Engines",
      location: "London",
      jobTitle: "CTO",
    },
  ]);
});

test("filter submission requires confirmation and never clicks when rejected", async () => {
  const page = salesPage();
  const actionPolicy = policy();
  await assert.rejects(
    salesNavScraper(page, { actionPolicy }, {
      leadType: "people",
      filterParams: { currentTitle: ["Engineer"] },
      count: 1,
      timeout: 0,
      clickDelay: 0,
    }),
    (error) => error.code === "CONFIRMATION_REQUIRED"
  );
  assert.equal(page.calls.some(([name]) => name === "click"), false);
});

test("current title filter uses semantic controls and result extraction", async () => {
  const page = salesPage([
    {
      name: "Ada Lovelace",
      title: "Engineer",
      url: "https://www.linkedin.com/sales/lead/abc",
      company: "Analytical Engines",
      location: "London",
      jobTitle: "CTO",
    },
  ]);
  const actionPolicy = policy();
  const result = await salesNavScraper(page, { actionPolicy }, {
    leadType: "people",
    filterParams: { currentTitle: ["Engineer"] },
    confirm: true,
    count: 1,
    timeout: 0,
    clickDelay: 0,
    minDelay: 0,
    maxDelay: 0,
  });

  assert.equal(result.length, 1);
  assert.equal(
    page.calls.filter(([name]) => name === "type").map(([, value]) => value).join(""),
    "Engineer"
  );
  assert.equal(page.calls.filter(([name]) => name === "click").length, 2);
  assert.deepEqual(actionPolicy.calls.at(-1), ["complete"]);
});

test("read-only result collection uses bounded direct pagination", async () => {
  const page = salesPage(
    Array.from({ length: 25 }, (_, index) => ({
      name: `Lead ${index}`,
      url: `https://www.linkedin.com/sales/lead/${index}`,
    }))
  );
  const result = await salesNavScraper(page, null, {
    leadType: "people",
    filterParams: {},
    count: 30,
    timeout: 0,
  });

  assert.equal(result.length, 30);
  assert.equal(page.calls.filter(([name]) => name === "goto").length, 2);
  assert.equal(page.calls.some(([name]) => name === "click"), false);
});
