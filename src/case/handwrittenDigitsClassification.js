const puppeteer = require("puppeteer");
const util = require("../util.js");
const pageElement = require("../page/pageElement.js");
const _ = require("lodash");
const path = require("path");

async function handwritten_digits_classification_test() {
  let sample = "handwritten_digits_classification";
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
      await page.waitForSelector(`::-p-xpath(${pageElement.backendText})`);
      // choose backend
      await page.click(pageElement[backend]);
      // wait for model building
      try {
        await page.waitForSelector(pageElement["handwritten_digits_buildTime"], {
          visible: true,
          timeout: config["timeout"]
        });
      } catch (error) {
        errorMsg += `[PageTimeout]`;
        // save screenshot
        screenshotFilename = `${sample}_${backend}`;
        await util.getScreenshot(page, screenshotFilename);
        // save alert warning message
        errorMsg += await util.getAlertWarning(page, pageElement.alertWaring);
      }
      // loop test
      for (let i = 0; i < config[sample]["testRounds"]; i++) {
        // click next button
        if (i !== 0) {
          await page.click(pageElement["next_button"]);
          await util.delay(1000);
        }
        // click predict button
        await page.click(pageElement["predict_button"]);
        // wait for prediction result
        try {
          await page.waitForSelector(pageElement["handwritten_digits_inferenceTime"], {
            visible: true,
            timeout: config["timeout"]
          });
        } catch (error) {
          errorMsg += `[PageTimeout]`;
          // save screenshot
          screenshotFilename = sample + backend;
          await util.getScreenshot(page, screenshotFilename);
          // save alert warning message
          errorMsg += await util.getAlertWarning(page, pageElement.alertWaring);
        }
        console.log("get results 001");

        // get results
        const inferenceTime = await page.$eval(pageElement["handwritten_digits_inferenceTime"], (el) => el.textContent);
        const label0 = await page.$eval(pageElement["label0"], (el) => el.textContent);
        const prob0 = await page.$eval(pageElement["prob0"], (el) => el.textContent);
        const label1 = await page.$eval(pageElement["label1"], (el) => el.textContent);
        const prob1 = await page.$eval(pageElement["prob1"], (el) => el.textContent);
        const label2 = await page.$eval(pageElement["label2"], (el) => el.textContent);
        const prob2 = await page.$eval(pageElement["prob2"], (el) => el.textContent);

        // save canvas image
        if (!errorMsg.includes("PageTimeout")) {
          try {
            const canvas_image_name = `${sample}_${backend}_round${i}`;
            await util.saveCanvasimage(page, pageElement.handwritten_digits_classification_canvas, canvas_image_name);
          } catch (error) {
            console.log(error);
          }
        }

        // set results for this round test
        let pageResults = {
          Label0: label0,
          Probability0: prob0,
          Label1: label1,
          Probability1: prob1,
          Label2: label2,
          Probability2: prob2,
          ExecutionTime: inferenceTime
        };
        pageResults = util.replaceEmptyData(pageResults);
        _.set(results, [sample, backend, `round${i}`], pageResults);
        console.log(`Test Results round${i}: `, pageResults);
      }
      // get all extra results
      const buildTime = await page.$eval(pageElement["handwritten_digits_buildTime"], (el) => el.textContent);
      // set final results
      _.set(results, [sample, backend, "extra_results"], { buildTime, Error: errorMsg });

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

module.exports = handwritten_digits_classification_test;
