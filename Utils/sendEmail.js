const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create the email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or your preferred service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `MJ Dance Academy <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message, // HTML allows us to send beautifully formatted text!
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;