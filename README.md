## tinder base

-   🔐 Authentication System with JWT
-   🛡️ Route Protection
-   👤 User Profile Creation and Updates
-   🖼️ Image Upload for Profiles
-   🔄 Swipe Right/Left Feature
-   💬 Real-time Chat Messaging
-   🔔 Real-time Notifications
-   🤝 Matching Algorithm
-   📱 Responsive Mobile Design
-   ⌛ And a lot more...


### Setup .env file in root directory

```bash
PORT=4999
MONGO_URI=<your_mongo_uri>
JWT_SECRET=<your_very_strong_secret>
NODE_ENV=development
CLIENT_URL=http://localhost:5173

CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
```

### Requirements

- Node.js version 20.17

### Running the application locally

1. Start the server (from root directory):
```bash
npm run dev
```

2. In a new terminal, start the client:
```bash
cd client
npm run dev
```

The server will run on http://localhost:4999
The client will run on http://localhost:5173
