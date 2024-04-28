# SampleTest
This is test tool for (https://github.com/webmachinelearning/webnn-samples)

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
* `browser`: Choose broswer to run test. "chrome_canary", "chrome_stable".
* `headless`: Display chrome UI.
* `timeout`: Browser page waiting time (ms), if the test device performance is poor, please set a larger value.
* `sampleURL`: Each sample URL: testURL + sampleURL.
* `sampleName`: Sample Name is an object, including model Name and backend.

## Support

#### platform

Windows / Linux

#### browser

chrome_stable / chrome_canary