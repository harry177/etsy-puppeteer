import fs from "fs";
import puppeteer from "puppeteer";

const starter = async () => {
  const browser = await puppeteer.launch({ headless: false });
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

  await page.goto("https://www.etsy.com/listing/1549220254", {
    timeout: 0,
    waitUntil: "domcontentloaded",
  });

  // Checking if it is a captcha page
  const iframes = await page.$$("body > iframe");
  // If yes - restart function
  if (iframes.length === 1) {
    await browser.close();
    starter();
  } else {
    // Getting the product title
    const targetTitle = await page.evaluate(() => {
      const cardContent = document.querySelector(".cart-col");
      const titleElement =
        cardContent && cardContent.querySelector(".wt-text-body-01");

      return titleElement?.textContent?.trim();
    });

    await page.click("[data-add-to-cart-button] > button");

    // Waiting for cart page loading
    await page.waitForNavigation();
    //await page.screenshot({ path: 'screen.jpg' })
    const location = page.url();

    // Checking of product is in cart and getting title from it
    if (location === "https://www.etsy.com/cart") {
      const cardTitle = await page.evaluate(() => {
        const titleElement = document.querySelector(
          "[data-listing-title-wrapper] > a"
        );

        return titleElement?.textContent?.trim();
      });

      const existingData = fs.existsSync("result.json")
        ? JSON.parse(fs.readFileSync("result.json", "utf8"))
        : { task3: "" }; // Create task3 property if it doesn't exist

      existingData.task3 = cardTitle;

      // Writing the result to a JSON file if titles from product page and cart page are matching
      if (targetTitle === cardTitle) {
        fs.writeFileSync("result.json", JSON.stringify(existingData));
        console.log(`${cardTitle} added to cart`);
      }
    }
    await browser.close();
  }
};
starter();
