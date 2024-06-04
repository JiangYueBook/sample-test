const puppeteer = require("puppeteer");
const util = require("../util.js");
const pageElement = require("../page/pageElement.js");
const _ = require("lodash");
const path = require("path");

async function fast_style_transfer_test() {
  let sample = "fast_style_transfer";
  let results = {};
  const configPath = path.join(path.resolve(__dirname), "../../config.json");
  const config = util.readJsonFile(configPath);
  const expectedCanvas = path.join(path.resolve(__dirname), "../../lib/canvas");

  for (let backend in config[sample]) {
    for (let model of config[sample][backend]) {
      console.log(`${sample} ${backend} ${model} testing...`);
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

        // Navigate the page to a URL
        await page.goto(`${config["testURL"]}${config["sampleURL"][sample]}`, { waitUntil: "networkidle0" });

        // // wait for page text display
        await page.waitForSelector(`::-p-xpath(${pageElement.backendText})`);
        // choose backend and model
        await page.click(pageElement[backend]);
        await page.click(pageElement[model]);

        try {
          await page.waitForSelector(pageElement["computeTime"], {
            visible: true,
            timeout: config["timeout"]
          });
        } catch (error) {
          errorMsg += `[PageTimeout]`;
          // save screenshot
          screenshotFilename = `${sample}_${backend}_${model}`;
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
            // const canvas_image_name_input = `${sample}_${backend}_${model}_input`;
            const canvas_image_name_output = `${sample}_${backend}_${model}_output`;

            // const saveCanvasResult_input = await util.saveCanvasimage(
            //   page,
            //   pageElement.fast_style_transfer_input_canvas,
            //   canvas_image_name_input
            // );
            const saveCanvasResult_output = await util.saveCanvasimage(
              page,
              pageElement.fast_style_transfer_output_canvas,
              canvas_image_name_output
            );

            // compare canvas to expected canvas
            const expectedCanvasPath = `${expectedCanvas}/${sample}_${model}_output.png`;
            compareImagesResults = await util.compareImages(saveCanvasResult_output.canvasPath, expectedCanvasPath);
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
        _.set(results, [sample, backend, model], pageResults);
        console.log("Test Results: ", pageResults);

        // close browser
        await browser.close();
      } catch (error) {
        console.log(error);
        _.set(results, [sample, backend, model, "Error"], error.message);
        await browser.close();
        continue;
      }
    }
  }
  return results;
}

module.exports = fast_style_transfer_test;
