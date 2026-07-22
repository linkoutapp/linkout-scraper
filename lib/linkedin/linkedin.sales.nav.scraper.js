const LinkoutError = require("../errors/linkout-error");
const selectors = require("../selectors/sales-navigator");
const {
  clickAction,
  getActionPolicy,
  resolveAction,
  typeAction,
} = require("./mutation-runtime");

const FILTER_DEFINITIONS = Object.freeze({
  currentTitle: Object.freeze({
    root: selectors.filters.currentTitle,
    toggle: selectors.filters.currentTitleToggle,
    input: selectors.filters.currentTitleInput,
  }),
  geography: Object.freeze({
    root: selectors.filters.geography,
    toggle: selectors.filters.geographyToggle,
    input: selectors.filters.geographyInput,
  }),
  industry: Object.freeze({
    root: selectors.filters.industry,
    toggle: selectors.filters.industryToggle,
    input: selectors.filters.industryInput,
  }),
  headcount: Object.freeze({
    root: selectors.filters.headcount,
    toggle: selectors.filters.headcountToggle,
  }),
});

function clean(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function canonicalSalesUrl(value) {
  try {
    const url = new URL(String(value || ""), "https://www.linkedin.com");
    if (
      url.hostname !== "www.linkedin.com" ||
      !url.pathname.startsWith("/sales/")
    ) {
      return "";
    }
    return `${url.origin}${url.pathname}`;
  } catch (_) {
    return "";
  }
}

function normalizeSalesRows(rows, count = 25) {
  const maximum = Math.max(0, Math.min(Number(count) || 0, 100));
  return (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      ...(row.name !== undefined ? { name: clean(row.name) } : {}),
      ...(row.title !== undefined ? { title: clean(row.title) } : {}),
      url: canonicalSalesUrl(row.url),
      ...(row.company !== undefined ? { company: clean(row.company) } : {}),
      ...(row.location !== undefined ? { location: clean(row.location) } : {}),
      ...(row.jobTitle !== undefined ? { jobTitle: clean(row.jobTitle) } : {}),
      ...(row.company_name !== undefined
        ? { company_name: clean(row.company_name) }
        : {}),
      ...(row.industry !== undefined ? { industry: clean(row.industry) } : {}),
      ...(row.size !== undefined ? { size: clean(row.size) } : {}),
    }))
    .filter((row) => Object.values(row).some(Boolean))
    .slice(0, maximum);
}

function hasFilters(filterParams = {}) {
  return Object.values(filterParams).some(
    (values) => Array.isArray(values) && values.length > 0
  );
}

function headcountCandidates(value) {
  const label = clean(value);
  if (!/^[0-9,+\-]+$/.test(label)) {
    throw new LinkoutError("INVALID_FILTER", "Unsupported company headcount filter");
  }
  return [
    `fieldset[title="Company headcount"] [role="option"][aria-label*="${label}"]`,
    `fieldset[title="Company headcount"] li[aria-label*="${label}"]`,
  ];
}

async function applyFilter(page, name, values, data) {
  if (!Array.isArray(values) || values.length === 0) return;
  const definition = FILTER_DEFINITIONS[name];
  if (!definition) throw new LinkoutError("INVALID_FILTER", `Unsupported filter: ${name}`);

  await resolveAction(page, "salesNavigator", `${name}.root`, definition.root, data);
  try {
    await clickAction(page, "salesNavigator", `${name}.toggle`, definition.toggle, data);
  } catch (error) {
    if (error.code !== "SELECTOR_NOT_FOUND") throw error;
    // An absent collapsed toggle means the filter is already expanded.
  }

  if (name === "headcount") {
    for (const value of values) {
      await clickAction(
        page,
        "salesNavigator",
        "headcount.option",
        headcountCandidates(value),
        data
      );
    }
    return;
  }

  for (const value of values) {
    await typeAction(
      page,
      "salesNavigator",
      `${name}.input`,
      definition.input,
      clean(value),
      data
    );
    await clickAction(
      page,
      "salesNavigator",
      `${name}.suggestion`,
      selectors.filters.suggestion,
      data
    );
  }
}

async function applyFilters(page, filterParams, data) {
  for (const name of Object.keys(FILTER_DEFINITIONS)) {
    await applyFilter(page, name, filterParams[name], data);
  }
}

async function extractRows(page, leadType, data) {
  const resolved = await resolveAction(
    page,
    "salesNavigator",
    "results.item",
    selectors.results.item,
    data
  );
  return resolved.context.$$eval(resolved.selector, (items, type) => {
    const text = (element) =>
      String((element && element.textContent) || "").trim().replace(/\s+/g, " ");
    const href = (element) =>
      String((element && (element.href || element.getAttribute("href"))) || "");

    return items.map((item) => {
      if (type === "people") {
        const name = item.querySelector('[data-anonymize="person-name"]');
        return {
          name: text(name),
          title: text(item.querySelector('[data-anonymize="title"]')),
          url: href(name && name.closest("a")),
          company: text(item.querySelector('[data-anonymize="company-name"]')),
          location: text(item.querySelector('[data-anonymize="location"]')),
          jobTitle: text(item.querySelector('[data-anonymize="job-title"]')),
        };
      }
      const company = item.querySelector('[data-anonymize="company-name"]');
      return {
        company_name: text(company),
        url: href(company && company.closest("a")),
        industry: text(item.querySelector('[data-anonymize="industry"]')),
        size: text(item.querySelector('[data-anonymize="company-size"]')),
      };
    });
  }, leadType);
}

function pageUrl(base, pageNumber) {
  const url = new URL(base);
  url.searchParams.set("page", String(pageNumber));
  return url.href;
}

async function salesNavScraper(page, cdp, data = {}) {
  const leadType = String(data.leadType || "people").toLowerCase().includes("people")
    ? "people"
    : "company";
  const count = Math.max(0, Math.min(Number(data.count) || 25, 100));
  const filterParams = data.filterParams || {};
  const initialUrl = `https://www.linkedin.com/sales/search/${leadType}?viewAllFilters=true`;
  await page.goto(initialUrl);

  let transaction;
  if (hasFilters(filterParams)) {
    transaction = await getActionPolicy(cdp, data).begin({
      operation: "salesNavigatorFilter",
      target: initialUrl,
      confirm: data.confirm === true,
      page,
    });
    try {
      await applyFilters(page, filterParams, data);
      await resolveAction(
        page,
        "salesNavigator",
        "results.list",
        selectors.results.list,
        data
      );
      await transaction.complete();
    } catch (error) {
      await transaction.reject(error.code || "SALES_FILTER_FAILED");
      throw error;
    }
  }

  const collected = [];
  const pages = Math.ceil(count / 25);
  const resultBase = page.url();
  for (let index = 0; index < pages; index += 1) {
    if (index > 0) await page.goto(pageUrl(resultBase, index + 1));
    const rows = await extractRows(page, leadType, data);
    collected.push(...rows);
  }
  return normalizeSalesRows(collected, count);
}

module.exports = salesNavScraper;
module.exports.FILTER_DEFINITIONS = FILTER_DEFINITIONS;
module.exports.applyFilter = applyFilter;
module.exports.canonicalSalesUrl = canonicalSalesUrl;
module.exports.extractRows = extractRows;
module.exports.normalizeSalesRows = normalizeSalesRows;
