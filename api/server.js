import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import Groq from 'groq-sdk';

// routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket/socket.server.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4999;

const __dirname = path.resolve();

initializeSocket(httpServer);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

app.post('/api/groq', async (req, res) => {
	try {
	  const { messages } = req.body; 
  
	  // Call Groq API
	  const result = await groq.chat.completions.create({
		messages,
		model: 'llama-3.1-70b-versatile',
	  });
  
	  // Send the response back to the client
	  res.json({ response: result.choices[0].message.content });
	} catch (error) {
	  console.error('Error calling Groq API:', error);
	  res.status(500).json({ message: 'Error fetching data from Groq API' });
	}
  });


if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

httpServer.listen(PORT, () => {
	console.log("Server started at this port:" + PORT);
	connectDB();
});
