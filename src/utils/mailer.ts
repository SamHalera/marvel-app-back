import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
export const senMail = (
  from: string,
  to: string,
  subject: string,
  html: string
) => {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_HOST,
    // port: process.env.MAIL_PORT,
    // secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    html,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.info("mail has been sent");
    }
  });
};
