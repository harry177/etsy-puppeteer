import puppeteer from "puppeteer";

async function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Limit requests
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    if (request.resourceType() == "image") {
      await request.abort();
    } else {
      await request.continue();
    }
  });

  await page.goto("https://www.etsy.com/", {
    waitUntil: "networkidle0",
  });
  await timeout(2000);
  await page.screenshot({ path: "example.png" });
  await browser.close();
})();
