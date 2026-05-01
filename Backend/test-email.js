require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function test() {
  console.log("Testing email logic (mock credentials)...");
  
  process.env.EMAIL_USER = 'fake@example.com';
  process.env.EMAIL_PASS = 'fakepass';
  process.env.SMTP_HOST = 'smtp.fake.com';
  process.env.SMTP_PORT = '587';
  
  const result = await sendEmail({
    email: 'test@example.com',
    subject: 'Test Email',
    message: 'This is a test'
  });
  
  console.log('Result:', result);
}

test();
