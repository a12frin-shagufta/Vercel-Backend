import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Remove password requirement for OTP login
    password: {
        type: String,
        default: null
    },
    cardData: {
        type: Object,
        default: {}
    }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;