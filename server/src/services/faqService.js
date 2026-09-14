import FAQ from '../models/FAQ.js';

const sanitizeFaqText = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/Veloura Lighting/gi, 'LUX BASED INDUSTRY')
    .replace(/Veloura/gi, 'LUX BASED INDUSTRY');
};

export const getAllFaqs = async (queryParams) => {
  const { adminView = false, category, sort = 'order' } = queryParams;

  const filter = {};
  if (!adminView) {
    filter.isActive = true;
  }

  if (category && category !== 'ALL') {
    filter.category = category;
  }

  const faqs = await FAQ.find(filter).sort(sort);

  // Normalize legacy branding for public and admin views
  const sanitizedFaqs = faqs.map((faq) => {
    const obj = faq.toObject ? faq.toObject() : { ...faq };
    const originalQ = obj.question || '';
    const originalA = obj.answer || '';
    const cleanQ = sanitizeFaqText(originalQ);
    const cleanA = sanitizeFaqText(originalA);

    if (cleanQ !== originalQ || cleanA !== originalA) {
      obj.question = cleanQ;
      obj.answer = cleanA;
      // Auto-heal database record in the background
      if (faq._id && typeof FAQ.updateOne === 'function') {
        FAQ.updateOne(
          { _id: faq._id },
          { $set: { question: cleanQ, answer: cleanA } }
        ).catch(() => {});
      }
    }

    return obj;
  });

  return sanitizedFaqs;
};

export const createFaq = async (data) => {
  const sanitizedData = { ...data };
  if (sanitizedData.question) {
    sanitizedData.question = sanitizeFaqText(sanitizedData.question);
  }
  if (sanitizedData.answer) {
    sanitizedData.answer = sanitizeFaqText(sanitizedData.answer);
  }
  const faq = await FAQ.create(sanitizedData);
  return faq;
};

export const updateFaq = async (id, data) => {
  const sanitizedData = { ...data };
  if (sanitizedData.question) {
    sanitizedData.question = sanitizeFaqText(sanitizedData.question);
  }
  if (sanitizedData.answer) {
    sanitizedData.answer = sanitizeFaqText(sanitizedData.answer);
  }
  const faq = await FAQ.findByIdAndUpdate(id, sanitizedData, {
    new: true,
    runValidators: true,
  });

  if (!faq) {
    const error = new Error(`FAQ not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return faq;
};

export const deleteFaq = async (id) => {
  const faq = await FAQ.findByIdAndDelete(id);
  if (!faq) {
    const error = new Error(`FAQ not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return faq;
};
