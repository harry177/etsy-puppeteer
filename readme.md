# Puppeteer-scraper

## Project setup instructions:

- Clone app using "git clone"
- Execute all parts of the application from 1 to 3 using the command "ts-node src/part1.ts" (or part2.ts / part3.ts)
- Look at the resulting json file appeared in the root of app to check results of scraping

## Assumptions

- It became clear that searching and retrieving information using puppeteer requires individual configuration for each new site
- There are many third-party tools to improve puppeteer's performance to make scraping easier, but in general you can get by with just the library itself
- Headful mode of puppeteer is more useful than headless


## Challenges

- The main challenge is a guaranteed result of bypassing captcha and other possible checks/blocking on the site side
- Inability to export functions inside a method "page.evaluate()"

## Improvements

Bypassing the captcha is done by re-requesting the page and reloading the virtual browser. This can also be done by identifying the element with a “hole” in the captcha and then filling it in.