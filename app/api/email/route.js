import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const { twinData, email } = await request.json();

    const recipient = email || 'user@example.com';
    const safeTwinData = twinData || {};
    
    // Mapping properties to an HTML list string
    const htmlListItems = Object.entries(safeTwinData)
      .filter(([_, v]) => v)
      .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
      .join("");

    const emailMarkup = `
        <h1>Your ET Financial Twin</h1>
        <p>Hi there,</p>
        <p>Here is a summary of your personal Financial Twin created by the ET Concierge:</p>
        <ul>
          ${htmlListItems}
        </ul>
        <br/>
        <p>Ready to explore the best ET products for you? <a href="https://economictimes.indiatimes.com">Visit the Economic Times</a></p>
      `;

    // Hackathon Requirement: Transactional Email via Resend
    if (resend) {
      console.log(`[Resend] Dispatching live email to ${recipient}`);
      await resend.emails.send({
        from: 'ET Concierge <onboarding@resend.dev>',
        to: [recipient],
        subject: 'Your Financial Twin Summary',
        html: emailMarkup
      });
    } else {
      console.log(`[Resend] Simulating email delivery to ${recipient} (Add RESEND_API_KEY to switch to live mode)`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${recipient}`,
      mockEmailHtml: emailMarkup,
    });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
