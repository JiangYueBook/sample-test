const { spawnSync } = require("child_process");
const util = require("./util.js");
const report = require("./report.js");
const image_classification_test = require("./case/imageClassification.js");
const fast_style_transfer_test = require("./case/fastStyleTransfer.js");
const object_detection_test = require("./case/objectDetection.js");
const webnn_code_editor_test = require("./case/webnn_code_editor.js");
const semantic_segmentation_test = require("./case/semanticSegmentation.js");
const face_recognition_test = require("./case/faceRecognition.js");
const facial_landmark_detection_test = require("./case/facialLandmarkDetection.js");
const handwritten_digits_classification_test = require("./case/handwrittenDigitsClassification.js");
const noise_suppression_nsnet2_test = require("./case/noiseSuppressionNsnet2.js");
const noise_suppression_rnnoise_test = require("./case/noiseSuppressionRnnoise.js");

async function main() {
  const results = [];
  // get device info
  await util.getConfig();
  results.push({ deviceInfo: util.deviceInfo });
  // try to kill chrome process
  spawnSync("cmd", ["/c", "taskkill /F /IM chrome.exe /T"]);

  // run test cases
  results.push(await image_classification_test());
  results.push(await fast_style_transfer_test());
  results.push(await object_detection_test());
  results.push(await webnn_code_editor_test());
  results.push(await semantic_segmentation_test());
  results.push(await face_recognition_test());
  results.push(await facial_landmark_detection_test());
  results.push(await handwritten_digits_classification_test());
  results.push(await noise_suppression_nsnet2_test());
  results.push(await noise_suppression_rnnoise_test());

  // save results to json file
  const jsonPath = await util.saveJsonFile(results);
  // send report
  await report(jsonPath);
}

main();
