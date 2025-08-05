import nodemailer from 'nodemailer';
import { renderAsync } from '@react-email/render';
import { ResetPasswordEmail } from '@/emails/ResetPasswordEmail';
import { isValidElement } from 'react';

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('Email credentials not configured. Emails will not be sent in development.');
}

// Configure Nodemailer with environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  try {
    // Create the email component
    const emailComponent = ResetPasswordEmail({ otp });
    
    // Ensure the component is a valid React element
    if (!isValidElement(emailComponent)) {
      throw new Error('Failed to create email component');
    }
    
    // Render the React email component to HTML asynchronously
    const emailHtml = await renderAsync(emailComponent, {
      pretty: true,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending email:', errorMessage);
    return { 
      success: false, 
      error: 'Failed to send password reset email. Please try again later.' 
    };
  }
};
