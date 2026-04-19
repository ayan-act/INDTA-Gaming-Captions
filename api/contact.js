import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check if SMTP environment variables are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(500).json({ error: "SMTP server is not configured on the server." });
    }

    const port = parseInt(process.env.SMTP_PORT || "587");
    const isSecure = port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    try {
        await transporter.verify();
    } catch (verifyError) {
        console.error("SMTP Verification failed:", verifyError);
        return res.status(500).json({ error: "Could not connect to the SMTP server. Please check credentials." });
    }

    await transporter.sendMail({
      from: `"INDTA Gaming Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || "contact@indtanews.com",
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #FF4E00;">New Contact Submission</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p><b>Message:</b></p>
            <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Your message has been sent successfully!" });

  } catch (err) {
    console.error("Email sending error:", err);
    return res.status(500).json({ error: err.message });
  }
}
