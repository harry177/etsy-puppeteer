"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    // Limit requests
    yield page.setRequestInterception(true);
    page.on("request", (request) => __awaiter(void 0, void 0, void 0, function* () {
        if (request.resourceType() == "image") {
            yield request.abort();
        }
        else {
            yield request.continue();
        }
    }));
    yield page.goto("https://www.etsy.com/", {
        waitUntil: "networkidle0",
    });
    // Starting the product search process
    const products = yield page.evaluate(() => {
        const productElements = Array.from(document.querySelectorAll(".v2-listing-card"));
        // Array for storing products info
        const products = [];
        for (let i = 0; i < 10 && i < productElements.length; i++) {
            const productElement = productElements[i];
            const titleElement = productElement.querySelector(".v2-listing-card__title");
            const symbolElement = productElement.querySelector(".currency-symbol");
            const priceElement = productElement.querySelector(".currency-symbol + .currency-value");
            const linkElement = productElement.querySelector(".listing-link");
            // Extraction of title, price and product URL
            const title = titleElement
                ? titleElement.textContent && titleElement.textContent.trim()
                : "";
            const price = priceElement
                ? priceElement.textContent &&
                    priceElement.textContent.trim() + " " + (symbolElement === null || symbolElement === void 0 ? void 0 : symbolElement.textContent)
                : "";
            const link = linkElement instanceof HTMLAnchorElement ? linkElement.href : "";
            products.push({ title, price, link });
        }
        return products;
    });
    console.log(products);
    // Writing the result to a JSON file
    fs_1.default.writeFileSync("result.json", JSON.stringify(products));
    yield browser.close();
}))();
