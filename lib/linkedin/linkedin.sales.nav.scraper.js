const { timer } = require("./linkedin.common.service");

async function executeScrollDown(page) {
  for (let i = 0; i < 10; i++) {
    await page.keyboard.down("AltLeft");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.up("AltLeft");
    await timer(1000);
  }
}

async function executeScrollUp(page) {
  for (let i = 0; i < 10; i++) {
    await page.keyboard.down("AltLeft");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.up("AltLeft");
    await timer(1000);
  }
}

async function applyCurrentTitle(page, cdp, currentTitle) {
  await page.waitForSelector("fieldset[title='Current job title']");

  const ariaExpanded = await page.evaluate(() => {
    return document.querySelector(
      "fieldset[title='Current job title'] .artdeco-button"
    ).ariaExpanded;
  });

  if (ariaExpanded === "false") {
    await page.cursor.click(
      "fieldset[title='Current job title'] .artdeco-button"
    );
  }

  await page.waitForSelector('input[placeholder="Add current titles"]');

  await page.focus('input[placeholder="Add current titles"]');

  for (const each of currentTitle) {
    await (
      await page.$('input[placeholder="Add current titles"]')
    ).type(each, {
      delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50),
    });

    try {
      await page.waitForSelector('div[title*="Include"]');

      await page.cursor.click('div[title*="Include"]');
    } catch (e) {
      //
    }
    await page.waitForSelector(".artdeco-list");
  }

  await page.waitForSelector(".artdeco-list");
}

async function applyGeography(page, cdp, geography) {
  await page.waitForSelector("fieldset[title='Geography']");

  const ariaExpanded = await page.evaluate(() => {
    return document.querySelector("fieldset[title='Geography'] .artdeco-button")
      .ariaExpanded;
  });

  if (ariaExpanded === "false") {
    await page.cursor.click("fieldset[title='Geography'] .artdeco-button");
  }

  await page.waitForSelector('input[placeholder="Add locations"]');

  await page.focus('input[placeholder="Add locations"]');

  for (const each of geography) {
    await (
      await page.$('input[placeholder="Add locations"]')
    ).type(each, {
      delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50),
    });

    try {
      await page.waitForSelector('div[title*="Include"]');

      await page.cursor.click('div[title*="Include"]');
    } catch (e) {
      //
    }

    await page.waitForSelector(".artdeco-list");
  }

  await page.waitForSelector(".artdeco-list");
}

async function applyIndustry(page, cdp, industry) {
  await page.waitForSelector("fieldset[title='Industry']");

  const ariaExpanded = await page.evaluate(() => {
    return document.querySelector("fieldset[title='Industry'] .artdeco-button")
      .ariaExpanded;
  });

  if (ariaExpanded === "false") {
    await page.cursor.click("fieldset[title='Industry'] .artdeco-button");
  }

  await page.waitForSelector('input[placeholder="Add industries"]');

  await page.focus('input[placeholder="Add industries"]');

  for (const each of industry) {
    await (
      await page.$('input[placeholder="Add industries"]')
    ).type(each, {
      delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50),
    });

    try {
      await page.waitForSelector('div[title*="Include"]');

      await page.cursor.click('div[title*="Include"]');
    } catch (e) {
      //
    }

    await page.waitForSelector(".artdeco-list");
  }

  await page.waitForSelector(".artdeco-list");
}

async function applyHeadCount(page, cdp, headcount) {
  await page.waitForSelector("fieldset[title='Company headcount']");

  const ariaExpanded = await page.evaluate(() => {
    return document.querySelector(
      "fieldset[title='Company headcount'] .artdeco-button"
    ).ariaExpanded;
  });

  if (ariaExpanded === "false") {
    await page.cursor.click(
      "fieldset[title='Company headcount'] .artdeco-button"
    );
  }

  await page.waitForSelector("fieldset[title='Company headcount'] li div");

  for (const each of headcount) {
    if (each.includes("1-10")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='1-10'] div"
      );
    } else if (each.includes("11-50")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='11-50'] div"
      );
    } else if (each.includes("201-500")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='201-500'] div"
      );
    } else if (each.includes("501-1000")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='501-1000'] div"
      );
    } else if (each.includes("1001-5000")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='1001-5000'] div"
      );
    } else if (each.includes("5001-10000")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='5001-10000'] div"
      );
    } else if (each.includes("10,000+")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='10,000+'] div"
      );
    }

    await page.waitForSelector(".artdeco-list");
  }

  await page.waitForSelector(".artdeco-list");
}

async function applyFilters(page, cdp, data) {
  const {
    headcount = [],
    currentTitle = [],
    geography = [],
    industry = [],
  } = data;

  if (headcount && headcount.length > 0) {
    await applyHeadCount(page, cdp, headcount);
  }

  if (currentTitle && currentTitle.length > 0) {
    await applyCurrentTitle(page, cdp, currentTitle);
  }

  await timer(1000);

  if (geography && geography.length > 0) {
    await applyGeography(page, cdp, geography);
  }

  await timer(1000);

  if (industry && industry.length > 0) {
    await applyIndustry(page, cdp, industry);
  }
}

async function extractDataFromLeads(page) {
  const data = await page.evaluate(async () => {
    let elements = document.querySelectorAll(".artdeco-list__item.pl3.pv3");
    let dataList = [];

    elements.forEach(function (element) {
      console.log(
        element,
        element.querySelector("[data-anonymize='person-name']"),
        element.querySelector("[data-anonymize='title']"),
        element.querySelector("[data-anonymize='company-name']"),
        element.querySelector("[data-anonymize='location']"),
        element.querySelector("[data-anonymize='job-title']")
      );

      let nameElement = element.querySelector("[data-anonymize='person-name']");
      let name = "";
      let url = "";
      let title = "";
      let company = "";
      let location = "";
      let jobTitle = "";

      if (nameElement) {
        name = nameElement.innerText.trim();
        url = nameElement.parentNode.href || "";
      }
      let titleElement = element.querySelector("[data-anonymize='title']");
      if (titleElement) {
        title = titleElement.innerText.trim();
      }
      let companyElement = element.querySelector(
        "[data-anonymize='company-name']"
      );
      if (companyElement) {
        company = companyElement.innerText.trim();
      }
      let locationElement = element.querySelector(
        "[data-anonymize='location']"
      );
      if (locationElement) {
        location = locationElement.innerText.trim();
      }
      let jobTitleElement = element.querySelector(
        "[data-anonymize='job-title']"
      );
      if (jobTitleElement) {
        jobTitle = jobTitleElement.innerText.trim();
      }

      let data = {
        name: name,
        title: title,
        url: url,
        company: company,
        location: location,
        jobTitle: jobTitle,
      };

      if (name || title || url || company || location || jobTitle) {
        dataList.push(data);
      }
    });

    return dataList;
  });

  return data;
}

async function extractDataFromAccounts(page) {
  const data = await page.evaluate(async () => {
    let elements = document.querySelectorAll(".artdeco-list__item.pl3.pv3");
    let dataList = [];

    elements.forEach(function (element) {
      let company_nameElement = element.querySelector(
        "[data-anonymize='company-name']"
      );
      let company_name = "";
      let url = "";
      let industryElement = element.querySelector(
        "[data-anonymize='industry']"
      );
      let industry = "";
      let sizeElement = element.querySelector(
        "[data-anonymize='company-size']"
      );
      let size = "";

      if (company_nameElement) {
        company_name = company_nameElement.innerText.trim();
        url = company_nameElement.href || "";
      }

      if (industryElement) {
        industry = industryElement.innerText.trim();
      }

      if (sizeElement) {
        size = sizeElement.innerText.trim();
      }

      let data = {
        company_name: company_name,
        url: url,
        industry: industry,
        size: size,
      };

      if (company_name || url || industry || size) {
        dataList.push(data);
      }
    });

    return dataList;
  });

  return data;
}

async function salesNavScraper(page, cdp, data) {
  const { leadType, filterParams, count = 25 } = data;

  if (leadType.includes("people")) {
    await page.goto(
      "https://www.linkedin.com/sales/search/people?viewAllFilters=true"
    );
  } else {
    await page.goto(
      "https://www.linkedin.com/sales/search/company?viewAllFilters=true"
    );
  }

  if (page.url().includes("linkedin.com/sales")) {
    try {
      await applyFilters(page, cdp, filterParams);

      const final = [];
      const url = page.url();
      let concatenatedUrl = url;
      let result = [];
      for (let i = 0; i < Math.ceil(count / 25); i++) {
        if (i > 0) {
          let pageId = "page=" + (i + 1) + "&";
          if (url.indexOf("?") !== -1) {
            concatenatedUrl =
              url.substring(0, url.indexOf("?") + 1) +
              pageId +
              url.substring(url.indexOf("?") + 1);
          }

          await page.goto(concatenatedUrl);
        }

        await timer(1000);

        try {
          await page.waitForSelector(".artdeco-list");
        } catch (e) {
          break;
        }

        if (url.includes("/search/people")) {
          try {
            await page.waitForSelector('[data-anonymize="job-title"]');
          } catch (e) {
            break;
          }

          await page.cursor.click('[data-anonymize="job-title"]');

          await executeScrollDown(page);

          await timer(1000);

          await executeScrollUp(page);

          result = await extractDataFromLeads(page);
        } else if (url.includes("/search/company")) {
          try {
            await page.waitForSelector(".ml8.pl1");
          } catch (e) {
            break;
          }

          await page.cursor.click(".ml8.pl1");

          await executeScrollDown(page);

          await timer(1000);

          await executeScrollUp(page);

          result = await extractDataFromAccounts(page);
        }

        final.push(...result);
      }

      return final;
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
}

module.exports = salesNavScraper;
