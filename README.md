# 🧞‍♂️ SmartGenie - AI-Powered Creative Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-4.0.0-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.9.5-green.svg)](https://mongodb.com/)

SmartGenie is a cutting-edge AI-powered platform that combines image generation, website summarization, and intelligent chatbot capabilities. Built with modern web technologies, it offers a seamless user experience for creative professionals, content creators, and anyone looking to leverage AI for their projects.

## ✨ Features

### 🎨 **AI Image Generation**
- Generate stunning images from text descriptions
- High-quality, customizable outputs

### 🔍 **Website Summarization**
- Extract and summarize website content
- Intelligent content analysis
- RAG (Retrieval-Augmented Generation) system for qustion answers
- Quick insights from any webpage

### 💬 **Smart Chatbot**
- AI-powered conversational interface
- Context-aware responses
- Integration with Google Generative AI
- Personalized user experience

### 🎯 **Premium Features**
- Credit-based system for advanced features
- Secure payment integration (Razorpay)
- User authentication and profiles
- Cloud storage for generated content

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### AI & External Services
- **Google Generative AI** - Text generation
- **LangChain** - AI application framework
- **Pinecone** - Vector database for RAG
- **Cloudinary** - Cloud image management
- **Razorpay** - Payment processing


## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- API keys for external services

### 1. Clone the Repository
```bash
git clone https://github.com/sasaurabh11/SmartGenie.git
cd SmartGenie
```

### 2. Install Dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd ../server
npm install
```

### 3. Environment Configuration

Create `.env` files in both `client/` and `server/` directories:

#### Server Environment Variables
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_API_KEY=your_google_generative_ai_key
PINECONE_API_KEY=your_pinecone_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
CORS_ORIGIN=http://localhost:5173
```

#### Client Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 4. Start the Application

#### Development Mode
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User login
- `GET /api/v1/user/profile` - Get user profile

### Image Generation
- `POST /api/v1/image/generate` - Generate AI images
- `GET /api/v1/image/history` - Get user's image history

### Website Summarization
- `POST /api/v1/website/summarize` - Summarize website content
- `GET /api/v1/website/history` - Get summarization history

### Chat
- `POST /api/v1/chat/message` - Send chat message
- `POST /api/v1/askrag/chat` - RAG-powered chat

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for secure authentication. Protected routes require a valid token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

## 💳 Payment Integration

SmartGenie integrates with Razorpay for secure payment processing. Users can purchase credits to access premium features like advanced AI generation and extended usage limits.

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on all devices
- **Smooth Animations** - Framer Motion powered transitions
- **Modern Interface** - Clean, intuitive design with Tailwind CSS
- **Interactive Elements** - Hover effects and micro-interactions
- **Loading States** - User feedback during API calls

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render)
```bash
cd server
# Set environment variables
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **Google Generative AI** for text generation
- **LangChain** for AI application framework
- **Tailwind CSS** for the beautiful UI framework
- **React Team** for the amazing frontend library

---

**SmartGenie** - Where creativity meets artificial intelligence! 🚀✨ 