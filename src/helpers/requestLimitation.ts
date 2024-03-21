import puppeteer from "puppeteer";

export const requestLimitation = async (page: puppeteer.Page) => {
    await page.setRequestInterception(true);
    page.on("request", async (request) => {
      if (request.resourceType() === "image") {
        await request.abort();
      } else {
        await request.continue();
      }
    });
}

