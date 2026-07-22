module.exports = Object.freeze({
  root: ['main', '[role="main"]', '#search-results-container'],
  filters: Object.freeze({
    currentTitle: [
      'fieldset[title="Current job title"]',
      'fieldset[aria-label="Current job title"]',
    ],
    geography: [
      'fieldset[title="Geography"]',
      'fieldset[aria-label="Geography"]',
    ],
    industry: [
      'fieldset[title="Industry"]',
      'fieldset[aria-label="Industry"]',
    ],
    headcount: [
      'fieldset[title="Company headcount"]',
      'fieldset[aria-label="Company headcount"]',
    ],
    currentTitleInput: [
      'input[placeholder="Add current titles"]',
      'input[aria-label*="current titles"]',
    ],
    currentTitleToggle: [
      'fieldset[title="Current job title"] button[aria-expanded="false"]',
      'fieldset[aria-label="Current job title"] button[aria-expanded="false"]',
    ],
    geographyInput: [
      'input[placeholder="Add locations"]',
      'input[aria-label*="locations"]',
    ],
    geographyToggle: [
      'fieldset[title="Geography"] button[aria-expanded="false"]',
      'fieldset[aria-label="Geography"] button[aria-expanded="false"]',
    ],
    industryInput: [
      'input[placeholder="Add industries"]',
      'input[aria-label*="industries"]',
    ],
    industryToggle: [
      'fieldset[title="Industry"] button[aria-expanded="false"]',
      'fieldset[aria-label="Industry"] button[aria-expanded="false"]',
    ],
    headcountToggle: [
      'fieldset[title="Company headcount"] button[aria-expanded="false"]',
      'fieldset[aria-label="Company headcount"] button[aria-expanded="false"]',
    ],
    suggestion: [
      '[role="option"][aria-label*="Include"]',
      'div[title*="Include"]',
    ],
  }),
  results: Object.freeze({
    list: ['main ol[role="list"]', '[role="main"] ol', '.artdeco-list'],
    item: [
      'main li[data-x-search-result]',
      '[role="main"] li:has(a[href*="/sales/lead/"])',
      '.artdeco-list__item.pl3.pv3',
    ],
    personName: [
      '[data-anonymize="person-name"]',
      'a[href*="/sales/lead/"] span[aria-hidden="true"]',
    ],
    title: ['[data-anonymize="title"]', '[data-anonymize="job-title"]'],
    company: ['[data-anonymize="company-name"]', 'a[href*="/sales/company/"]'],
    location: ['[data-anonymize="location"]', '[data-field="location"]'],
    next: [
      'button[aria-label="Next"]:not(:disabled)',
      'button[aria-label*="next page"]:not(:disabled)',
    ],
  }),
});
