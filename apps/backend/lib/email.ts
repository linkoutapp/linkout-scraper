import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = 'w8list';

export async function sendWelcomeEmail({
  to,
  projectName,
  position,
  referralCode,
  waitlistUrl,
}: {
  to: string;
  projectName: string;
  position: number;
  referralCode: string;
  waitlistUrl: string;
}) {
  const referralLink = `${waitlistUrl}?ref=${referralCode}`;

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `You're #${position} on the ${projectName} waitlist`,
      html: `
        <div style="font-family: Inter, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1C1B18; margin-bottom: 8px;">You're in.</h1>
          <p style="font-size: 16px; color: #6b7280; margin-bottom: 24px;">
            You're <strong style="color: #1C1B18;">#${position}</strong> on the <strong style="color: #1C1B18;">${projectName}</strong> waitlist.
          </p>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Share your link to move up:</p>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
            <a href="${referralLink}" style="color: #1C1B18; font-size: 14px; word-break: break-all;">${referralLink}</a>
          </div>
          <p style="font-size: 12px; color: #9ca3af;">Sent by w8list on behalf of ${projectName}.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendVerificationEmail({
  to,
  projectName,
  verificationToken,
  baseUrl,
}: {
  to: string;
  projectName: string;
  verificationToken: string;
  baseUrl: string;
}) {
  const verifyUrl = `${baseUrl}/api/v1/verify?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `Verify your email for ${projectName}`,
      html: `
        <div style="font-family: Inter, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1C1B18; margin-bottom: 8px;">Verify your email</h1>
          <p style="font-size: 16px; color: #6b7280; margin-bottom: 24px;">
            Click the button below to confirm your spot on the <strong style="color: #1C1B18;">${projectName}</strong> waitlist.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: #1C1B18; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Verify Email
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">If you didn't sign up, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}
