# Learning Platform with Clickstream Analytics

A comprehensive learning management system that tracks user interactions and provides detailed analytics on learning behavior.

## Features

- **User Authentication**: Secure registration and login system
- **Interactive Learning Content**: Text, video, and quiz-based learning modules
- **Real-time Analytics**: Track user clicks, page views, video interactions, and quiz attempts
- **Responsive Design**: Modern UI that works on all devices
- **Progress Tracking**: Monitor learning progress and completion rates

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT tokens
- **Hosting**: Vercel (frontend), Render (backend)
- **Analytics**: Custom clickstream tracking system

## Project Structure

```
learning-platform/
├── frontend/          # React frontend application
├── backend/           # Node.js API server
├── database/          # Database schemas and migrations
├── docs/             # API documentation and setup guides
└── README.md         # This file
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd learning-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   ```bash
   cd database
   npm run migrate
   ```

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend (.env)**
```
PORT=5000
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://username:password@localhost:5432/learning_platform
NODE_ENV=development
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ANALYTICS_ENABLED=true
```

## Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variables

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Learning Content
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/progress` - Update course progress

### Analytics
- `POST /api/analytics/click` - Track user clicks
- `POST /api/analytics/pageview` - Track page views
- `POST /api/analytics/video` - Track video interactions
- `POST /api/analytics/quiz` - Track quiz attempts

## Clickstream Data Structure

The system tracks the following user interactions:

- **Page Views**: URL, timestamp, user agent, referrer
- **Clicks**: Element ID, coordinates, timestamp, page context
- **Video Interactions**: Play, pause, seek, completion
- **Quiz Attempts**: Question responses, time spent, score
- **Navigation**: Page transitions, time on page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support, please open an issue in the GitHub repository.
