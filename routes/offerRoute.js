import express from 'express';
import { addOffer, getAllOffers, getActiveOffers, deleteOffer } from '../controllers/offerController.js';
import adminAuth from '../middleware/adminAuth.js';

const offerRouter = express.Router();

offerRouter.post('/add', adminAuth, addOffer);
offerRouter.get('/active', getActiveOffers);
offerRouter.get('/all', adminAuth, getAllOffers);
offerRouter.delete('/delete/:id', adminAuth, deleteOffer);

export default offerRouter;