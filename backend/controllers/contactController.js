/**
 * Sends contact-form emails using Brevo's transactional Email API (HTTPS),
 * NOT SMTP. Render's free tier blocks outbound SMTP ports (25/465/587),
 * but plain HTTPS requests like this are unaffected.
 *
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * POST /api/contact
 * Expects req.contactData to already be validated & sanitized
 * (see middleware/validateContact.js).
 */
async function sendContactEmail(req, res) {
  try {
    const { name, email, subject, message } = req.contactData;

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long',
    });

    const emailPayload = {
      sender: {
        name: 'Portfolio Contact Form',
        email: process.env.BREVO_SENDER_EMAIL, // must be a verified sender in your Brevo account
      },
      to: [{ email: process.env.EMAIL_TO }],
      replyTo: { email, name },
      subject: `New Portfolio Message: ${subject}`,
      textContent: [
        `You've received a new message from your portfolio contact form.`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        ``,
        `Message:`,
        message,
        ``,
        `---`,
        `Date & Time: ${timestamp}`,
        `IP Address: ${ip}`,
        `Browser: ${userAgent}`,
      ].join('\n'),
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color:#111;">
          <h2 style="color:#D4AF37;">New Portfolio Contact Message</h2>
          <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding:8px 0; font-weight:bold; width:120px;">Name</td><td>${name}</td></tr>
            <tr><td style="padding:8px 0; font-weight:bold;">Email</td><td>${email}</td></tr>
            <tr><td style="padding:8px 0; font-weight:bold;">Subject</td><td>${subject}</td></tr>
          </table>
          <p style="font-weight:bold; margin-bottom:4px;">Message:</p>
          <p style="white-space:pre-wrap; background:#f5f5f5; padding:12px; border-radius:8px;">${message}</p>
          <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;" />
          <p style="font-size:12px; color:#666;">
            Date &amp; Time: ${timestamp}<br/>
            IP Address: ${ip}<br/>
            Browser: ${userAgent}
          </p>
        </div>
      `,
    };

    const brevoResponse = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text();
      console.error('Brevo API error:', brevoResponse.status, errorBody);
      throw new Error(`Brevo API responded with ${brevoResponse.status}`);
    }

    return res.status(200).json({
      success: true,
      message: "Thank you! Your message has been sent successfully. I'll get back to you soon.",
    });
  } catch (err) {
    console.error('Error sending contact email:', err);
    return res.status(500).json({
      success: false,
      message: 'Sorry! Something went wrong. Please try again later.',
    });
  }
}

module.exports = { sendContactEmail };
