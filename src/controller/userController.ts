import { Request, Response } from "express";
import dotenv from "dotenv";
import { sendMail } from "../util/mailer";
import axios from "axios";

dotenv.config();

export const sendBill = async (req: Request, res: Response) => {
    try {
        const {
            to,
            customerName,
            invoiceNumber,
            cloudinaryUrl,
            paymentStatus, // 'full', 'due', 'partial'
            orderDetails
        } = req.body;

        console.log("📧 Sending bill email to:", to);

        // ✅ Validate required fields
        if (!to || !cloudinaryUrl || !invoiceNumber || !paymentStatus) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: to, cloudinaryUrl, invoiceNumber, paymentStatus",
            });
        }

        // ✅ Download PDF from Cloudinary
        console.log("📥 Downloading PDF from Cloudinary...");
        const pdfResponse = await axios.get(cloudinaryUrl, {
            responseType: 'arraybuffer'
        });

        const pdfBuffer = Buffer.from(pdfResponse.data);

        // ✅ Get email content based on payment status
        const { subject, text, html } = getEmailContent({
            paymentStatus,
            customerName,
            invoiceNumber,
            orderDetails
        });

        // ✅ Send email with attachment
        console.log("📨 Sending email with attachment...");
        const emailSent = await sendMail(
            to,
            subject,
            text,
            html,
            [{
                filename: `invoice_${invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        );

        if (!emailSent) {
            console.log("❌ Failed to send bill email");
            return res.status(500).json({
                success: false,
                message: "Failed to send bill email",
            });
        }

        console.log("✅ Bill email sent successfully to:", to);
        return res.status(200).json({
            success: true,
            message: "Bill sent successfully",
            email: to,
            invoiceNumber: invoiceNumber,
            paymentStatus: paymentStatus
        });

    } catch (err: any) {
        console.error("❌ Error in sendBill:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Server error. Please try again.",
        });
    }
};

// Helper function to generate email content based on payment status
const getEmailContent = ({
                             paymentStatus,
                             customerName,
                             invoiceNumber,
                             orderDetails
                         }: any) => {

    const baseText = `Dear ${customerName || 'Valued Customer'},\n\n`;

    // Payment status templates
    const templates: Record<string, any> = {
        full: {
            subject: `✓ Payment Received - Invoice #${invoiceNumber} from MYBIZ`,
            text: baseText +
                `Thank you for your payment! Your invoice #${invoiceNumber} has been fully paid.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `PAYMENT DETAILS\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Status: FULLY PAID\n` +
                `Amount: Rs ${orderDetails?.total || 'N/A'}\n` +
                `Payment Method: ${orderDetails?.paymentMethod || 'N/A'}\n` +
                `Date: ${new Date().toLocaleDateString()}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `Please find your receipt attached.\n\n` +
                `Thank you for your business!\n\n` +
                `Best regards,\nMYBIZ Team`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
                        <h1 style="font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 1px;">MYBIZ</h1>
                        <p style="font-size: 12px; color: #666; margin: 5px 0 0;">One app. Every Business.</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <span style="background: #e8f5e9; color: #2e7d32; padding: 8px 20px; border-radius: 30px; font-size: 14px; font-weight: 600; border: 1px solid #2e7d32;">✓ FULLY PAID</span>
                    </div>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">Dear ${customerName || 'Valued Customer'},</p>
                    
                    <p style="margin-bottom: 25px; font-size: 16px;">Thank you for your payment! Your invoice <strong>#${invoiceNumber}</strong> has been fully paid.</p>
                    
                    <div style="background-color: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Payment Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Status:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #2e7d32;">FULLY PAID</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Amount:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">Rs ${orderDetails?.total || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${orderDetails?.paymentMethod || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Date:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${new Date().toLocaleDateString()}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">Please find your receipt attached.</p>
                    
                    <p style="margin-bottom: 25px; font-size: 16px;">Thank you for your business!</p>
                    
                    <p style="margin-bottom: 8px; font-size: 16px;">Best regards,</p>
                    <p style="margin-top: 0; font-size: 16px; font-weight: 600;">MYBIZ Team</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #888;">
                        <p>96 D/1 Namaluwa, Kothalawala, Bandaragama<br>
                        Tel: +94 78 713 5526 | Email: Dinuka0512@gmail.com</p>
                        <p style="font-size: 10px;">This is a computer generated invoice. No signature required.</p>
                    </div>
                </div>
            `
        },

        due: {
            subject: `⚠️ Payment Due - Invoice #${invoiceNumber} from MYBIZ`,
            text: baseText +
                `Your invoice #${invoiceNumber} has been created with payment due.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `INVOICE DETAILS\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Status: PAYMENT DUE\n` +
                `Total Amount: Rs ${orderDetails?.total || 'N/A'}\n` +
                `Due Amount: Rs ${orderDetails?.dueAmount || orderDetails?.total || 'N/A'}\n` +
                `Due Date: ${orderDetails?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `Please find your invoice attached.\n\n` +
                `Please make the payment at your earliest convenience.\n\n` +
                `If you have any questions, please contact us.\n\n` +
                `Best regards,\nMYBIZ Team`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
                        <h1 style="font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 1px;">MYBIZ</h1>
                        <p style="font-size: 12px; color: #666; margin: 5px 0 0;">One app. Every Business.</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <span style="background: #fff3e0; color: #e65100; padding: 8px 20px; border-radius: 30px; font-size: 14px; font-weight: 600; border: 1px solid #e65100;">⚠️ PAYMENT DUE</span>
                    </div>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">Dear ${customerName || 'Valued Customer'},</p>
                    
                    <p style="margin-bottom: 25px; font-size: 16px;">Your invoice <strong>#${invoiceNumber}</strong> has been created with payment due.</p>
                    
                    <div style="background-color: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Invoice Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Status:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #e65100;">PAYMENT DUE</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Total Amount:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">Rs ${orderDetails?.total || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Due Amount:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #e65100;">Rs ${orderDetails?.dueAmount || orderDetails?.total || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Due Date:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${orderDetails?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">Please find your invoice attached.</p>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">Please make the payment at your earliest convenience.</p>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">If you have any questions, please contact us.</p>
                    
                    <p style="margin-bottom: 8px; font-size: 16px;">Best regards,</p>
                    <p style="margin-top: 0; font-size: 16px; font-weight: 600;">MYBIZ Team</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #888;">
                        <p>96 D/1 Namaluwa, Kothalawala, Bandaragama<br>
                        Tel: +94 78 713 5526 | Email: Dinuka0512@gmail.com</p>
                    </div>
                </div>
            `
        },

        partial: {
            subject: `⏳ Partial Payment - Invoice #${invoiceNumber} from MYBIZ`,
            text: baseText +
                `A partial payment has been received for invoice #${invoiceNumber}.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `PAYMENT DETAILS\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Status: PARTIALLY PAID\n` +
                `Total Amount: Rs ${orderDetails?.total || 'N/A'}\n` +
                `Paid Amount: Rs ${orderDetails?.paidAmount || 'N/A'}\n` +
                `Remaining Due: Rs ${orderDetails?.dueAmount || 'N/A'}\n` +
                `Payment Method: ${orderDetails?.paymentMethod || 'N/A'}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `Please find your invoice attached.\n\n` +
                `Thank you for the partial payment. The remaining balance is due.\n\n` +
                `Best regards,\nMYBIZ Team`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
                        <h1 style="font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 1px;">MYBIZ</h1>
                        <p style="font-size: 12px; color: #666; margin: 5px 0 0;">One app. Every Business.</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <span style="background: #e3f2fd; color: #1565c0; padding: 8px 20px; border-radius: 30px; font-size: 14px; font-weight: 600; border: 1px solid #1565c0;">⏳ PARTIALLY PAID</span>
                    </div>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">Dear ${customerName || 'Valued Customer'},</p>
                    
                    <p style="margin-bottom: 25px; font-size: 16px;">A partial payment has been received for invoice <strong>#${invoiceNumber}</strong>.</p>
                    
                    <div style="background-color: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Payment Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Status:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1565c0;">PARTIALLY PAID</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Total Amount:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">Rs ${orderDetails?.total || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Paid Amount:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #2e7d32;">Rs ${orderDetails?.paidAmount || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Remaining Due:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #e65100;">Rs ${orderDetails?.dueAmount || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${orderDetails?.paymentMethod || 'N/A'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">Please find your invoice attached.</p>
                    
                    <p style="margin-bottom: 20px; font-size: 16px;">Thank you for the partial payment. The remaining balance is due.</p>
                    
                    <p style="margin-bottom: 8px; font-size: 16px;">Best regards,</p>
                    <p style="margin-top: 0; font-size: 16px; font-weight: 600;">MYBIZ Team</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #888;">
                        <p>96 D/1 Namaluwa, Kothalawala, Bandaragama<br>
                        Tel: +94 78 713 5526 | Email: Dinuka0512@gmail.com</p>
                    </div>
                </div>
            `
        }
    };

    return templates[paymentStatus] || templates.full;
};