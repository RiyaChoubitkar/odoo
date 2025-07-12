# Talent Trade Network App

A full-stack application for skill exchange and learning, built with React (Frontend) and Node.js/Express (Backend).

## 🚀 Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Skill Matching**: AI-powered compatibility scoring for skill exchanges
- **Real-time Messaging**: WebSocket-based chat system
- **Course Management**: Create, enroll, and track learning progress
- **User Profiles**: Comprehensive profiles with skills offered/wanted
- **Rating System**: Rate and review skill exchange experiences

### Frontend Features
- Modern React with TypeScript
- Beautiful UI with Tailwind CSS and shadcn/ui
- Responsive design for all devices
- Real-time notifications
- Interactive skill matching interface

### Backend Features
- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- JWT authentication
- WebSocket support for real-time features
- Rate limiting and security middleware
- Comprehensive error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.io** for real-time features
- **JWT** for authentication
- **bcryptjs** for password hashing
- **cors** and **helmet** for security

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talent-trade-network-app
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   ```bash
   # Copy backend environment file
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your configuration
   MONGODB_URI=mongodb://localhost:27017/talent-trade-network
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately
   npm run dev          # Frontend only (port 5173)
   npm run backend      # Backend only (port 5000)
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/api/docs

## 🗄️ Database Setup

### MongoDB Connection
The app uses MongoDB as the primary database. You can use:
- **Local MongoDB**: Install and run locally
- **MongoDB Atlas**: Cloud-hosted MongoDB service
- **Docker**: Run MongoDB in a container

### Seed Data
The backend includes sample data for testing:

```bash
cd backend
npm run seed
```

This creates:
- Sample users with various skills
- Example courses
- Test matches and messages

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/talent-trade-network

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend
The frontend automatically connects to `http://localhost:5000/api`. To change this, update `src/utils/apiClient.ts`.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### User Management
- `GET /api/auth/users/search` - Search users
- `GET /api/auth/users/:id` - Get user by ID

### Match Management
- `POST /api/matches` - Create a match
- `GET /api/matches` - Get user's matches
- `GET /api/matches/potential` - Get potential matches
- `PUT /api/matches/:id/status` - Update match status
- `POST /api/matches/:id/rate` - Rate a match

### Messaging
- `GET /api/messages/:matchId` - Get messages for a match
- `POST /api/messages` - Send a message
- `PUT /api/messages/:id` - Update a message
- `DELETE /api/messages/:id` - Delete a message
- `POST /api/messages/:id/reactions` - Add reaction
- `GET /api/messages/unread/count` - Get unread count

### Course Management
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create a course
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course
- `POST /api/courses/:id/enroll` - Enroll in a course
- `PUT /api/courses/:id/progress` - Update progress
- `POST /api/courses/:id/reviews` - Add review

## 🔌 WebSocket Events

### Client to Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - User typing indicator

### Server to Client
- `message_received` - New message received
- `user_typing` - User typing notification
- `match_created` - New match notification
- `match_updated` - Match status update

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Environment Setup for Production
- Set `NODE_ENV=production`
- Use a production MongoDB instance
- Configure proper CORS origins
- Set up SSL certificates
- Use environment-specific JWT secrets

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
npm test
```

## 📁 Project Structure

```
talent-trade-network-app/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── data/              # Mock data (for development)
├── backend/               # Backend source code
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── package.json
│   └── server.js          # Main server file
├── package.json           # Root package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [MongoDB](https://www.mongodb.com/) for the database
- [Socket.io](https://socket.io/) for real-time features
