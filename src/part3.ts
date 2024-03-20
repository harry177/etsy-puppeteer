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

  let captchaDetected = false; // Captcha marker

  while (!captchaDetected) {
    await page.goto("https://www.etsy.com/listing/1549220254", {
      timeout: 0,
      waitUntil: "domcontentloaded",
    });

    // Checking if it is a captcha page
    const iframes = await page.$$("body > iframe");
    if (iframes.length === 1) {
      console.log("Captcha detected. Retrying...");
    } else {
      captchaDetected = true;
    }
  }

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

      existingData.task3 = `${cardTitle} added to cart`;

      // Writing the result to a JSON file if titles from product page and cart page are matching
      if (targetTitle === cardTitle) {
        fs.writeFileSync("result.json", JSON.stringify(existingData));
        console.log(`${cardTitle} added to cart`);
      }

      await page.click(".proceed-to-checkout");

      await page.waitForSelector(".wt-validation > [data-join-neu-button]");
      await page.click(".wt-validation > [data-join-neu-button]");

      // Waiting for checkout page loading
      await page.waitForNavigation();

      await page.waitForSelector("#shipping-form-email-input");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.type("#shipping-form-email-input", "prygunov177@gmail.com", {
        delay: 100,
      });

      await page.waitForSelector("#shipping-form-email-confirmation");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.type(
        "#shipping-form-email-confirmation",
        "prygunov177@gmail.com",
        { delay: 150 }
      );

      const select = await page.waitForSelector("#country_id10-select");
      await select?.select("91");

      await page.waitForSelector("[data-field-container='name'] > input");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await page.type(
        "[data-field-container='name'] > input",
        "Artem Prygunov",
        { delay: 200 }
      );

      await page.evaluate(() => {
        window.scrollBy(0, 500);
      });

      await page.waitForSelector("[data-field-container='first_line'] > input");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.type(
        "[data-field-container='first_line'] > input",
        "Unter den Linden, 12",
        { delay: 200 }
      );

      await page.waitForSelector("[autocomplete='postal-code']");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.type("[autocomplete='postal-code']", "15047", { delay: 200 });

      await page.waitForSelector("[data-field-container='city'] > input");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.type("[data-field-container='city'] > input", "Berlin", { delay: 200 });

      await page.click("[data-selector-save-btn]");
      // Waiting for payment page loading
      await page.waitForNavigation();

      await page.waitForSelector("[data-link-close]");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.click("[data-link-close]");

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const paymentData = fs.existsSync("result.json")
        ? JSON.parse(fs.readFileSync("result.json", "utf8"))
        : { task4: "" }; // Create task4 property if it doesn't exist

      paymentData.task4 = "Payments page reached!";
      fs.writeFileSync("result.json", JSON.stringify(paymentData));
    }
    await browser.close();
  
};
starter();
