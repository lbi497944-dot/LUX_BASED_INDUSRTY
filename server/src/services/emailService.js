import { getTransporter, getIsEmailConfigured } from '../config/email.js';

const getNotificationRecipient = () => {
  return process.env.ADMIN_NOTIFICATION_EMAIL || null;
};

const getSenderAddress = () => {
  return process.env.EMAIL_FROM || 'Veloura Lighting <no-reply@veloura-lighting.com>';
};

/**
 * Send Contact Enquiry notification email to administrator
 */
export const sendContactNotification = async (enquiry) => {
  const recipient = getNotificationRecipient();
  if (!recipient || !getIsEmailConfigured()) {
    console.warn('[Email Warning] Outbound contact notification skipped: SMTP is unavailable or recipient is not configured.');
    return;
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Email Warning] Outbound contact notification skipped: No active transporter.');
    return;
  }

  try {
    const clientName = enquiry.name || 'Anonymous Visitor';
    const clientEmail = enquiry.email || 'N/A';
    const clientPhone = enquiry.phone || 'N/A';
    const projectType = enquiry.projectType || 'General Enquiry';
    const location = enquiry.location || 'N/A';
    const message = enquiry.message || 'No message provided.';

    const htmlContent = `
      <div style="font-family: 'Cormorant Garamond', Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #FAF8F1; padding: 32px; border: 1px solid #e0d8c3; color: #1a1a1a;">
        <div style="text-align: center; border-bottom: 2px solid #C9A227; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #15391d; letter-spacing: 0.15em; font-size: 24px; margin: 0;">VELOURA LIGHTING</h1>
          <p style="color: #C9A227; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin: 4px 0 0;">New Contact Enquiry</p>
        </div>
        
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6;">
          <p>A new architectural enquiry has been submitted through the Veloura web platform.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #ffffff; border: 1px solid #e8e3d5;">
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d; width: 35%;">Client Name:</td>
              <td style="padding: 10px 14px;">${clientName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Email Address:</td>
              <td style="padding: 10px 14px;"><a href="mailto:${clientEmail}" style="color: #15391d;">${clientEmail}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Phone Number:</td>
              <td style="padding: 10px 14px;">${clientPhone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Project Type:</td>
              <td style="padding: 10px 14px;">${projectType}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Location:</td>
              <td style="padding: 10px 14px;">${location}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d; vertical-align: top;">Message:</td>
              <td style="padding: 10px 14px; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #777; margin-top: 24px; text-align: center;">
            This is an automated notification from the Veloura Lighting administration engine.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: getSenderAddress(),
      to: recipient,
      subject: `[Veloura Lead] New Contact Enquiry: ${clientName}`,
      html: htmlContent,
    });

    console.log('[Email] Contact enquiry notification sent to admin.');
  } catch (error) {
    console.error(`[Email Error] Failed to send contact notification: ${error.message}`);
  }
};

/**
 * Send Private Consultation request notification email to administrator
 */
export const sendConsultationNotification = async (consultation) => {
  const recipient = getNotificationRecipient();
  if (!recipient || !getIsEmailConfigured()) {
    console.warn('[Email Warning] Outbound consultation notification skipped: SMTP is unavailable or recipient is not configured.');
    return;
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Email Warning] Outbound consultation notification skipped: No active transporter.');
    return;
  }

  try {
    const fullName = consultation.fullName || 'VIP Client';
    const email = consultation.email || 'N/A';
    const phone = consultation.phone || consultation.whatsapp || 'N/A';
    const location = consultation.projectLocation || 'N/A';
    const projectType = consultation.projectType || 'N/A';
    const projectStage = consultation.projectStage || 'Initial Concept';
    const budget = consultation.estimatedBudget || 'N/A';
    const requirements = consultation.lightingRequirements || 'N/A';
    const message = consultation.message || 'No additional notes.';

    const attachmentCount = consultation.attachments ? consultation.attachments.length : 0;
    const attachmentDetails = attachmentCount > 0
      ? consultation.attachments.map((att) => `<li><a href="${att.url}">${att.filename || 'Architectural Plan'}</a> (${att.mimeType || 'Document'})</li>`).join('')
      : 'None provided';

    const htmlContent = `
      <div style="font-family: 'Cormorant Garamond', Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #FAF8F1; padding: 32px; border: 1px solid #e0d8c3; color: #1a1a1a;">
        <div style="text-align: center; border-bottom: 2px solid #C9A227; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #15391d; letter-spacing: 0.15em; font-size: 24px; margin: 0;">VELOURA LIGHTING</h1>
          <p style="color: #C9A227; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin: 4px 0 0;">VIP Consultation Booking</p>
        </div>
        
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6;">
          <p>A new private architectural lighting consultation has been booked.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #ffffff; border: 1px solid #e8e3d5;">
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d; width: 35%;">Client Name:</td>
              <td style="padding: 10px 14px;">${fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Email Address:</td>
              <td style="padding: 10px 14px;"><a href="mailto:${email}" style="color: #15391d;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Phone / WhatsApp:</td>
              <td style="padding: 10px 14px;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Project Location:</td>
              <td style="padding: 10px 14px;">${location}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Project Type & Stage:</td>
              <td style="padding: 10px 14px;">${projectType} (${projectStage})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Estimated Budget:</td>
              <td style="padding: 10px 14px;">${budget}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Requirements:</td>
              <td style="padding: 10px 14px;">${requirements}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ecdf;">
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d;">Attachments (${attachmentCount}):</td>
              <td style="padding: 10px 14px;"><ul style="margin: 0; padding-left: 18px;">${attachmentDetails}</ul></td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: 600; color: #15391d; vertical-align: top;">Notes / Brief:</td>
              <td style="padding: 10px 14px; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #777; margin-top: 24px; text-align: center;">
            This is an automated notification from the Veloura Lighting administration engine.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: getSenderAddress(),
      to: recipient,
      subject: `[Veloura Consultation] Booking from ${fullName}`,
      html: htmlContent,
    });

    console.log('[Email] Consultation booking notification sent to admin.');
  } catch (error) {
    console.error(`[Email Error] Failed to send consultation notification: ${error.message}`);
  }
};
