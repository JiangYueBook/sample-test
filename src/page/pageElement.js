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
  DeepLab_V3_MobileNet_V2: "#deeplabv3mnv2",
  // image_classification page
  label0: "#label0",
  prob0: "#prob0",
  label1: "#label1",
  prob1: "#prob1",
  label2: "#label2",
  prob2: "#prob2",
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
  code_line: ".CodeMirror-line",
  run_button: "#run",
  edit_button: "#edit",
  example_select: "#example-select",
  console_log: "#console-log",
  // face_recognition page
  FaceNet: "#facenet",
  SSD_MobileNet_V2_Face: "#ssdmobilenetv2face",
  // facial_landmark_detection page
  SimpleCNN: "#facelandmark",
  // handwritten_digits_classification page
  next_button: "#next",
  clear_button: "#clear",
  predict_button: "#predict",
  handwritten_digits_buildTime: "#buildTime > span",
  handwritten_digits_inferenceTime: "#inferenceTime > span",
  // noise_suppression_nsnet2 page
  load_info_text_rows: "#info > .text-primary",
  denoise_info_text_rows: "#denoise-info > .text-primary",
  ready_text: "//b[text()='ready']",
  done_text: "//b[text()='Done.']",
  choose_audio_button: "#choose-audio",
  babbel_noise: "#babbel",
  car_noise: "#car",
  street_noise: "#street",
  // noise_suppression_rnnoise page
  background_noise_1: "#voice1",
  background_noise_2: "#voice2",
  background_noise_3: "#voice3",
};

module.exports = pageElement;
