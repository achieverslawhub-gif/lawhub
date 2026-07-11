import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM_EMAIL;

  let subject = "New notification — Achievers Law Hub";
  let html = "";

  if (body.type === "researcher_request") {
    subject = `New researcher request: ${body.topic}`;
    html = `
      <h2>New Researcher Engagement Request</h2>
      <p><strong>Client:</strong> ${body.client_name} (${body.email})</p>
      <p><strong>Topic:</strong> ${body.topic}</p>
      <p><strong>Duration requested:</strong> ${body.duration}</p>
      <p><strong>Brief:</strong> ${body.description}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin">Review in Admin Dashboard</a></p>
    `;
  } else if (body.type === "tutorial_booking") {
    subject = `New tutorial booking: ${body.subject}`;
    html = `
      <h2>New Tutorial Booking</h2>
      <p><strong>Student:</strong> ${body.student_name} (${body.email})</p>
      <p><strong>Subject:</strong> ${body.subject}</p>
      <p><strong>Type:</strong> ${body.student_type}</p>
      <p><strong>Hours:</strong> ${body.hours}</p>
      <p><strong>Charge:</strong> ${body.currency}${body.total}</p>
      <p><strong>Preferred time:</strong> ${body.preferred_time}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin">Review in Admin Dashboard</a></p>
    `;
  }

  try {
    await resend.emails.send({ from, to, subject, html });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Non-fatal: the booking/request is already saved in the database even
    // if the email fails (e.g. Resend not yet configured).
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
