require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function test() {
  console.log("Testing email logic with real .env...");
  
  const result = await sendEmail({
    email: 'test@example.com', // Dummy email, just checking if Nodemailer auth succeeds and doesn't crash.
    subject: 'Test Email',
    message: 'This is a test'
  });
  
  console.log('Result:', result);
}

test();
