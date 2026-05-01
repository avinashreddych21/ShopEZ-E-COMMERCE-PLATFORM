const nodemailer = require('nodemailer');

const getTransportConfig = () => {
  const {
    EMAIL_USER,
    EMAIL_PASS,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
  } = process.env;

  if (SMTP_HOST && SMTP_PORT && EMAIL_USER && EMAIL_PASS) {
    return {
      ready: true,
      config: {
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      },
      from: `ShopEZ <${EMAIL_USER}>`,
    };
  }

  if (EMAIL_USER && EMAIL_PASS) {
    return {
      ready: true,
      config: {
        service: 'Gmail',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      },
      from: `ShopEZ <${EMAIL_USER}>`,
    };
  }

  return {
    ready: false,
    reason: 'Email credentials are not configured.',
    from: 'ShopEZ <no-reply@shopez.local>',
  };
};

const sendEmail = async (options) => {
  const transport = getTransportConfig();

  if (!transport.ready) {
    console.warn(`Email skipped for ${options.email}: ${transport.reason}`);
    return {
      skipped: true,
      reason: transport.reason,
    };
  }

  try {
    const transporter = nodemailer.createTransport(transport.config);
    await transporter.sendMail({
      from: transport.from,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    });

    return { skipped: false };
  } catch (error) {
    console.error('Email could not be sent:', error.message);
    return { skipped: true, reason: error.message };
  }
};

module.exports = sendEmail;
