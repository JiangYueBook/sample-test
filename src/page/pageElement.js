const pageElement = {
  // public element
  alertWaring: ".alert-warning > span", // css selector
  // model load result
  loadTime: "#loadTime",
  buildTime: "#buildTime",
  computeTime: "#computeTime",
  // backend
  backendText: "//span[text()='Backend']", // xpath selector
  wasm: "#polyfill_cpu",
  webgl: "#polyfill_gpu",
  webnn_cpu: "#webnn_cpu",
  webnn_gpu: "#webnn_gpu",
  // model
  MobileNet_V2: "#mobilenet",
  SqueezeNet: "#squeezenet",
  ResNet_V2_50: "#resnet50",
  Tiny_Yolo_V2: "#tinyyolov2",
  SSD_MobileNet_V1: "#ssdmobilenetv1",
  // image_classification page
  label0: "#label0",
  prob0: "#prob0",
  // fast_style_transfer page
  starry_night: "#starry-night",
  self_portrait: "#self-portrait",
  bedroom: "#bedroom",
  sunflowers_bew: "#sunflowers-bew",
  red_vineyards: "#red-vineyards",
  sien_with_a_cigar: "#sien-with-a-cigar",
  la_campesinos: "#la-campesinos",
  soup_distribution: "#soup-distribution",
  wheatfield_with_crows: "#wheatfield_with_crows",
  // webnn_code_editor page
  run_button: "#run",
  edit_button: "#edit",
  example_select: "#example-select",
  console_log: "#console-log"
};

module.exports = pageElement;
