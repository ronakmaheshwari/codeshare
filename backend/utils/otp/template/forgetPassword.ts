const ForgotPasswordOTPEmailTemplate = (email: string, otp: string | number) => `
  <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f9f9f9; padding: 40px; margin: 0;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 40px 30px; border-radius: 12px; border: 1px solid #e5e7eb;">

      <!-- Header / Logo -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 26px; color: #111111; font-weight: 700; letter-spacing: 0.5px;">
          CODE SHARE
        </h1>
        <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">
          Your Favourite Code Share Platform
        </p>
      </div>

      <!-- Greeting -->
      <h2 style="color: #111111; font-weight: 600; font-size: 20px; margin-bottom: 16px;">
        Hello ${email},
      </h2>

      <!-- Main Message -->
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
        We received a request to reset your <strong>CODE SHARE</strong> account password.
        Please use the One-Time Password (OTP) below to proceed.
      </p>

      <!-- OTP Box -->
      <div style="text-align: center; margin: 36px 0;">
        <span style="
          display: inline-block;
          background-color: #111111;
          color: #ffffff;
          padding: 18px 40px;
          font-size: 24px;
          font-weight: 700;
          border-radius: 8px;
          letter-spacing: 4px;
        ">
          ${otp}
        </span>
      </div>

      <!-- OTP Info -->
      <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 32px; text-align: center;">
        This OTP is valid for the next <strong>10 minutes</strong>.<br />
        Please do not share this code with anyone.
      </p>

      <!-- Security Notice -->
      <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 32px; text-align: center;">
        If you did not request a password reset, you can safely ignore this email.
        Your account will remain secure.
      </p>

      <!-- Divider -->
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

      <!-- Footer -->
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
        Sent securely by <strong>CODE SHARE</strong> • Your Favourite Code Share Platform
      </p>
    </div>
  </div>
`;

export default ForgotPasswordOTPEmailTemplate;