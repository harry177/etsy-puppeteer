import fs from "fs";
import puppeteer from "puppeteer";

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

  // Starting the product search process
  const products = await page.evaluate(() => {
    const productElements = Array.from(
      document.querySelectorAll(".v2-listing-card")
    );

    // Array for storing products info
    const products = [];

    for (let i = 0; i < 10 && i < productElements.length; i++) {
      const productElement = productElements[i];
      const titleElement = productElement.querySelector(
        ".v2-listing-card__title"
      );
      const symbolElement = productElement.querySelector(".currency-symbol");
      const priceElement = productElement.querySelector(
        ".currency-symbol + .currency-value"
      );
      const linkElement = productElement.querySelector(".listing-link");

      // Extraction of title, price and product URL
      const title = titleElement
        ? titleElement.textContent && titleElement.textContent.trim()
        : "";
      const price = priceElement
        ? priceElement.textContent &&
          priceElement.textContent.trim() + " " + symbolElement?.textContent
        : "";
      const link =
        linkElement instanceof HTMLAnchorElement ? linkElement.href : "";

      products.push({ title, price, link });
    }

    return products;
  });

  console.log(products);

  // Writing the result to a JSON file
  fs.writeFileSync("result.json", JSON.stringify(products));

  await browser.close();
})();
