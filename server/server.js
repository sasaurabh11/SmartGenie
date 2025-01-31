import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './db/index.js';
import userRouter from './routes/user.routes.js';
import imageRouter from './routes/image.routes.js';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/image', imageRouter);
app.get('/', (req, res) => {
    res.send("App started");
})

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    })
})
.catch((error) => {
    console.log("Error in connecting to DB", error);
})