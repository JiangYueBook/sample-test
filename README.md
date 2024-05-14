# SampleTest
This is test tool for https://github.com/webmachinelearning/webnn-samples

## Install

```sh
$ npm install
```

## Start

```sh
$ npm test
```

## Set config.json file

* `testURL`: URL of WebNN Examples.
* `browser`: Choose browser to run test. "chrome_canary", "chrome_stable" or your local chrome browser executable path e.g. "C:/workspace/chrome.exe"
* `headless`: Display chrome UI.
* `timeout`: Browser page waiting time (ms), if the test device performance is poor, please set a larger value.
* `imageCompareThreshold`: Images matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive. 0.1 by default.
* `sampleURL`: Each sample URL: testURL + sampleURL.
* `sampleName`: Sample Name is an object, including model Name and backend.

## Support

#### platform

Windows / Linux

#### browser

chrome_stable / chrome_canary / local_chrome_build