# EduVerse Leaderboard

A full-stack leaderboard application for managing coding challenges and tracking participant scores with AI-powered evaluation.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/priyuh/eduverse-leaderboard.git
   cd eduverse-leaderboard
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your Supabase credentials (for production)
   # For development, the app will use SQLite automatically
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start the backend server
   cd server
   npm start
   
   # Terminal 2: Start the frontend (in a new terminal)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Health check: http://localhost:5001/api/health

## 📋 Example Inputs/Outputs

### Creating a Challenge
**Input:**
```json
POST /api/challenges
{
  "challenge_id": "algorithm-challenge",
  "title": "Sorting Algorithm Challenge",
  "description": "Implement an efficient sorting algorithm"
}
```

**Output:**
```json
{
  "message": "Challenge created successfully",
  "challenge": {
    "challenge_id": "algorithm-challenge",
    "title": "Sorting Algorithm Challenge",
    "description": "Implement an efficient sorting algorithm"
  }
}
```

### Submitting a Score
**Input:**
```json
POST /api/scores
{
  "user_id": "alice_dev",
  "challenge_id": "algorithm-challenge",
  "email": "alice@example.com",
  "ai_score": 85.5,
  "code_quality": 90.0,
  "testing_rate": 80.0,
  "logic_score": 88.0,
  "clarity_score": 85.0,
  "efficiency_score": 90.0,
  "api_ui_score": 0.0,
  "edge_cases_score": 75.0,
  "creativity_score": 80.0
}
```

**Output:**
```json
{
  "message": "Score submitted successfully",
  "final_score": 84.25,
  "rank": 1
}
```

### Getting Leaderboard
**Input:**
```
GET /api/challenges/algorithm-challenge/leaderboard
```

**Output:**
```json
{
  "leaderboard": [
    {
      "user_id": "alice_dev",
      "name": "Alice Developer",
      "final_score": 84.25,
      "rank": 1,
      "clarity_contribution": 25.5,
      "logic_contribution": 22.0,
      "api_ui_contribution": 0.0,
      "edge_cases_contribution": 11.25,
      "creativity_contribution": 8.0,
      "testing_contribution": 0.0,
      "efficiency_contribution": 27.0
    }
  ]
}
```

## 🏗️ Architecture Overview

### Frontend (React)
- **Framework**: React 19.2.0 with Create React App
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **HTTP Client**: Axios for API communication
- **Styling**: CSS modules with responsive design
- **Components**:
  - `App.js` - Main application component with routing
  - `Leaderboard.js` - Displays ranked participants
  - `ScoreSubmission.js` - Form for submitting scores
  - `ChallengeManagement.js` - Create and manage challenges

### Backend (Node.js/Express)
- **Framework**: Express.js with RESTful API design
- **Database**: SQLite (development) / Supabase (production)
- **Authentication**: Environment-based configuration
- **API Endpoints**:
  - `POST /api/challenges` - Create challenges
  - `POST /api/scores` - Submit scores
  - `GET /api/challenges/:id/leaderboard` - Get rankings
  - `POST /api/challenges/:id/calculate-rankings` - Recalculate scores

### Database Schema
- **challenges** - Store challenge information
- **users** - User profiles and contact info
- **ai_scores** - Raw AI evaluation scores
- **final_rankings** - Calculated final scores and rankings
- **recruiter_criteria** - Weighted scoring criteria

### Scoring Algorithm
The system uses a weighted scoring model:
- **Logic**: 25% weight
- **Clarity: 30% weight  
- **API/UI Design**: 20% weight
- **Edge Cases**: 15% weight
- **Creativity**: 10% weight
- **Testing**: Variable weight
- **Efficiency**: Variable weight

## 🔧 Development

### Available Scripts
```bash
# Frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests

# Backend
cd server
npm start          # Start API server
npm run dev        # Start with nodemon (if available)
```

### Project Structure
```
eduverse-leaderboard/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── App.js             # Main app component
│   └── index.js           # App entry point
├── server/                 # Backend API
│   ├── index.js           # Express server
│   ├── database.js        # Database adapter
│   └── scoreCalculator.js  # Scoring logic
├── supabase/              # Database schema
├── public/                # Static assets
└── package.json          # Dependencies
```

## 📈 Scaling for 10,000+ Users

For detailed information on how to scale this system for 10,000+ users, see the **SCALING_ANALYSIS.md** file in the root directory. This document covers microservices architecture, database optimization, caching strategies, and horizontal scaling approaches.

## 📊 Features

- ✅ Multi-challenge support
- ✅ Real-time leaderboard updates
- ✅ AI-powered scoring system
- ✅ Weighted evaluation criteria
- ✅ User management
- ✅ Challenge management
- ✅ Responsive design
- ✅ Data persistence

## 🛠️ Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000 and 5001 are available
2. **Database errors**: Check Supabase connection and credentials
3. **Build failures**: Clear node_modules and reinstall dependencies

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start
```

## 📝 License

This project is part of the EduVerse coding challenge submission.