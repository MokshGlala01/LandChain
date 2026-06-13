import { sendOtp } from './lib/sms'

async function run() {
  console.log('Testing sendOtp via SMS module...')
  try {
    const result = await sendOtp('9876543210')
    console.log('Result:', result)
  } catch (err) {
    console.error('Error running test:', err)
  }
}

run()
