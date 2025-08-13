# Local Development Setup Guide

This guide will help you set up the Learning Platform for local development.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: For version control
- **SQLite**: For local development (included with Node.js)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd learning-platform
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your local settings
# (See Environment Variables section below)

# Start development server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your local settings
# (See Environment Variables section below)

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 4. Database Setup

```bash
cd database

# Run database migration
npm run migrate
```

This will create the SQLite database and insert sample data.

## Environment Variables

### Backend (.env)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database Configuration
# For development with SQLite
SQLITE_PATH=./database/learning_platform.db

# CORS Configuration
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend (.env)

```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ANALYTICS_ENABLED=true
```

## Project Structure

```
learning-platform/
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route handlers
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── tailwind.config.js
├── database/                # Database schemas and migrations
│   ├── schema.sql          # Database schema
│   └── migrate.ts          # Migration script
├── docs/                    # Documentation
├── README.md               # Project overview
├── SETUP.md                # This file
└── DEPLOYMENT.md           # Deployment guide
```

## Available Scripts

### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run migrate      # Run database migrations
```

### Frontend

```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run eject        # Eject from Create React App
```

## Database

### Local Development (SQLite)

The project uses SQLite for local development by default. The database file will be created automatically when you run the migration.

### Production (PostgreSQL)

For production, you'll need to:
1. Set up a PostgreSQL database
2. Update the `DATABASE_URL` environment variable
3. Set `NODE_ENV=production`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/enrolled/list` - Get enrolled courses
- `POST /api/courses/:id/progress` - Update progress

### Analytics
- `POST /api/analytics/pageview` - Track page views
- `POST /api/analytics/click` - Track user clicks
- `POST /api/analytics/video` - Track video interactions
- `POST /api/analytics/quiz` - Track quiz attempts
- `GET /api/analytics/summary` - Get analytics summary

## Development Workflow

### 1. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### 2. Make Changes

- Backend changes will automatically reload
- Frontend changes will hot reload in the browser
- Database changes require running migrations

### 3. Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### 4. Database Changes

If you modify the database schema:

1. Update `database/schema.sql`
2. Run migration: `npm run migrate`
3. Test the changes

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   - Ensure SQLite file path is correct
   - Check file permissions
   - Run migration script

3. **CORS Errors**
   - Verify backend is running on port 5000
   - Check CORS_ORIGIN in backend .env
   - Ensure frontend is running on port 3000

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version`
   - Verify TypeScript compilation

### Performance Tips

1. **Backend**
   - Use `npm run dev` for development (includes hot reload)
   - Monitor memory usage with large datasets
   - Use database indexes for better query performance

2. **Frontend**
   - React DevTools for debugging
   - Network tab for API calls
   - Console for analytics tracking

## Contributing

1. Create a feature branch: `git checkout -b feature-name`
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages
5. Push and create a pull request

## Next Steps

After setting up local development:

1. **Explore the Codebase**: Understand the structure and flow
2. **Test Features**: Register, login, browse courses, track analytics
3. **Customize**: Modify content, styling, or functionality
4. **Deploy**: Follow the deployment guide to go live
5. **Monitor**: Check analytics and user behavior

## Support

- Check the main README.md for project overview
- Review DEPLOYMENT.md for production deployment
- Create GitHub issues for bugs or feature requests
- Check browser console and server logs for errors

Happy coding! 🚀
