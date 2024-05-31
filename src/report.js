const fs = require("fs");
const os = require("os");
const nodemailer = require("nodemailer");
const path = require("path");
const util = require("./util.js");

// get config from config.json
const configPath = path.join(path.resolve(__dirname), "../config.json");
const config = util.readJsonFile(configPath);

async function sendMail(subject, text, filePath) {
  // create SMTP transport object
  let transporter = nodemailer.createTransport(config.emailService.serverConfig);
  // check json file exists
  const jsonFileExists = fs.existsSync(filePath);
  const jsonFile = jsonFileExists ? fs.readFileSync(filePath, "utf8") : null;

  let mailOptions = {
    from: config.emailService.from,
    to: config.emailService.to,
    subject: subject,
    text: text
  };
  if (jsonFileExists) {
    mailOptions.attachments = [
      {
        filename: "test-results.json",
        content: jsonFile
      }
    ];
  }
  transporter.verify((error) => {
    if (error) console.log("transporter error: ", error);
    else console.log("Email was sent!");
  });
  await transporter.sendMail(mailOptions);

  return Promise.resolve();
}

async function report(filePath) {
  const hostname = os.hostname();
  const reportTime = util.getTimestamp(true);
  let subject = `[WebNN Sample Test] ${hostname} ${reportTime}`;
  let text = `Test completed, please check the attachment.\n`;
  text += `\nThanks,\nWebNN Team`;
  await sendMail(subject, text, filePath);
}

module.exports = report;
