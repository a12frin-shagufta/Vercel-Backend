import {v2 as cloudinary} from "cloudinary";
import productModel from "../models/productModel.js";

// Add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes, bestseller, stock } = req.body;

    // Extract images
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    // Upload images to Cloudinary
    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
        return result.secure_url;
      })
    );

    // Prepare product data
    const productData = {
      name,
      description,
      category,
      stock: Number(stock),
      price: Number(price),
      sizes: JSON.parse(sizes),
      bestseller: bestseller === "true",
      image: imagesUrl,
      Date: new Date()
    };

    const product = new productModel(productData);
    await product.save();
   
    res.status(201).json({message: "Product added successfully"});
  
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all products
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    console.log(products);
    res.status(200).json({
      success: true,
      product: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.status(200).json({message: "Product removed successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
const singleProduct = async (req, res) => {
  try {
    const {productId} = req.body;
    const product = await productModel.findById(productId);
    res.status(200).json(product);
  } catch(error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addProduct, listProduct, removeProduct, singleProduct };














