const image_classification_test = require("./case/imageClassification.js");
const fast_style_transfer_test = require("./case/fastStyleTransfer.js");
const util = require("./util.js");

const results = [];

async function main() {
  await util.getConfig();
  const deviceInfo = util.deviceInfo;
  // run test cases
  const image_classification_test_results = await image_classification_test();
  const fast_style_transfer_test_results = await fast_style_transfer_test();

  // save results
  results.push(
    { deviceInfo },
    image_classification_test_results,
    fast_style_transfer_test_results
  );
  util.saveJsonFile(results);
}

main();
