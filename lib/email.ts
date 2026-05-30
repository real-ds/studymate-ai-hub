import nodemailer from "nodemailer"

const OTP_EXPIRY_MINUTES = 10

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
}

function getTransporter() {
  const pass = process.env.SMTP_PASS
  if (!pass) return null

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "divyanshu.vitc@gmail.com",
      pass,
    },
  })
}

const otpEmailHtml = (otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background-color:#FAF8F4;font-family:Inter,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E0D6;">
          <tr>
            <td style="padding:40px 32px 32px;text-align:center;">
              <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:600;color:#1C1C1E;margin:0 0 8px;">StudyMate AI HUB</h1>
              <p style="font-size:14px;color:#6B6B6B;margin:0 0 24px;">Password Reset OTP</p>
              <p style="font-size:13px;color:#1C1C1E;margin:0 0 24px;line-height:1.6;">
                Use the following OTP to reset your password. It expires in ${OTP_EXPIRY_MINUTES} minutes.
              </p>
              <div style="background:#F5F3EE;border-radius:8px;padding:16px 32px;margin:0 auto 24px;display:inline-block;letter-spacing:8px;font-size:32px;font-weight:700;color:#1C1C1E;">
                ${otp}
              </div>
              <p style="font-size:12px;color:#6B6B6B;margin:0;line-height:1.5;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const transporter = getTransporter()

  if (!transporter) {
    console.log("SMTP_PASS not set. Logging OTP to server console:")
    console.log(`To: ${email}, OTP: ${otp}`)
    return
  }

  try {
    await transporter.sendMail({
      from: "StudyMate AI HUB <divyanshu.vitc@gmail.com>",
      to: email,
      subject: "Your OTP for password reset",
      html: otpEmailHtml(otp),
    })
  } catch (error) {
    console.error("Failed to send OTP email:", error)
  }
}
