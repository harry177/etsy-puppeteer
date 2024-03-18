import fs from "fs";
import puppeteer from "puppeteer";

interface ProductProps {
  title: string | null;
  price: string | null;
  description: string | null;
  params: string[];
  image: string;
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

  // Reading result.json
  const data = fs.readFileSync("result.json", "utf-8");
  const jsonData = JSON.parse(data);
  const tasks = jsonData.task1;

  const products: ProductProps[] = [];

  for (const task of tasks) {
    await page.goto(task.link, { timeout: 0, waitUntil: "domcontentloaded" });
    await page.waitForSelector(".cart-col");

    const content = await page.evaluate(() => {
      const cardContent = document.querySelector(".cart-col");

      const titleElement =
        cardContent && cardContent.querySelector(".wt-text-body-01");

      const priceElement =
        cardContent && cardContent.querySelector(".wt-text-title-larger");

      const descElement = document.querySelector(
        "[data-product-details-description-text-content]"
      );

      const paramElements = document.querySelectorAll("[data-option-original]");

      const imageElement = document.querySelector(
        "[data-carousel-first-image]"
      );

      // Extraction of product properties
      const title = titleElement
        ? titleElement.textContent && titleElement.textContent.trim()
        : "";
      const price = priceElement
        ? priceElement.textContent && priceElement.textContent.trim()
        : "";
      const description = descElement
        ? descElement.textContent && descElement.textContent.trim()
        : "";
      const params: string[] = [];
      paramElements &&
        paramElements.forEach((el) =>
          params.push(el.getAttribute("data-option-original") || "")
        );

      const image =
        imageElement instanceof HTMLImageElement ? imageElement.src : "";

      return { title, price, description, params, image };
    });
    console.log(content);

    products.push(content);
  }

  // Writing the result to a JSON file
  const existingData = fs.existsSync("result.json")
    ? JSON.parse(fs.readFileSync("result.json", "utf8"))
    : { task2: [] }; // Create task2 property if it doesn't exist

  existingData.task2 = products;

  fs.writeFileSync("result.json", JSON.stringify(existingData));

  await browser.close();
})();
