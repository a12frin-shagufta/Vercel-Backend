import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  validTill: { type: Date, required: true },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
  applyToAllProducts: { type: Boolean, default: false },
});

const offerModel =  mongoose.models.Offer || mongoose.model('Offer', offerSchema);

export default offerModel;