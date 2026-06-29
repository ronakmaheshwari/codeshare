import dotenv from "dotenv"
dotenv.config();
import { Resend } from "resend";
import ForgotPasswordOTPEmailTemplate from "./template/forgetPassword";

const apiKey = process.env.RESEND_API_KEY;
if(!apiKey) {
    throw new Error("Missing RESEND_API_KEY in environment");
}

const fromEmail = process.env.RESEND_EMAIL_DOMAIN;
if(!fromEmail) {
    throw new Error("Missing RESEND_EMAIL_DOMAIN in environment");
}

const resend = new Resend(apiKey);

export const sendEmailOtp = async (email: string, otp: string) => {
    try {
        const html = ForgotPasswordOTPEmailTemplate(email, otp);
        const subject = "Reset Your Password – OTP Code";
        await resend.emails.send({
            from: fromEmail,
            subject: subject,
            html: html,
            to: email
        })
    } catch (error) {
        console.log(error);
    }
}