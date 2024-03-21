import fs from "fs";
import puppeteer from "puppeteer";
import { requestLimitation } from "./helpers/requestLimitation.ts";

interface ProductProps {
  title: string | null;
  price: string | null;
  description: string | null;
  params: string[];
  image: string;
}

const MAX_RETRIES = 10; // Max amount of retries

const processTask = async (task: {
  title: string;
  price: string;
  link: string;
}) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Limit requests
  requestLimitation(page)

  let retries = 0; // Retries counter

  while (retries < MAX_RETRIES) {
    await page.goto(task.link, { timeout: 0, waitUntil: "domcontentloaded" });

    // Checking if it is a captcha page
    const iframes = await page.$$("body > iframe");

    // If yes - restart attempt
    if (iframes.length === 1) {
      console.log("Captcha detected. Retrying...");
      retries++;
    } else {
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

        const paramElements = document.querySelectorAll(
          "[data-option-original]"
        );

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

      // Processing successful, exit the loop
      await browser.close();
      return content;
    }
  }

  // Maximum retries reached, exit the loop
  console.log("Maximum retries reached. Skipping task.");
  await browser.close();
  return null;
};

const starter = async () => {
  // Reading result.json
  const data = fs.readFileSync("result.json", "utf-8");
  const jsonData = JSON.parse(data);
  const tasks = jsonData.task1;

  const products: ProductProps[] = [];

  for (const task of tasks) {
    const content = await processTask(task);

    if (content) {
      products.push(content);
    }
  }

  // Writing the result to a JSON file
  const existingData = fs.existsSync("result.json")
    ? JSON.parse(fs.readFileSync("result.json", "utf8"))
    : { task2: [] }; // Create task2 property if it doesn't exist

  existingData.task2 = products;

  fs.writeFileSync("result.json", JSON.stringify(existingData));
};

starter();
