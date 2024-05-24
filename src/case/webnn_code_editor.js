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

  for (let backend of config[sample]["backend"]) {
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
        ignoreHTTPSErrors: true,
        protocolTimeout: config["timeout"]
      });
      // open a new page
      const page = await browser.newPage();
      // set the default timeout time for the page
      page.setDefaultTimeout(config["timeout"]);
      // capture JS errors in the page
      page.on("error", (error) => {
        const pageerror = `[Error] ${error}`;
        errorMsg += `${pageerror.substring(0, errorMsgMaxLength)}`;
      });

      // navigate the page to a URL
      await page.goto(`${config["testURL"]}${config["sampleURL"][sample]}`);

      // wait for page text display
      await page.waitForSelector(pageElement["example_select"]);
      // wait for code text display
      await page.waitForSelector(pageElement["code_line"]);
      for (let example in config[sample]["example"]) {
        // click dropdown
        await page.click(pageElement["example_select"]);
        // wait for option
        await page.waitForSelector(`${pageElement["example_select"]} option`);
        // choose option
        await page.select("select", example);
        // wait for code text display
        await util.delay(5000);
        await page.waitForSelector(pageElement["code_line"]);
        // click run button
        await page.click(pageElement["run_button"]);
        // get console results
        await util.delay(5000);
        const actual_value = await page.$eval(pageElement["console_log"], (el) => el.textContent);
        // set console results
        let pageResults = {
          expected_value: config[sample]["example"][example]["expected_value"],
          actual_value: actual_value,
          test_results: actual_value === config[sample]["example"][example]["expected_value"] ? "pass" : "fail",
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
