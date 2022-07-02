const nodemailer = require("nodemailer");
const { verifyMsg } = require("./msgCreator");

const sendEmail = async (email, subject, text, isHtml = false) => {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERV,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  let mailOptions = {};

  if (isHtml) {
    mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: subject,
      html: text,
    };
  } else {
    mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: subject,
      text: text,
    };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully to: " + email);
  } catch (err) {
    console.log("Email not sent to: " + email);
    console.log(err);
  }
};

const sendVerificationEmail = async (email, name, link) => {
  const subject = "Verify your email";
  const text = verifyMsg(name, link);
  await sendEmail(email, subject, text, true);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
};
