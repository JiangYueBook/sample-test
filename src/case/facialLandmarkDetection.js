const puppeteer = require("puppeteer");
const util = require("../util.js");
const pageElement = require("../page/pageElement.js");
const _ = require("lodash");
const path = require("path");

async function facial_landmark_detection_test() {
  let sample = "facial_landmark_detection";
  let results = {};
  const configPath = path.join(path.resolve(__dirname), "../../config.json");
  const config = util.readJsonFile(configPath);
  const expectedCanvas = path.join(path.resolve(__dirname), "../../lib/canvas");

  for (let backend in config[sample]) {
    for (let facialLandmark in config[sample][backend]) {
      for (let model of config[sample][backend][facialLandmark]) {
        console.log(`${sample} ${backend} ${facialLandmark} ${model} testing...`);
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
          await page.click(pageElement[facialLandmark]);
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
            screenshotFilename = `${sample}_${backend}_${facialLandmark}_${model}`;
            await util.getScreenshot(page, screenshotFilename);
            // save alert warning message
            errorMsg += await util.getAlertWarning(page, pageElement.alertWaring);
          }

          // get results
          const loadTime = await page.$eval(pageElement["loadTime"], (el) => el.textContent);

          const buildTime = await page.$eval(pageElement["buildTime"], (el) => el.textContent);

          const computeTime = await page.$eval(pageElement["computeTime"], (el) => el.textContent);

          // save canvas image
          let compareImagesResults = "";
          if (!errorMsg.includes("PageTimeout")) {
            try {
              const canvas_image_name = `${sample}_${backend}_${model}`;
              const saveCanvasResult = await util.saveCanvasimage(
                page,
                pageElement.facial_landmark_detection_canvas,
                canvas_image_name
              );
              // compare canvas to expected canvas
              const expectedCanvasPath = `${expectedCanvas}/${sample}_${model}.png`;
              compareImagesResults = await util.compareImages(saveCanvasResult.canvasPath, expectedCanvasPath);
            } catch (error) {
              console.log(error);
            }
          }

          // set results
          let pageResults = {
            LoadTime: util.formatTimeResult(loadTime),
            BuildTime: util.formatTimeResult(buildTime),
            InferenceTime: util.formatTimeResult(computeTime),
            compareImagesResults,
            Error: errorMsg
          };
          pageResults = util.replaceEmptyData(pageResults);
          _.set(results, [sample, facialLandmark, model, backend], pageResults);
          console.log("Test Results: ", pageResults);

          // close browser
          await browser.close();
        } catch (error) {
          console.log(error);
          _.set(results, [sample, facialLandmark, model, backend, "Error"], error.message);
          await browser.close();
          continue;
        }
      }
    }
  }
  return results;
}

module.exports = facial_landmark_detection_test;
