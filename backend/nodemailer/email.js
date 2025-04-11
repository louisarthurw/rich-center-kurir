import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, verificationToken) => {
  const mailOptions = {
    from: {
      name: "Rich Center Kurir",
      address: process.env.EMAIL,
    },
    to: email,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationToken
    ),
  };

  try {
    const response = transporter.sendMail(mailOptions);
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification email", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};
