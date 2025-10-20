# EduVerse Leaderboard

A comprehensive AI Code Evaluation Leaderboard System built with React, Node.js, and Supabase.

## 🚀 Features

- **AI Score Evaluation**: Comprehensive scoring system with multiple criteria
- **Dynamic Rankings**: Real-time leaderboard with customizable weights
- **User Management**: User registration and profile management
- **Challenge System**: Create and manage coding challenges
- **Responsive Design**: Modern, mobile-friendly interface
- **Production Ready**: Deployed on Vercel with Supabase backend

## 🏗️ Architecture

### Frontend
- **React 19** with modern hooks
- **Axios** for API communication
- **Responsive CSS** with modern design patterns

### Backend
- **Node.js/Express** server
- **Supabase** PostgreSQL database (production)
- **SQLite** for local development
- **Serverless functions** on Vercel

### Database Schema
- **Users**: User profiles and authentication
- **Challenges**: Coding challenge definitions
- **AI Scores**: Detailed scoring metrics
- **Recruiter Criteria**: Customizable evaluation weights
- **Final Rankings**: Calculated leaderboard positions

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd eduverse-leaderboard
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

### Supabase Setup

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set up database tables**
   - The tables will be created automatically when you first run the application
   - Or run the SQL scripts in the `supabase/` folder

3. **Configure environment variables**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Configure environment variables**
   - Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel dashboard
   - Set `NODE_ENV=production`

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 📊 API Endpoints

### Challenges
- `POST /api/challenges` - Create a new challenge
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/:id/leaderboard` - Get challenge leaderboard

### Scoring
- `POST /api/scores` - Submit AI scores
- `POST /api/challenges/:id/criteria` - Set recruiter criteria
- `POST /api/challenges/:id/calculate-rankings` - Calculate final rankings

### Users
- `GET /api/challenges/:id/users/:userId/ranking` - Get user's ranking

## 🎯 Scoring System

The system evaluates code submissions based on multiple criteria:

- **Logic Score** (25% default): Code correctness and logic
- **Clarity Score** (30% default): Code readability and documentation
- **Testing Rate** (0% default): Test coverage and quality
- **Efficiency Score** (0% default): Performance and optimization
- **API/UI Score** (20% default): Interface design and API usage
- **Edge Cases** (15% default): Handling of edge cases
- **Creativity Score** (10% default): Innovation and creativity

Recruiters can customize these weights for each challenge.

## 🔧 Development

### Project Structure
```
eduverse-leaderboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   ├── supabase-adapter.js # Database adapter
│   └── scoreCalculator.js  # Scoring logic
├── api/                   # Vercel serverless functions
└── package.json           # Root package.json
```

### Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run client       # Start only React frontend
npm run server       # Start only Node.js backend
npm run build        # Build React app for production
npm run deploy       # Deploy to Vercel
```

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Test API endpoints
node test-api.js
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes (production) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes (production) |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (default: 5001) | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for EduVerse coding challenges
- Uses Supabase for backend services
- Deployed on Vercel platform
- React and Node.js communities

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Live Demo**: [Your Vercel URL]
**Documentation**: [Your Documentation URL]