# Puppeteer-scraper

## Functionality

The application scrapes external web site, allows you to collect data from product cards, add products to your cart, and fill out user data when placing an order. For example the chosen web-site is https://www.etsy.com/

## Project setup instructions:

- Clone app using "git clone"
- Execute all parts of the application from 1 to 3 using the command "ts-node src/part1.ts" (or part2.ts / part3.ts)
- Look at the resulting json file appeared in the root of app to check results of scraping

## Technology stack

Node.js, Typescript, Puppeteer

## Improvements

Bypassing the captcha is done by re-requesting the page and reloading the virtual browser. A more interesting approach to implement in the future - to identify the element with a “hole” in the captcha and then fill it in.

## Author

Artem Prygunov