import transporter from "#config/nodemailer.js";

export const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"EduVerse Support" <${process.env.MAIL_FROM}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new AppError(
      "Could not send email. Please try again later.",
      500,
      null,
      { cause: error }
    );
  }
};

export const sendVerificationEmail = async (to, name, otp) => {
  const subject = "Verify your EduVerse Account";
  const html = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Welcome to EduVerse, ${name}!</h2>
        <p>Please use the following code to verify your email address:</p>
        <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
        <p>This code is valid for <b>10 minutes</b>.</p>
        <hr />
        <p style="font-size: 0.8rem; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
  return await sendEmail(to, subject, html);
};

export const sendPasswordResetEmail = async (to, name, otp) => {
  const subject = "Password Reset Request";
  const html = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Hi ${name},</h2>
        <p>You requested a password reset. Your recovery code is:</p>
        <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
        <p>Code expires after <b>10 minutes</b>. Enter this code to continue.</p>
        <hr />
        <p style="font-size: 0.8rem; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
  return await sendEmail(to, subject, html);
};

export const sendReactivationEmail = async (to, name, otp) => {
  const subject = "Reactivate your EduVerse Account";
  const html = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Welcome back to EduVerse, ${name}!</h2>
        <p>We received a request to reactivate your account. Please use the code below to sign back in:</p>
        <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
        <p>This code is valid for <b>10 minutes</b>. Once verified, your account will be restored.</p>
        <hr />
        <p style="font-size: 0.8rem; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
  return await sendEmail(to, subject, html);
};