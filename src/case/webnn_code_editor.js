const puppeteer = require("puppeteer");
const util = require("../util.js");
const pageElement = require("../page/pageElement.js");
const _ = require("lodash");
const path = require("path");

async function webnn_code_editor_test() {
  let sample = "webnn_code_editor";
  let results = {};
  const configPath = path.join(path.resolve(__dirname), "../../config.json");
  const config = util.readJsonFile(configPath);

  for (let backend in config[sample]) {
    console.log(`${sample} ${backend} testing...`);
    // set browser args, browser path
    const args = util.getBrowserArgs(backend);
    const browserPath = util.getBrowserPath(config.browser);
    let errorMsg = "";
    const errorMsgMaxLength = config.errorMsgMaxLength;
    let browser;
    try {
      // launch the browser
      browser = await puppeteer.launch({
        headless: config.headless,
        defaultViewport: null,
        args,
        executablePath: browserPath,
        ignoreHTTPSErrors: true
      });
      // open a new page
      const page = await browser.newPage();
      // set the default timeout time for the page
      page.setDefaultTimeout(config.timeout);
      // capture JS errors in the page
      page.on("error", (error) => {
        const pageerror = `[Error] ${error}`;
        errorMsg += `${pageerror.substring(0, errorMsgMaxLength)}`;
      });

      // navigate the page to a URL
      await page.goto(`${config["testURL"]}${config["sampleURL"][sample]}`);

      // wait for page text display
      await page.waitForSelector(pageElement["example_select"]);
      await util.delay(10000);
      for (let example in config[sample][backend]) {
        // click dropdown
        await page.click(pageElement["example_select"]);
        // wait for option
        await page.waitForSelector(`${pageElement["example_select"]} option`);
        await util.delay(1000);
        // choose option
        await page.select('select', example);
        // await page.evaluate((example) => {
        //   const selectElement = document.querySelector(pageElement["example_select"]);
        //   const options = Array.from(document.querySelectorAll(`${pageElement["example_select"]} option`));
        //   options.forEach((option) => {
        //     if (option.textContent === example) {
        //       selectElement.value = option.textContent;
        //       selectElement.dispatchEvent(new Event("change", { bubbles: true }));
        //     }
        //   });
        // });

        await util.delay(1000);
        // click run button
        await page.click(pageElement["run_button"]);
        await util.delay(5000);
        // get console results
        const actual_value = await page.$eval(pageElement["console_log"], (el) => el.textContent);
        // set console results
        console.log("config", config[sample][backend][example])
        let pageResults = {
          expected_value: config[sample][backend][example]["expected_value"],
          actual_value: actual_value,
          test_results: actual_value === config[sample][backend][example]["expected_value"] ? "pass" : "fail",
          Error: errorMsg
        };
        _.set(results, [sample, backend, example], pageResults);
        console.log("Test Results: ", pageResults);
      }
      // close browser
      await browser.close();
    } catch (error) {
      console.log(error);
      _.set(results, [sample, backend, "Error"], error.message);
      await browser.close();
      continue;
    }
  }
  return results;
}

module.exports = webnn_code_editor_test;
