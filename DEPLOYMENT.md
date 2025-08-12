# Deployment Guide

This guide will walk you through deploying the Learning Platform to Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- PostgreSQL database (for production)

## Step 1: Database Setup

### Option A: Use Render's PostgreSQL (Recommended for free tier)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "PostgreSQL"
3. Choose a name (e.g., `learning-platform-db`)
4. Select "Free" plan
5. Choose a region close to your users
6. Click "Create Database"
7. Note down the connection details

### Option B: Use Supabase (Alternative free option)
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

## Step 2: Backend Deployment (Render)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `learning-platform` repository

3. **Configure the service**
   - **Name**: `learning-platform-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   DATABASE_URL=your-postgresql-connection-string
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete
   - Note the service URL (e.g., `https://learning-platform-backend.onrender.com`)

## Step 3: Frontend Deployment (Vercel)

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `learning-platform` repository

2. **Configure the project**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_ANALYTICS_ENABLED=true
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Note your frontend URL (e.g., `https://learning-platform.vercel.app`)

## Step 4: Update CORS Settings

1. Go back to your Render backend service
2. Update the `CORS_ORIGIN` environment variable with your Vercel frontend URL
3. Redeploy the backend service

## Step 5: Database Migration

1. **Option A: Use Render's shell**
   - Go to your backend service in Render
   - Click on "Shell" tab
   - Run the migration:
   ```bash
   cd database
   npm run migrate
   ```

2. **Option B: Run locally with production DB**
   - Update your local `.env` file with production database URL
   - Run: `npm run migrate`

## Step 6: Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/health`
3. **Test Registration**: Create a new user account
4. **Test Login**: Sign in with the created account
5. **Test Analytics**: Navigate through the site to generate analytics data

## Environment Variables Reference

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-app.vercel.app` |

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://your-backend.onrender.com` |
| `REACT_APP_ANALYTICS_ENABLED` | Enable analytics tracking | `true` |

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` is set correctly in backend
   - Check that the frontend URL matches exactly

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check if database is accessible from Render's servers
   - Ensure database is not paused (free tier limitation)

3. **Build Failures**
   - Check build logs for dependency issues
   - Ensure all required environment variables are set
   - Verify Node.js version compatibility

4. **Analytics Not Working**
   - Check browser console for errors
   - Verify backend URL is accessible
   - Ensure user is authenticated for protected analytics

### Performance Optimization

1. **Database Indexes**: Ensure all database indexes are created
2. **Caching**: Consider adding Redis for session storage
3. **CDN**: Vercel automatically provides CDN for static assets
4. **Monitoring**: Use Render's built-in monitoring tools

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **Database**: Use connection pooling and SSL
3. **Rate Limiting**: Adjust rate limits based on your needs
4. **CORS**: Restrict CORS to only your frontend domain
5. **Environment Variables**: Never commit secrets to version control

## Scaling Considerations

1. **Free Tier Limits**
   - Render: 750 hours/month, 15-minute timeout
   - Vercel: 100GB bandwidth/month, 100 serverless function executions/day

2. **Upgrading Plans**
   - Consider paid plans for production use
   - Implement proper monitoring and logging
   - Add backup and disaster recovery procedures

## Support

- **Render**: [Documentation](https://render.com/docs)
- **Vercel**: [Documentation](https://vercel.com/docs)
- **PostgreSQL**: [Documentation](https://www.postgresql.org/docs/)

For issues specific to this project, check the GitHub repository or create an issue.
