const puppeteer = require("puppeteer");
const util = require("../util.js");
const pageElement = require("../page/pageElement.js");
const _ = require("lodash");
const path = require("path");

async function image_classification_test() {
  let sample = "image_classification";
  let results = {};
  const configPath = path.join(path.resolve(__dirname), "../../config.json");
  const config = util.readJsonFile(configPath);

  for (let backend in config[sample]) {
    for (let data_type in config[sample][backend]) {
      for (let model of config[sample][backend][data_type]) {
        console.log(`${sample} ${backend} ${data_type} ${model} testing...`);
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
          await page.waitForSelector(`::-p-xpath(${pageElement.backendText})`);
          // choose backend and model
          await page.click(pageElement[backend]);
          await page.click(pageElement[data_type]);
          await page.click(pageElement[model]);
          // wait for model running results
          try {
            await page.waitForSelector(pageElement["computeTime"], {
              visible: true,
              timeout: config["timeout"]
            });
          } catch (error) {
            errorMsg += `[PageTimeout]`;
            // save screenshot
            screenshotFilename = `${sample}_${backend}_${data_type}_${model}`;
            await util.getScreenshot(page, screenshotFilename);
            // save alert warning message
            errorMsg += await util.getAlertWarning(page, pageElement.alertWaring);
          }

          // get results
          const loadTime = await page.$eval(pageElement["loadTime"], (el) => el.textContent);

          const buildTime = await page.$eval(pageElement["buildTime"], (el) => el.textContent);

          const computeTime = await page.$eval(pageElement["computeTime"], (el) => el.textContent);

          const label0 = await page.$eval(pageElement["label0"], (el) => el.textContent);
          const prob0 = await page.$eval(pageElement["prob0"], (el) => el.textContent);
          const label1 = await page.$eval(pageElement["label1"], (el) => el.textContent);
          const prob1 = await page.$eval(pageElement["prob1"], (el) => el.textContent);
          const label2 = await page.$eval(pageElement["label2"], (el) => el.textContent);
          const prob2 = await page.$eval(pageElement["prob2"], (el) => el.textContent);

          // set results
          let pageResults = {
            LoadTime: util.formatTimeResult(loadTime),
            BuildTime: util.formatTimeResult(buildTime),
            InferenceTime: util.formatTimeResult(computeTime),
            Labe0: label0,
            Probability0: prob0,
            Label1: label1,
            Probability1: prob1,
            Label2: label2,
            Probability2: prob2,
            Error: errorMsg
          };
          pageResults = util.replaceEmptyData(pageResults);
          _.set(results, [sample, backend, data_type, model], pageResults);
          console.log("Test Results: ", pageResults);

          // close browser
          await browser.close();
        } catch (error) {
          console.log(error);
          _.set(results, [sample, backend, data_type, model, "Error"], error.message);
          await browser.close();
          continue;
        }
      }
    }
  }
  return results;
}

module.exports = image_classification_test;
