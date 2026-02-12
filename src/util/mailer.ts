import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config()

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_EMAIL_PASS
  }
});

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"MYBIZ - One App. Every Business" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:");
    return true;
  } catch (error) {
    console.error("Error sending email:");
    return false;
  }
}