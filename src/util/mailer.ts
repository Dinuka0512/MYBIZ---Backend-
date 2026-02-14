import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASS
    }
});

export async function sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType: string;
    }>
): Promise<boolean> {
    try {
        const mailOptions: any = {
            from: `"MYBIZ - One App. Every Business" <${process.env.USER_EMAIL}>`,
            to,
            subject,
            text,
            html
        };

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            mailOptions.attachments = attachments;
        }

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent successfully:", info.messageId);
        console.log("📧 To:", to);
        console.log("📧 Subject:", subject);
        if (attachments) {
            console.log("📎 Attachments:", attachments.length);
        }

        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
}