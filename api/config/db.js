import mongoose from "mongoose";

let cachedConnection = null;

export const connectDB = async () => {
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        cachedConnection = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};