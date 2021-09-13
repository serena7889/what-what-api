const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  // Define options
  const mailOptions = {
    from: 'SerenaLambert <hello@serena.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: 
  }

  // Send email
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;