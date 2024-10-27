## BlendR

A modern recipe matching application that helps users find cooking partners based on their culinary preferences and dietary needs.

### Core Features

#### Authentication & User Management
-   🔐 JWT-based Authentication System
-   🛡️ Protected Routes
-   👤 Comprehensive User Profile Management
-   🖼️ Profile Image Upload via Cloudinary

#### Matching System
-   🔄 Tinder-style Swipe Interface
-   🤝 Smart Matching Algorithm
-   ⭐ Compatibility Scoring
-   📍 Location-based Matching
-   ❤️ Real-time Match Notifications

#### Communication
-   💬 Real-time Chat Messaging
-   🔔 Real-time Notifications
-   ✨ Animated Message Interactions

#### Recipe & Dietary Features
-   🍳 Recipe Recommendations
-   🥗 Dietary Restrictions Management
-   📊 Macro Tracking
-   🌮 Cuisine Preferences
-   ⚖️ Goal Completion Tracking

#### Kitchen Management
-   🧊 Virtual Fridge Inventory
-   🎙️ Voice Input for Ingredients
-   📸 Image Recognition for Groceries
-   📝 Ingredient List Management

#### UI/UX Features
-   📱 Responsive Mobile-First Design
-   🎨 Modern Glass-morphic Interface
-   ✨ Framer Motion Animations
-   🌈 Dynamic Color Feedback
-   🎯 Progress Indicators
-   💫 Smooth Transitions

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
npm install
npm run dev
```

2. In a new terminal, start the client:
```bash
cd client
npm run dev
```

The server will run on http://localhost:4999
The client will run on http://localhost:5173


### Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- State Management: Zustand
- Real-time: Socket.io
- Animations: Framer Motion
- Styling: TailwindCSS
- Cloud Storage: Cloudinary
