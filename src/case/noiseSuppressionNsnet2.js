const puppeteer = require("puppeteer");
const util = require("../util.js");
const pageElement = require("../page/pageElement.js");
const _ = require("lodash");
const path = require("path");

async function noise_suppression_nsnet2_test() {
  let sample = "noise_suppression_nsnet2";
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
      await page.waitForSelector(`::-p-xpath(${pageElement.backendText})`);
      // choose backend
      await page.click(pageElement[backend]);
      // wait for model ready
      try {
        await page.waitForSelector(`::-p-xpath(${pageElement.ready_text})`, {
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
      // choose sample audio
      for (let sample_audio of config[sample]["sample_audio"]) {
        // click choose audio button
        await page.click(pageElement["choose_audio_button"]);
        // wait for dropdown menu
        try {
          await page.waitForSelector(pageElement[sample_audio], {
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
        // click sample audio button
        await page.click(pageElement[sample_audio]);
        // wait for model running results
        try {
          await page.waitForSelector(`::-p-xpath(${pageElement.done_text})`, {
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
        // get results
        const denoise_info_text_spans = await page.$$eval(pageElement["denoise_info_text_rows"], (elements) =>
          elements.map((element) => element.textContent)
        );

        console.log("denoise_info_text_spans", denoise_info_text_spans);
        // save screenshot
        screenshotFilename = sample + backend;
        await util.getScreenshot(page, screenshotFilename);
        // set results
        // let pageResults = {
        //   LoadTime: util.formatTimeResult(loadTime),
        //   BuildTime: util.formatTimeResult(buildTime),
        //   InferenceTime: util.formatTimeResult(computeTime),
        //   Error: errorMsg
        // };
        // pageResults = util.replaceEmptyData(pageResults);
        // _.set(results, [sample, backend], pageResults);
        // console.log("Test Results: ", pageResults);
      }
      // get results
      const load_info_text_spans = await page.$$eval(pageElement["load_info_text_rows"], (elements) =>
      elements.map((element) => element.textContent)
    );
    console.log("load_info_text_spans", load_info_text_spans);

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

module.exports = noise_suppression_nsnet2_test;
