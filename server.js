import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDb from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import contactRouter from './routes/contactRoute.js';
import newsletterRoutes from "./routes/newsletterRoute.js";
import offerRoutes from "./routes/offerRoute.js";


// App config
const app = express();
const port = process.env.PORT || 3000;
connectDb();
connectCloudinary();

//middlewares
app.use(express.json());
app.use(cors()) //acess the backend from any ip

// api endpoints
app.use('/api/user',userRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use("/api",contactRouter)
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/offer", offerRoutes);


app.get('/',(req,res) => {
    res.send("Hello")
})

app.listen(port,() => {
    console.log(`Server is running on port ${port}`)
})