import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
   
    sizes: {
        type: Array,
        required: true
    },
    Date: {
        type: Date,
        required: true
    }, 
    bestseller: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    }
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
