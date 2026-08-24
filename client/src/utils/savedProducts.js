const SAVED_STORAGE_KEY = 'veloura_saved_products_v1';

export const getSavedProductIds = () => {
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const toggleSaveProduct = (productId) => {
  try {
    const saved = getSavedProductIds();
    let updated;
    if (saved.includes(productId)) {
      updated = saved.filter((id) => id !== productId);
    } else {
      updated = [...saved, productId];
    }
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for real-time reactivity across components
    window.dispatchEvent(new Event('veloura_saved_updated'));
    return updated.includes(productId);
  } catch (e) {
    return false;
  }
};

export const isProductSaved = (productId) => {
  const saved = getSavedProductIds();
  return saved.includes(productId);
};
