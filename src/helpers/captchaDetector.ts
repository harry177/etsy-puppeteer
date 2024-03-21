import puppeteer from "puppeteer";

export const captchaDetector = async (page: puppeteer.Page, captchaDetected: boolean) => {
    const iframes = await page.$$("body > iframe");
    if (iframes.length === 1) {
      console.log("Captcha detected. Retrying...");
    } else {
      captchaDetected = true;
    }
    return captchaDetected;
  }