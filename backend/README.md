# Talent Trade Network Backend

A comprehensive backend API for the Talent Trade Network application, built with Node.js, Express, MongoDB, and Socket.io for real-time features.

## Features

- **User Authentication & Authorization**: JWT-based authentication with user registration, login, and profile management
- **Skill Matching System**: Intelligent matching algorithm to connect users based on skills offered and wanted
- **Real-time Messaging**: WebSocket-based messaging system with typing indicators and read receipts
- **Course Management**: Educational content creation, enrollment, and progress tracking
- **Rating & Review System**: User ratings and course reviews
- **File Upload Support**: Image and file upload capabilities
- **Security Features**: Rate limiting, CORS, helmet, input validation
- **Real-time Notifications**: WebSocket-based notifications for matches and messages

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Security**: bcryptjs, helmet, express-rate-limit
- **File Upload**: Multer, Cloudinary
- **Validation**: express-validator, Joi

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talent-trade-network-app-main/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/talent-trade-network
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Cloudinary Configuration (optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/profile` | Get current user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| POST | `/logout` | Logout user | Private |
| GET | `/users/:id` | Get user by ID | Public |
| GET | `/users/search` | Search users | Public |

### Matches (`/api/matches`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Create a new match | Private |
| GET | `/` | Get user's matches | Private |
| GET | `/potential` | Get potential matches | Private |
| GET | `/:id` | Get match by ID | Private |
| PUT | `/:id/status` | Update match status | Private |
| POST | `/:id/rate` | Rate a match | Private |

### Messages (`/api/messages`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/:matchId` | Get messages for a match | Private |
| POST | `/` | Send a message | Private |
| PUT | `/:id` | Update a message | Private |
| DELETE | `/:id` | Delete a message | Private |
| POST | `/:id/reactions` | Add reaction to message | Private |
| DELETE | `/:id/reactions` | Remove reaction from message | Private |
| GET | `/unread/count` | Get unread message count | Private |

### Courses (`/api/courses`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all courses | Public |
| GET | `/:id` | Get course by ID | Public |
| POST | `/` | Create a new course | Private |
| PUT | `/:id` | Update course | Private |
| DELETE | `/:id` | Delete course | Private |
| POST | `/:id/enroll` | Enroll in course | Private |
| PUT | `/:id/progress` | Update lesson progress | Private |
| POST | `/:id/reviews` | Add course review | Private |
| GET | `/enrolled` | Get user's enrolled courses | Private |
| GET | `/instructor` | Get instructor's courses | Private |

## WebSocket Events

### Client to Server

- `authenticate(userId)` - Authenticate user with Socket.io
- `join-match(matchId)` - Join a match room
- `leave-match(matchId)` - Leave a match room
- `send-message(data)` - Send a new message
- `typing(data)` - Send typing indicator
- `stop-typing(data)` - Stop typing indicator
- `set-online()` - Set user as online

### Server to Client

- `authenticated` - Confirmation of authentication
- `new-message(data)` - Receive new message
- `user-typing(data)` - User is typing
- `user-stop-typing(data)` - User stopped typing
- `user-online(userId)` - User came online
- `user-offline(userId)` - User went offline

## Database Models

### User
- Basic info (name, email, bio, avatar)
- Skills offered and wanted
- Rating and connection count
- Online status and preferences
- Authentication fields

### Match
- User pairs and status
- Skill exchange details
- Compatibility scoring
- Meeting arrangements
- Rating and feedback

### Message
- Match association
- Message content and type
- Read status and timestamps
- Reactions and editing
- System messages

### Course
- Course details and content
- Instructor information
- Enrollment tracking
- Progress monitoring
- Reviews and ratings

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevent abuse with request limits
- **CORS Protection**: Configured for frontend access
- **Input Validation**: Request validation and sanitization
- **Helmet**: Security headers
- **Error Handling**: Comprehensive error management

## Development

### Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Environment Variables

See `env.example` for all available environment variables.

### Database Connection

The application connects to MongoDB using the `MONGODB_URI` environment variable. Make sure MongoDB is running locally or use a cloud service like MongoDB Atlas.

## Deployment

1. **Set up environment variables** for production
2. **Configure MongoDB** connection string
3. **Set up reverse proxy** (nginx recommended)
4. **Use PM2** for process management
5. **Configure SSL** certificates
6. **Set up monitoring** and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 