import { Request, Response } from "express";
import dotenv from "dotenv";
import { sendMail } from "../util/mailer";
dotenv.config();

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`📧 Sending OTP to ${email}: ${otp}`);

        // EMAIL TEMPLATE - EXACTLY LIKE SPOTIFY STYLE
        const subject = "Your verification code";
        const text = `Hi,

Enter this code to continue logging in without a password:

${otp}

This code is valid for 10 minutes and can only be used once. By entering this code, you will also confirm the email address associated with your account.

If you didn't attempt to log in, you can safely ignore this email.

Best regards,
MYBIZ - Your Business Managing Partner`;

        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #333;">
                <p style="margin-bottom: 24px; font-size: 16px; line-height: 1.5;">Hi,</p>
                
                <p style="margin-bottom: 24px; font-size: 16px; line-height: 1.5;">Enter this code to continue logging in without a password:</p>
                
                <div style="background-color: #f5f5f5; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                    <span style="font-size: 40px; font-weight: 600; letter-spacing: 8px; color: #1a1a1a; font-family: 'Courier New', monospace;">${otp}</span>
                </div>
                
                <p style="margin-bottom: 24px; font-size: 16px; line-height: 1.5; color: #666;">
                    This code is valid for <strong>10 minutes</strong> and can only be used once. By entering this code, you will also confirm the email address associated with your account.
                </p>
                
                <p style="margin-bottom: 24px; font-size: 16px; line-height: 1.5; color: #666;">
                    If you didn't attempt to log in, you can safely ignore this email.
                </p>
                
                <p style="margin-bottom: 8px; font-size: 16px; line-height: 1.5;">Best regards,</p>
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5; font-weight: 500;">MYBIZ - Your Business Managing Partner</p>
                
                <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 32px 0 24px;">
                
                <p style="font-size: 14px; color: #999; line-height: 1.5;">
                    This email was sent to ${email}. If you didn't request this code, please ignore this email.
                </p>
            </div>
        `;

        // Send email using your existing mailer
        const emailSent = await sendMail(email, subject, text, html);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email"
            });
        }

        console.log(`✅ OTP sent successfully to ${email}`);

        // ⚠️ REMOVE otp FROM RESPONSE IN PRODUCTION!
        return res.status(200).json({
            success: true,
            message: "Verification code sent successfully",
            email: email,
            otp: otp
        });

    } catch (err) {
        console.error("❌ Error in sendOtp:", err);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });
    }
};