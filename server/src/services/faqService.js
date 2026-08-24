import FAQ from '../models/FAQ.js';

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
  return faqs;
};

export const createFaq = async (data) => {
  const faq = await FAQ.create(data);
  return faq;
};

export const updateFaq = async (id, data) => {
  const faq = await FAQ.findByIdAndUpdate(id, data, {
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
