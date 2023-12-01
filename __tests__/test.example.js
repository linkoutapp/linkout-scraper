const Linkout = require("../lib/linkedin.service");
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  const cdp = await page.target().createCDPSession();

  await page.setViewport({
    width: 1440,
    height: 900,
  });

  // add ghost-cursor for maximum safety
  await Linkout.tools.loadCursor(page, false);

  await Linkout.services.login(page, cdp, {
    cookie: LI_AT,
  });

  await Linkout.services.connect(page, cdp, {
    message: "Hello {{firstName}}, let's connect!",
    url: "https://www.linkedin.com/in/sai-adarsh/",
  });

  await Linkout.services.message(page, cdp, {
    message: "Hey, {{firstName}}!",
    url: "https://www.linkedin.com/in/sai-adarsh/",
  });

  await Linkout.services.visit(page, cdp, {
    url: "https://www.linkedin.com/in/sai-adarsh/",
  });

  const acceptedConnectionsList = await Linkout.services.acceptedConnections(
    page,
    cdp
  );

  console.log(acceptedConnectionsList);

  await Linkout.services.like(page, cdp, {
    url: "https://www.linkedin.com/in/sai-adarsh/",
  });

  await Linkout.services.endorse(page, cdp, {
    url: "https://www.linkedin.com/in/sai-adarsh/",
  });

  // Close the browser
  await browser.close();
})();
