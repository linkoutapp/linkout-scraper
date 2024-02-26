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

async function extractDataFromLeads(page) {
  const data = await page.evaluate(async () => {
    let elements = document.querySelectorAll(".artdeco-list__item.pl3.pv3");
    let dataList = [];

    elements.forEach(function (element) {
      console.log(element, element.querySelector("[data-anonymize='person-name']"), element.querySelector("[data-anonymize='title']"), element.querySelector("[data-anonymize='company-name']"), element.querySelector("[data-anonymize='location']"), element.querySelector("[data-anonymize='job-title']"));

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
      let companyElement = element.querySelector("[data-anonymize='company-name']");
      if (companyElement) {
        company = companyElement.innerText.trim();
      }
      let locationElement = element.querySelector("[data-anonymize='location']");
      if (locationElement) {
        location = locationElement.innerText.trim();
      }
      let jobTitleElement = element.querySelector("[data-anonymize='job-title']");
      if (jobTitleElement) {
        jobTitle = jobTitleElement.innerText.trim();
      }

      let data = {
        name: name,
        title: title,
        url: url,
        company: company,
        location: location,
        jobTitle: jobTitle
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
      let company_nameElement = element.querySelector("[data-anonymize='company-name']");
      let company_name = "";
      let url = "";
      let industryElement = element.querySelector("[data-anonymize='industry']");
      let industry = "";
      let sizeElement = element.querySelector("[data-anonymize='company-size']");
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
        size: size
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
  const { url, count = 25 } = data;

  await page.goto(url);

  if (page.url().includes("linkedin.com/sales")) {
    try {
      const final = [];
      const url = page.url();
      let concatenatedUrl = url;
      let result = [];
      for (let i = 0; i < Math.ceil(count / 25); i++) {
        if (i > 0) {
          let pageId = "page=" + (i + 1) + "&";
          if (url.indexOf("?") !== -1) {
            concatenatedUrl = url.substring(0, url.indexOf("?") + 1) + pageId + url.substring(url.indexOf("?") + 1);
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

      console.log(final);
      return final;
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
}

module.exports = salesNavScraper;