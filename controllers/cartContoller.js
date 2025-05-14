import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Offer from "../models/offerModel.js";
import mongoose from "mongoose";


// Add product to user cart
const addToCart = async (req, res) => {
  try {
    const userId = req.userId; // From authUser mibehe hf jb ddleware
    const { itemId, size, quantity = 1 } = req.body;

    // Log inputs for debugging
    console.log("addToCart Input:", { userId, itemId, size, quantity });

    // Validate inputs
    if (!itemId || !size || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid parameters" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      console.log("Invalid ID:", { userId, itemId });
      return res.status(400).json({ success: false, message: "Invalid user or item ID" });
    }

    // Fetch user and product
    const userData = await userModel.findById(userId);
    const product = await productModel.findById(itemId);
    if (!userData || !product) {
      console.log("Not found:", { user: !!userData, product: !!product });
      return res.status(404).json({ success: false, message: "User or product not found" });
    }

    // Validate size
    if (!product.sizes.includes(size) && size !== "One Size") {
      console.log("Invalid size:", size);
      return res.status(400).json({ success: false, message: "Invalid size" });
    }

    // Validate stock
    if (product.stock < quantity) {
      console.log("Insufficient stock:", { stock: product.stock, quantity });
      return res.status(400).json({ success: false, message: "Insufficient stock" });
    }

    // Update cart
    let cardData = userData.cardData || {};
    console.log("Current cardData:", cardData);
    if (cardData[itemId]) {
      cardData[itemId][size] = (cardData[itemId][size] || 0) + quantity;
    } else {
      cardData[itemId] = { [size]: quantity };
    }
    console.log("Updated cardData:", cardData);

    // Update user document
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { cardData },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      console.log("Update failed for userId:", userId);
      return res.status(500).json({ success: false, message: "Failed to update cart" });
    }
    console.log("Updated user cardData:", updatedUser.cardData);

    // Update stock
    await productModel.findByIdAndUpdate(itemId, { $inc: { stock: -quantity } });

    res.json({
      success: true,
      message: "Added to Cart",
      updatedStock: product.stock - quantity
    });
  } catch (error) {
    console.log("Error in addToCart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user cart
const updateCart = async (req, res) => {
  try {
    const userId = req.userId; // From authUser middleware
    const { itemId, size, quantity } = req.body;

    // Validate inputs
    if (!itemId || !size || quantity == null) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      console.log("Invalid ID:", { userId, itemId });
      return res.status(400).json({ success: false, message: "Invalid user or item ID" });
    }

    // Fetch user and product
    const userData = await userModel.findById(userId);
    const product = await productModel.findById(itemId);
    if (!userData || !product) {
      console.log("Not found:", { user: !!userData, product: !!product });
      return res.status(404).json({ success: false, message: "User or product not found" });
    }

    // Validate size
    if (!product.sizes.includes(size) && size !== "One Size") {
      console.log("Invalid size:", size);
      return res.status(400).json({ success: false, message: "Invalid size" });
    }

    // Validate stock (if increasing quantity)
    const currentQuantity = userData.cardData?.[itemId]?.[size] || 0;
    const stockNeeded = quantity - currentQuantity;
    if (stockNeeded > 0 && product.stock < stockNeeded) {
      console.log("Insufficient stock:", { stock: product.stock, stockNeeded });
      return res.status(400).json({ success: false, message: "Insufficient stock" });
    }

    // Update cart
    let cardData = userData.cardData || {};
    console.log("Current cardData:", cardData);
    if (quantity === 0) {
      if (cardData[itemId]?.[size]) {
        delete cardData[itemId][size];
        if (Object.keys(cardData[itemId]).length === 0) {
          delete cardData[itemId];
        }
      }
    } else {
      if (!cardData[itemId]) {
        cardData[itemId] = {};
      }
      cardData[itemId][size] = quantity;
    }
    console.log("Updated cardData:", cardData);

    // Update user document
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { cardData },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      console.log("Update failed for userId:", userId);
      return res.status(500).json({ success: false, message: "Failed to update cart" });
    }
    console.log("Updated user cardData:", updatedUser.cardData);

    // Update stock
    if (stockNeeded !== 0) {
      await productModel.findByIdAndUpdate(itemId, { $inc: { stock: -stockNeeded } });
    }

    res.json({
      success: true,
      message: "Cart updated successfully",
      cardData,
      updatedStock: product.stock - stockNeeded
    });
  } catch (error) {
    console.log("Error in updateCart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getUserCart = async (req, res) => {
  try {
    const userId = req.userId; // From authUser middleware
    console.log("getUserCart Input:", { userId });

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid userId:", userId);
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Fetch user
    const userData = await userModel.findById(userId);
    if (!userData) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cardData = userData.cardData || {};
    console.log("Fetched cardData:", cardData);

    res.json({ success: true, cardData });
  } catch (error) {
    console.log("Error in getUserCart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};





export { addToCart, updateCart, getUserCart };


