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

const util = require("./util.js");
const report = require("./report.js");

const results = [];

async function main() {
  await util.getConfig();
  const deviceInfo = { deviceInfo: util.deviceInfo };
  // run test cases
  const image_classification_test_results = await image_classification_test();
  const fast_style_transfer_test_results = await fast_style_transfer_test();
  const object_detection_test_results = await object_detection_test();
  const webnn_code_editor_test_results = await webnn_code_editor_test();
  const semantic_segmentation_test_results = await semantic_segmentation_test();
  const face_recognition_test_results = await face_recognition_test();
  const facial_landmark_detection_test_results = await facial_landmark_detection_test();
  const handwritten_digits_classification_test_results = await handwritten_digits_classification_test();
  const noise_suppression_nsnet2_test_results = await noise_suppression_nsnet2_test();
  const noise_suppression_rnnoise_test_results = await noise_suppression_rnnoise_test();

  // save results
  results.push(
    deviceInfo,
    image_classification_test_results,
    fast_style_transfer_test_results,
    object_detection_test_results,
    webnn_code_editor_test_results,
    semantic_segmentation_test_results,
    face_recognition_test_results,
    facial_landmark_detection_test_results,
    handwritten_digits_classification_test_results,
    noise_suppression_nsnet2_test_results,
    noise_suppression_rnnoise_test_results
  );
  // save results to json file
  const jsonPath = util.saveJsonFile(results);
  // send report
  await report(jsonPath);
}

main();
