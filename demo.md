# 🎮 Demo Guide

## Quick Demo Steps

### 1. Start the Application
```bash
# Terminal 1: Start backend
cd server && npm start

# Terminal 2: Start frontend  
npm start
```

### 2. Create a Challenge
1. Go to http://localhost:3000
2. Click "Manage Challenges"
3. Click "Create New Challenge"
4. Fill in:
   - **Challenge ID**: `demo-challenge`
   - **Title**: `Demo Challenge`
   - **Description**: `A sample challenge for demonstration`
5. Click "Create Challenge"

### 3. Set Up Demo Data
1. Go back to home page
2. Click "Set Up Demo Data"
3. This creates sample challenges and scores

### 4. View Leaderboard
1. Select a challenge from the dropdown
2. Click "View Leaderboard"
3. See ranked participants with scores

### 5. Submit New Score
1. On the leaderboard page, scroll down to "Submit New Score"
2. Fill in:
   - **User ID**: `new_user`
   - **Email**: `newuser@example.com`
   - **AI Score**: `85`
   - **Code Quality**: `90`
   - **Testing Rate**: `80`
   - **Logic Score**: `88`
   - **Clarity Score**: `85`
3. Click "Submit Score"
4. Watch the leaderboard update automatically!

### 6. Test Features
- **Search**: Use the search box to filter participants
- **Delete Users**: Click ❌ next to any user to remove them
- **Clear Leaderboard**: Click "Clear Leaderboard" to reset
- **Delete Challenge**: Click "Delete Challenge" to remove entire challenge

## 🎯 What to Demonstrate

1. **Multi-Challenge Support**: Show different challenges with separate leaderboards
2. **Real-time Updates**: Submit scores and see immediate ranking changes
3. **Weighted Scoring**: Explain how different criteria contribute to final scores
4. **User Management**: Add, search, and delete users
5. **Responsive Design**: Test on different screen sizes
6. **Data Persistence**: Refresh page and show data is saved

## 📊 Sample Data

The demo includes:
- **3 sample challenges** with different criteria
- **Multiple participants** with varying scores
- **Realistic score distributions** showing ranking logic
- **Different challenge types** (algorithm, web dev, database)

## 🚀 Live Demo URL

**GitHub Pages**: https://priyuh.github.io/eduverse-leaderboard
*(Note: Frontend only - backend runs locally)*
