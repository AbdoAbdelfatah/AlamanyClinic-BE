import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
export const sendVerificationEmail = async (email, token, firstName) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.APP_NAME || "Alamany Dental Clinic",
    },
    subject: "Verify Your Account",
    templateId: process.env.TEMPLATE_ID,
    dynamicTemplateData: { name: firstName, button_url: verificationUrl },
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
