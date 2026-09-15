import nodemailer from 'nodemailer';

let transporter;

function getEmailConfig() {
  const host = process.env.RESET_EMAIL_HOST;
  if (!host) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Password reset email delivery is not configured');
    }
    return null;
  }

  const port = Number(process.env.RESET_EMAIL_PORT) || (process.env.NODE_ENV === 'production' ? 587 : 1025);
  const user = process.env.RESET_EMAIL_USER;
  const password = process.env.RESET_EMAIL_PASSWORD;
  const from = process.env.RESET_EMAIL_FROM;
  const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');

  if (!from || !frontendUrl || (process.env.NODE_ENV === 'production' && (!user || !password))) {
    throw new Error('Password reset email delivery is not fully configured');
  }

  return { host, port, user, password, from, frontendUrl };
}

function getTransporter(config) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail({ email, token }) {
  const config = getEmailConfig();
  if (!config) {
    console.warn('Password reset email delivery is not configured; configure a local SMTP catcher for development testing.');
    return;
  }

  const resetUrl = `${config.frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  await getTransporter(config).sendMail({
    from: config.from,
    to: email,
    subject: 'Reset your Academic Organizer password',
    text: `Use this link to reset your password: ${resetUrl}\n\nThis link expires in 15 minutes and can only be used once.`,
  });
}
