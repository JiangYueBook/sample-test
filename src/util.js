const fs = require("fs");
const os = require("os");
const { exec, execSync } = require("child_process");
const si = require("systeminformation");
const dayjs = require("dayjs");
const path = require("path");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");

// get config from config.json
const configPath = path.join(path.resolve(__dirname), "../config.json");
const config = readJsonFile(configPath);
let deviceInfo = {};
let chromePath;
// test results directory
const outDir = path.join(path.resolve(__dirname), "../out");
ensureDir(outDir);

function ensureDir(relativePath) {
  const absolutePath = path.resolve(relativePath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
}

function getBrowserArgs(backend) {
  const borwserArgs = [config["browserArgs"]];
  if (backend.startsWith("webnn")) {
    borwserArgs.push(config["browserArgsWebnn"]);
  }
  return borwserArgs;
}

function getBrowserPath(browser) {
  let browserPath;
  if (browser === "chrome_canary") {
    chromePath = "Chrome SxS";
    if (deviceInfo.platform === "win32") {
      browserPath = `${process.env.LOCALAPPDATA}/Google/Chrome SxS/Application/chrome.exe`;
    }
    if (deviceInfo.platform === "linux") {
      browserPath = "/usr/bin/google-chrome-unstable";
    }
  } else if (browser === "chrome_stable") {
    chromePath = "Chrome";
    if (deviceInfo.platform === "win32") {
      browserPath = `${process.env.PROGRAMFILES}/Google/Chrome/Application/chrome.exe`;
    }
    if (deviceInfo.platform === "linux") {
      browserPath = "/usr/bin/google-chrome-stable";
    }
  } else {
    browserPath = config["browser"];
  }
  return browserPath;
}

function readJsonFile(filePath) {
  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileData);
    return jsonData;
  } catch (error) {
    console.error("read json file error:", error);
    return null;
  }
}

function saveJsonFile(data) {
  const jsonData = JSON.stringify(data);
  const timestamp = getTimestamp();
  const timestampMinute = getTimestamp(true);
  const directoryPath = `${outDir}/${timestamp}`;
  ensureDir(directoryPath);
  const filePath = `${directoryPath}/${timestampMinute}.json`;
  fs.writeFile(filePath, jsonData, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("json file has been saved in " + filePath);
    }
  });
}

function getTimestamp(minute = false) {
  const timestamp = Date.now();
  let formattedTimestamp;
  if (minute === true) {
    formattedTimestamp = dayjs(timestamp).format("YYYYMMDDHHmm");
  } else {
    formattedTimestamp = dayjs(timestamp).format("YYYYMMDD");
  }
  return formattedTimestamp;
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function formatTimeResult(str) {
  return str.replace("ms", "").trim();
}

function replaceEmptyData(data) {
  for (let key in data) {
    if (data[key] === "" && key !== "Error") {
      data[key] = "NA";
    }
  }
  return data;
}

async function getScreenshot(page, filename) {
  const timestamp = getTimestamp();
  const timestampMinute = getTimestamp(true);
  const screenshotDir = `${outDir}/${timestamp}/screenshots`;
  ensureDir(screenshotDir);
  // save page as image
  await page.screenshot({ path: `${screenshotDir}/${filename}${timestampMinute}.png`, type: "png" });
  console.log("screenshot has been saved in " + screenshotDir);
}

async function saveCanvasimage(page, canvas_element, filename) {
  try {
    const canvas = await page.$(canvas_element);
    // get Canvas data URL
    const canvasDataURL = await page.evaluate((canvas) => {
      return canvas.toDataURL();
    }, canvas);

    //  transform URL to Buffer
    const base64Data = canvasDataURL.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // save image
    const timestamp = getTimestamp();
    const canvasDir = `${outDir}/${timestamp}/canvas_image`;
    ensureDir(canvasDir);
    fs.writeFileSync(`${canvasDir}/${filename}.png`, buffer);

    // console.log("canvas image has been saved in " + canvasDir);
    return { canvasPath: `${canvasDir}/${filename}.png` };
  } catch (error) {
    console.log("canvas image save fail", error);
  }
}

async function compareImages(firstImagePath, secondImagePath) {
  try {
    const image1 = await new Promise((resolve, reject) => {
      const image = fs.createReadStream(firstImagePath).pipe(new PNG());
      image.on("parsed", () => resolve(image));
      image.on("error", (error) => reject(error));
    });

    const image2 = await new Promise((resolve, reject) => {
      const image = fs.createReadStream(secondImagePath).pipe(new PNG());
      image.on("parsed", () => resolve(image));
      image.on("error", (error) => reject(error));
    });

    if (image1.width !== image2.width || image1.height !== image2.height) {
      throw new Error("image dimensions do not match");
    }
    const diff = new PNG({ width: image1.width, height: image1.height });
    const numDiffentPixels = pixelmatch(image1.data, image2.data, diff.data, image1.width, image1.height, {
      threshold: config["imageCompareThreshold"]
    });

    return numDiffentPixels === 0 ? { equal: true } : { equal: false, numDiffentPixels };
  } catch (error) {
    console.log(error);
    return { equal: "compare images failed" };
  }
}

async function getAlertWarning(page, Alertlocation) {
  try {
    return await page.$eval(Alertlocation, (el) => el.textContent);
  } catch (error) {
    return "";
  }
}

// get device info
async function getConfig() {
  deviceInfo["hostname"] = os.hostname();
  deviceInfo.platform = os.platform();
  deviceInfo["testURL"] = config["testURL"];
  deviceInfo["browser"] = config["browser"];
  deviceInfo["browserArgs"] = config["browserArgs"];
  deviceInfo["browserArgsWebnn"] = config["browserArgsWebnn"];
  getBrowserPath(deviceInfo["browser"]);
  // Chrome
  if (deviceInfo.platform === "win32" && deviceInfo["browser"].match("chrome_")) {
    const info = execSync(
      `reg query "HKEY_CURRENT_USER\\Software\\Google\\` + chromePath + `\\BLBeacon" /v version`
    ).toString();
    const match = info.match("REG_SZ (.*)");
    deviceInfo["chromeVersion"] = match[1].trim();
  }
  // CPU
  const cpuData = await si.cpu();
  let cpuName = cpuData.brand;
  const cpuManufacturer = cpuData.manufacturer;
  if (cpuManufacturer.includes("Intel")) {
    cpuName = cpuName.split(" ").pop();
  } else if (cpuManufacturer.includes("AMD")) {
    cpuName = cpuName.split(" ").slice(0, 3).join(" ");
  }
  deviceInfo["cpuName"] = cpuName;

  // GPU
  if (deviceInfo.platform === "win32") {
    const info = execSync("wmic path win32_VideoController get Name,DriverVersion,Status,PNPDeviceID /value")
      .toString()
      .split("\n");
    for (let i = 1; i < info.length; i++) {
      let match;
      match = info[i].match("DriverVersion=(.*)");
      if (match) {
        deviceInfo["gpuDriverVersion"] = match[1];
      }
      match = info[i].match("Name=(.*)");
      if (match) {
        deviceInfo["gpuName"] = match[1];
      }
      match = info[i].match("PNPDeviceID=.*DEV_(.{4})");
      if (match) {
        deviceInfo["gpuDeviceId"] = match[1].toUpperCase();
      }
      match = info[i].match("PNPDeviceID=.*VEN_(.{4})");
      if (match) {
        deviceInfo["gpuVendorId"] = match[1].toUpperCase();
      }
      match = info[i].match("Status=(.*)");
      if (match) {
        if (deviceInfo["gpuName"].match("Microsoft")) {
          continue;
        }
        if (match[1] == "OK") {
          break;
        }
      }
    }
  } else {
    const gpuData = await si.graphics();
    for (let i = 0; i < gpuData.controllers.length; i++) {
      if (gpuData.controllers[i].vendor == "Microsoft") {
        continue;
      }
      deviceInfo["gpuName"] = gpuData.controllers[i].model;
    }

    if (deviceInfo.platform === "darwin") {
      const osInfo = await si.osInfo();
      deviceInfo["gpuDriverVersion"] = osInfo.release;
    } else if (deviceInfo.platform === "linux") {
      deviceInfo["gpuDriverVersion"] = execSync('glxinfo |grep "OpenGL version"').toString().trim().split(" ").pop();
    }
  }

  // OS version
  // if (deviceInfo.platform === "win32") {
  //   deviceInfo["osVersion"] = await new Promise((resolve, reject) => {
  //     exec("ver", (error, stdout, stderr) => {
  //       resolve(stdout);
  //     });
  //   });
  // } else if (deviceInfo.platform === "darwin" || deviceInfo.platform === "linux") {
  //   const osInfo = await si.osInfo();
  //   deviceInfo["osVersion"] = osInfo.release;
  // }
}

module.exports = {
  getBrowserArgs,
  getBrowserPath,
  readJsonFile,
  getTimestamp,
  saveJsonFile,
  delay,
  formatTimeResult,
  replaceEmptyData,
  getScreenshot,
  getAlertWarning,
  getConfig,
  saveCanvasimage,
  compareImages,

  chromePath,
  deviceInfo
};
