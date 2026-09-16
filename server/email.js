import { Resend } from 'resend';

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Password reset email delivery is not configured');
    }
    return null;
  }

  const from = process.env.RESET_EMAIL_FROM;
  const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');

  if (!from || !frontendUrl) {
    throw new Error('Password reset email delivery is not fully configured');
  }

  return { apiKey, from, frontendUrl };
}

export async function sendPasswordResetEmail({ email, token }) {
  const config = getEmailConfig();
  if (!config) {
    console.warn('Password reset email delivery is not configured; configure Resend for development testing.');
    return;
  }

  const resetUrl = `${config.frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: email,
    subject: 'Reset your Academic Organizer password',
    text: `Use this link to reset your password: ${resetUrl}\n\nThis link expires in 15 minutes and can only be used once.`,
  });

  if (error) {
    throw new Error('Password reset email delivery failed');
  }
}
