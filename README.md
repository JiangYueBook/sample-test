# Sample Test

This is test tool for https://github.com/webmachinelearning/webnn-samples

## Install

```sh
$ npm install
```

## Start

```sh
$ npm test
```

## Set config.json

- `testURL`: URL of WebNN Examples.
- `browser`: Choose browser to run test. "chrome_canary", "chrome_beta", "chrome_dev", "chrome_stable" or your local chrome browser executable path e.g. "C:/workspace/chrome.exe"
- `headless`: Display chrome UI.
- `timeout`: Browser page waiting time (ms), if the test device performance is poor, please set a larger value.
- `imageCompareThreshold`: Images matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive. 0.1 by default.
- `sampleURL`: Each sample URL: testURL + sampleURL.
- `emailService`: Edit the email config according to your server.
- `sampleName`: Sample Name is an object, including model Name and backend.

## Set expected canvas image

Expected images are placed in the directory: ./lib/canvas/  
If the image comparison result is not equal to it, please replace the correct image.

## Support

#### Platform

Windows / Linux

#### Browser

chrome_canary / chrome_beta / chrome_dev / chrome_stable / local_chrome_build
