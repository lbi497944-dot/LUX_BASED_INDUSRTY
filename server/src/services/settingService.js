import SiteSetting from '../models/SiteSetting.js';

export const getSiteSettings = async () => {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create({});
  }
  return settings;
};

export const updateSiteSettings = async (updateData) => {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create(updateData);
  } else {
    // If whatsapp is changed, automatically clean number
    if (updateData.whatsapp) {
      updateData.whatsappNumberClean = updateData.whatsapp.replace(/[^0-9]/g, '');
    }
    settings = await SiteSetting.findByIdAndUpdate(settings._id, updateData, {
      new: true,
      runValidators: true,
    });
  }
  return settings;
};
