import { Request, Response } from "express";
import dotenv from "dotenv";
import { sendMail } from "../util/mailer";
import axios from "axios";

dotenv.config();

export const sendBill = async (req: Request, res: Response) => {
    try {
        const { to, pdfUrl } = req.body;

        console.log("📧 Sending email to:", to);

        if (!to || !pdfUrl) {
            return res.status(400).json({
                success: false,
                message: "Missing email or PDF URL"
            });
        }

        // Download PDF
        const pdfResponse = await axios.get(pdfUrl, {
            responseType: 'arraybuffer'
        });
        const pdfBuffer = Buffer.from(pdfResponse.data);

        // Send email with PDF
        const emailSent = await sendMail(
            to,
            "Your Invoice",
            "Please find your invoice attached.",
            "<p>Please find your invoice attached.</p>",
            [{
                filename: "invoice.pdf",
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        );

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send email"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email sent successfully"
        });

    } catch (err: any) {
        console.error("❌ Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};