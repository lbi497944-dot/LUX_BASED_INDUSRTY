import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import Newsletter from '../models/Newsletter.js';
import { getResendClient, getIsEmailConfigured } from '../config/email.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

/**
 * Server-side HTML & Content Sanitizer
 * Strips active scripts, iframes, objects, styles, event handlers, and dangerous protocols
 */
export const sanitizeNewsletterContent = (html) => {
  if (!html || typeof html !== 'string') return '';

  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  clean = clean.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  clean = clean.replace(/href\s*=\s*["']?\s*(?:javascript|vbscript|data):[^"'>\s]*/gi, 'href="#"');
  clean = clean.replace(/src\s*=\s*["']?\s*(?:javascript|vbscript):[^"'>\s]*/gi, "");

  clean = clean.replace(/\son[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  return clean.trim();
};

/**
 * Subscriber operations
 */
export const subscribeNewsletter = async (email, source = 'footer') => {
  const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    if (existing.status === 'Unsubscribed') {
      existing.status = 'Subscribed';
      await existing.save();
      return { subscriber: existing, message: 'Welcome back! You have been re-subscribed.' };
    }
    return { subscriber: existing, message: 'You are already subscribed to LUX BASED INDUSTRY insights.' };
  }

  const subscriber = await NewsletterSubscriber.create({
    email: email.toLowerCase().trim(),
    source,
  });

  return { subscriber, message: 'Thank you for subscribing to LUX BASED INDUSTRY updates.' };
};

export const getAllSubscribers = async (queryParams = {}) => {
  const { status, search, page = 1, limit = 100 } = queryParams;

  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }
  if (search && typeof search === 'string') {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.email = { $regex: escapedSearch, $options: 'i' };
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 100;
  const skip = (pageNum - 1) * limitNum;

  const total = await NewsletterSubscriber.countDocuments(filter);
  const subscribers = await NewsletterSubscriber.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  return {
    subscribers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const deleteSubscriber = async (id) => {
  const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
  if (!subscriber) {
    const error = new Error(`Subscriber not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return subscriber;
};

/**
 * Newsletter Campaign Operations
 */
export const getAllNewsletters = async (queryParams = {}) => {
  const { status, page = 1, limit = 20 } = queryParams;

  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const total = await Newsletter.countDocuments(filter);
  const newsletters = await Newsletter.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum)
    .populate('createdBy', 'username email');

  return {
    newsletters,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getNewsletterById = async (id) => {
  const newsletter = await Newsletter.findById(id).populate('createdBy', 'username email');
  if (!newsletter) {
    const error = new Error(`Newsletter not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return newsletter;
};

export const createNewsletter = async (data, adminId) => {
  const sanitizedContent = sanitizeNewsletterContent(data.content);

  const newsletter = await Newsletter.create({
    title: data.title?.trim(),
    subject: data.subject?.trim(),
    previewText: data.previewText?.trim() || '',
    heading: data.heading?.trim() || '',
    content: sanitizedContent,
    imageUrl: data.imageUrl || '',
    imagePublicId: data.imagePublicId || '',
    ctaText: data.ctaText?.trim() || '',
    ctaUrl: data.ctaUrl?.trim() || '',
    attachments: data.attachments || [],
    targetAudience: data.targetAudience || 'all',
    selectedRecipients: (data.selectedRecipients || []).map((e) => e.toLowerCase().trim()),
    status: 'Draft',
    createdBy: adminId || null,
  });

  return newsletter;
};

export const updateNewsletter = async (id, data) => {
  const newsletter = await Newsletter.findById(id);
  if (!newsletter) {
    const error = new Error(`Newsletter not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  if (newsletter.status === 'Sending' || newsletter.status === 'Sent') {
    const error = new Error(`Cannot edit newsletter with status: ${newsletter.status}`);
    error.statusCode = 400;
    throw error;
  }

  if (data.title !== undefined) newsletter.title = data.title.trim();
  if (data.subject !== undefined) newsletter.subject = data.subject.trim();
  if (data.previewText !== undefined) newsletter.previewText = data.previewText.trim();
  if (data.heading !== undefined) newsletter.heading = data.heading.trim();
  if (data.content !== undefined) newsletter.content = sanitizeNewsletterContent(data.content);
  if (data.imageUrl !== undefined) newsletter.imageUrl = data.imageUrl;
  if (data.imagePublicId !== undefined) newsletter.imagePublicId = data.imagePublicId;
  if (data.ctaText !== undefined) newsletter.ctaText = data.ctaText.trim();
  if (data.ctaUrl !== undefined) newsletter.ctaUrl = data.ctaUrl.trim();
  if (data.attachments !== undefined) newsletter.attachments = data.attachments;
  if (data.targetAudience !== undefined) newsletter.targetAudience = data.targetAudience;
  if (data.selectedRecipients !== undefined) {
    newsletter.selectedRecipients = data.selectedRecipients.map((e) => e.toLowerCase().trim());
  }

  if (newsletter.status === 'Send_Failed') {
    newsletter.status = 'Draft';
    newsletter.lastError = '';
  }

  await newsletter.save();
  return newsletter;
};

export const deleteNewsletter = async (id) => {
  const newsletter = await Newsletter.findById(id);
  if (!newsletter) {
    const error = new Error(`Newsletter not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  if (newsletter.status === 'Sending') {
    const error = new Error('Cannot delete a newsletter currently broadcasting.');
    error.statusCode = 400;
    throw error;
  }

  if (newsletter.imagePublicId) {
    await deleteCloudinaryAsset(newsletter.imagePublicId);
  }

  if (newsletter.attachments && newsletter.attachments.length > 0) {
    for (const att of newsletter.attachments) {
      if (att.publicId) {
        await deleteCloudinaryAsset(att.publicId, { resource_type: 'raw' });
      }
    }
  }

  await Newsletter.findByIdAndDelete(id);
  return { id, message: 'Newsletter deleted successfully.' };
};

export const duplicateNewsletter = async (id, adminId) => {
  const original = await Newsletter.findById(id);
  if (!original) {
    const error = new Error(`Newsletter not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  const copy = await Newsletter.create({
    title: `Copy of ${original.title}`,
    subject: original.subject,
    previewText: original.previewText,
    heading: original.heading,
    content: original.content,
    imageUrl: original.imageUrl,
    imagePublicId: original.imagePublicId,
    ctaText: original.ctaText,
    ctaUrl: original.ctaUrl,
    attachments: original.attachments,
    targetAudience: original.targetAudience,
    selectedRecipients: original.selectedRecipients,
    status: 'Draft',
    createdBy: adminId || null,
  });

  return copy;
};

/**
 * Render Responsive Luxury Email HTML Template
 */
export const renderNewsletterHtml = (newsletter, recipientEmail = '') => {
  const heading = newsletter.heading || newsletter.subject || 'LUX BASED INDUSTRY';
  const preview = newsletter.previewText || '';
  const content = newsletter.content || '';
  const imageUrl = newsletter.imageUrl || '';
  const ctaText = newsletter.ctaText || '';
  const ctaUrl = newsletter.ctaUrl || '';
  const attachments = newsletter.attachments || [];

  const attachmentsList = attachments.length > 0
    ? `<div style="margin-top: 28px; padding: 16px 20px; background-color: #F6F3EB; border: 1px solid #E0D8C3; border-radius: 2px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 13px; color: #15391D; letter-spacing: 0.05em; text-transform: uppercase;">Attached Architectural Documents</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #333333;">` +
      attachments
        .map((att) => `<li style="margin-bottom: 4px;"><a href="${att.url}" target="_blank" style="color: #15391D; text-decoration: underline; font-weight: 500;">${att.filename || 'Document'}</a> ${att.size ? '(' + Math.round(att.size / 1024) + ' KB)' : ''}</li>`)
        .join('') +
      `</ul></div>`
    : '';

  const ctaButton = ctaText && ctaUrl
    ? `<div style="text-align: center; margin: 36px 0 20px 0;"><a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #15391D; color: #FAF8F1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border: 1px solid #C9A227; border-radius: 2px;">${ctaText}</a></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.subject}</title>
  ${preview ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">${preview}</div>` : ''}
</head>
<body style="margin: 0; padding: 0; background-color: #0E1612; font-family: 'Cormorant Garamond', Georgia, serif; color: #1A1A1A;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0E1612; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #FAF8F1; border: 1px solid #C9A227; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td style="padding: 36px 32px 24px 32px; text-align: center; border-bottom: 2px solid #C9A227; background-color: #15391D;">
              <h1 style="color: #FAF8F1; font-size: 26px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0; font-weight: 400;">LUX BASED INDUSTRY</h1>
              <p style="color: #C9A227; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; margin: 6px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">ARCHITECTURAL LIGHTING STUDIO</p>
            </td>
          </tr>
          ${imageUrl ? `<tr><td style="padding: 0; text-align: center; background-color: #000000;"><img src="${imageUrl}" alt="${heading}" style="width: 100%; max-height: 380px; object-fit: cover; display: block; border: 0;" /></td></tr>` : ''}
          <tr>
            <td style="padding: 36px 32px 24px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.7; color: #2B2B2B;">
              <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; color: #15391D; margin: 0 0 20px 0; font-weight: 600; letter-spacing: 0.03em;">${heading}</h2>
              <div style="font-size: 15px; line-height: 1.75; color: #333333;">${content}</div>
              ${ctaButton}
              ${attachmentsList}
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px; text-align: center; border-top: 1px solid #E0D8C3; background-color: #F3EFE6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #666666; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #15391D; letter-spacing: 0.05em;">LUX BASED INDUSTRY · ARCHITECTURAL LIGHTING</p>
              <p style="margin: 0 0 12px 0;">Inquiries: <a href="mailto:luxbasedindustries@gmail.com" style="color: #15391D; text-decoration: none;">luxbasedindustries@gmail.com</a></p>
              <p style="font-size: 11px; color: #888888; margin: 0;">You are receiving this communication because you are subscribed to LUX BASED INDUSTRY architectural updates.${recipientEmail ? '<br />Delivered to: ' + recipientEmail : ''}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send Newsletter Broadcast with Duplicate Send Protection
 */
export const sendNewsletterBroadcast = async (id) => {
  const newsletter = await Newsletter.findOneAndUpdate(
    { _id: id, status: { $in: ['Draft', 'Send_Failed'] } },
    { status: 'Sending', lastError: '' },
    { new: true }
  );

  if (!newsletter) {
    const error = new Error('Newsletter cannot be sent. It is already broadcasting, has already been sent, or does not exist.');
    error.statusCode = 409;
    throw error;
  }

  try {
    const allActive = await NewsletterSubscriber.find({ status: 'Subscribed' }).select('email');
    let targetEmails = [];

    if (newsletter.targetAudience === 'custom' && newsletter.selectedRecipients?.length > 0) {
      const allowedSet = new Set(newsletter.selectedRecipients.map((e) => e.toLowerCase().trim()));
      targetEmails = allActive
        .filter((s) => allowedSet.has(s.email.toLowerCase().trim()))
        .map((s) => s.email.toLowerCase().trim());
    } else {
      targetEmails = allActive.map((s) => s.email.toLowerCase().trim());
    }

    if (targetEmails.length === 0) {
      newsletter.status = 'Draft';
      newsletter.lastError = 'No valid active subscribers available for this broadcast.';
      await newsletter.save();

      const error = new Error('No active subscribers available to receive this newsletter.');
      error.statusCode = 400;
      throw error;
    }

    if (!getIsEmailConfigured()) {
      newsletter.status = 'Send_Failed';
      newsletter.lastError = 'Email sending is not configured. Missing RESEND_API_KEY, EMAIL_FROM, or ADMIN_NOTIFICATION_EMAIL.';
      await newsletter.save();

      const error = new Error('Email sending is not configured.');
      error.statusCode = 503;
      throw error;
    }

    const resend = getResendClient();
    const sender = process.env.EMAIL_FROM;

    if (!resend || !sender) {
      newsletter.status = 'Send_Failed';
      newsletter.lastError = 'Resend client or sender address unavailable.';
      await newsletter.save();

      const error = new Error('Email sending service is unavailable.');
      error.statusCode = 503;
      throw error;
    }

    let successes = 0;
    let failures = 0;

    for (const email of targetEmails) {
      try {
        const html = renderNewsletterHtml(newsletter, email);
        const response = await resend.emails.send({
          from: sender,
          to: email,
          subject: newsletter.subject,
          html,
        });

        if (response.error) {
          console.error(`[Newsletter Send Error] Resend error for ${email}:`, response.error.message);
          failures++;
        } else {
          successes++;
        }
      } catch (sendErr) {
        console.error(`[Newsletter Send Exception] Failed for ${email}:`, sendErr.message);
        failures++;
      }
    }

    newsletter.sentAt = new Date();
    newsletter.recipientCount = targetEmails.length;
    newsletter.successfulSends = successes;
    newsletter.failedSends = failures;

    if (successes > 0) {
      newsletter.status = 'Sent';
    } else {
      newsletter.status = 'Send_Failed';
      newsletter.lastError = 'All recipient deliveries failed with provider.';
    }

    await newsletter.save();

    return {
      newsletter,
      summary: {
        totalTargeted: targetEmails.length,
        successfulSends: successes,
        failedSends: failures,
        status: newsletter.status,
      },
    };
  } catch (err) {
    if (newsletter.status === 'Sending') {
      newsletter.status = 'Send_Failed';
      newsletter.lastError = err.message || 'Unexpected error during broadcast execution.';
      await newsletter.save().catch(() => {});
    }
    throw err;
  }
};

/**
 * Generate Clean WhatsApp Deep-Link Share Payload
 */
export const generateWhatsAppShare = async (id, phone) => {
  const newsletter = await Newsletter.findById(id);
  if (!newsletter) {
    const error = new Error(`Newsletter not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  const cleanBody = (newsletter.content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const excerpt = cleanBody.length > 250 ? cleanBody.substring(0, 247) + '...' : cleanBody;

  let message = '*LUX BASED INDUSTRY*\n';
  message += '*Architectural Lighting Studio*\n\n';
  message += `✨ *${newsletter.title}*\n`;
  if (newsletter.heading && newsletter.heading !== newsletter.title) {
    message += `_${newsletter.heading}_\n\n`;
  } else {
    message += '\n';
  }
  message += `${excerpt}\n\n`;

  if (newsletter.ctaText && newsletter.ctaUrl) {
    message += `🔗 *${newsletter.ctaText}*: ${newsletter.ctaUrl}\n\n`;
  }

  if (newsletter.attachments && newsletter.attachments.length > 0) {
    message += `📄 *Brochure / Document*: ${newsletter.attachments[0].url}\n\n`;
  }

  message += 'Inquiries: luxbasedindustries@gmail.com';

  const deepLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return {
    phone: cleanPhone,
    messageText: message,
    deepLink,
  };
};