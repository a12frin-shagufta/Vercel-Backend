import offerModel from '../models/offerModel.js';
import productModel from '../models/productModel.js';

const addOffer = async (req, res) => {
  try {
    const { title, discountPercent, validTill, applicableProducts, applyToAllProducts } = req.body;

    if (!title || !discountPercent || !validTill) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const offer = new offerModel({
      title,
      discountPercent: parseFloat(discountPercent),
      validTill: new Date(validTill),
      applicableProducts: applyToAllProducts ? [] : applicableProducts || [],
      applyToAllProducts: !!applyToAllProducts,
    });

    await offer.save();
    return res.status(201).json({ success: true, message: 'Offer added successfully', offer });
  } catch (error) {
    console.error('Error adding offer:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    console.log('Fetching active offers, current time:', now);
    const offers = await offerModel.find({ validTill: { $gte: now } }).populate('applicableProducts', '_id name');
    console.log('Active offers fetched:', offers);
    return res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error('Error fetching active offers:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllOffers = async (req, res) => {
  try {
    console.log('Fetching all offers');
    const offers = await offerModel.find().populate('applicableProducts', '_id name');
    console.log('All offers fetched:', offers);
    return res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error('Error fetching all offers:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await offerModel.findByIdAndDelete(id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    return res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export { addOffer, getActiveOffers, getAllOffers, deleteOffer };

