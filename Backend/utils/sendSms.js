const twilio = require('twilio');

const sendSms = async ({ phone, message }) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.warn('Twilio credentials not found in .env. Skipping SMS.');
      return;
    }

    const client = twilio(accountSid, authToken);

    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to: phone
    });

    console.log(`Twilio SMS sent to ${phone}: SID ${response.sid}`);
    return response;
  } catch (error) {
    console.error(`Error sending Twilio SMS to ${phone}:`, error.message);
    throw new Error('SMS failed to send');
  }
};

module.exports = sendSms;
