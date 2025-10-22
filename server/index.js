const express = require('express');
const cors = require('cors');
const Database = require('./supabase-adapter');
const ScoreCalculator = require('./scoreCalculator');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = new Database();

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EduVerse Leaderboard API is running' });
});

// Create a new challenge
app.post('/api/challenges', async (req, res) => {
  try {
    const { challengeId, title, description } = req.body;
    
    if (!challengeId || !title) {
      return res.status(400).json({ error: 'challengeId and title are required' });
    }

    const challenge = await db.createChallenge(challengeId, title, description);
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Set recruiter criteria for a challenge
app.post('/api/challenges/:challengeId/criteria', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const criteria = req.body;

    // Validate criteria
    const validation = ScoreCalculator.validateCriteria(criteria);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid criteria', details: validation.errors });
    }

    const result = await db.setRecruiterCriteria(challengeId, criteria);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error setting criteria:', error);
    res.status(500).json({ error: 'Failed to set criteria' });
  }
});

// Submit AI scores
app.post('/api/scores', async (req, res) => {
  try {
    const aiScore = req.body;

    // Validate AI score
    const validation = ScoreCalculator.validateAIScore(aiScore);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid AI score', details: validation.errors });
    }

    // Create user if not exists
    await db.createUser(aiScore.user_id, aiScore.user_id, aiScore.email);

    // Submit AI score
    const result = await db.submitAIScore(aiScore);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error submitting AI score:', error);
    res.status(500).json({ error: 'Failed to submit AI score' });
  }
});

// Calculate and update rankings for a challenge
app.post('/api/challenges/:challengeId/calculate-rankings', async (req, res) => {
  try {
    const { challengeId } = req.params;

    // Get recruiter criteria
    const criteria = await db.getRecruiterCriteria(challengeId);
    if (!criteria) {
      return res.status(404).json({ error: 'Recruiter criteria not found for this challenge' });
    }

    // Get all AI scores for the challenge
    const aiScores = await db.getAllAIScores(challengeId);
    if (aiScores.length === 0) {
      return res.status(404).json({ error: 'No AI scores found for this challenge' });
    }

    // Calculate rankings
    const rankings = ScoreCalculator.processChallengeScores(aiScores, criteria);

    // Save rankings to database
    for (const ranking of rankings) {
      await db.saveFinalRanking({
        userId: ranking.userId,
        challengeId: ranking.challengeId,
        finalScore: ranking.finalScore,
        rank: ranking.rank,
        logicContribution: ranking.logicContribution,
        clarityContribution: ranking.clarityContribution,
        testingContribution: ranking.testingContribution,
        efficiencyContribution: ranking.efficiencyContribution,
        apiUiContribution: ranking.apiUiContribution,
        edgeCasesContribution: ranking.edgeCasesContribution,
        creativityContribution: ranking.creativityContribution
      });
    }

    res.json({ 
      message: 'Rankings calculated successfully',
      totalParticipants: rankings.length,
      rankings: rankings.slice(0, 10) // Return top 10 for preview
    });
  } catch (error) {
    console.error('Error calculating rankings:', error);
    res.status(500).json({ error: 'Failed to calculate rankings' });
  }
});

// Get leaderboard for a challenge
app.get('/api/challenges/:challengeId/leaderboard', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { limit = 100, search } = req.query;

    let leaderboard = await db.getLeaderboard(challengeId, parseInt(limit));

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      leaderboard = leaderboard.filter(entry => 
        entry.name.toLowerCase().includes(searchLower) ||
        entry.user_id.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      challengeId,
      totalParticipants: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user's ranking for a specific challenge
app.get('/api/challenges/:challengeId/users/:userId/ranking', async (req, res) => {
  try {
    const { challengeId, userId } = req.params;
    
    const leaderboard = await db.getLeaderboard(challengeId, 1000);
    const userRanking = leaderboard.find(entry => entry.user_id === userId);
    
    if (!userRanking) {
      return res.status(404).json({ error: 'User ranking not found for this challenge' });
    }

    res.json(userRanking);
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    res.status(500).json({ error: 'Failed to fetch user ranking' });
  }
});

// Get all challenges
app.get('/api/challenges', async (req, res) => {
  try {
    console.log('Fetching challenges...');
    console.log('Database instance:', typeof db);
    console.log('getAllChallenges method:', typeof db.getAllChallenges);
    const challenges = await db.getAllChallenges();
    console.log('Retrieved challenges:', challenges);
    res.json({ challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Delete all scores for a challenge (clear leaderboard)
app.delete('/api/challenges/:challengeId/leaderboard', async (req, res) => {
  try {
    const { challengeId } = req.params;
    await db.deleteChallengeLeaderboard(challengeId);
    res.json({ message: 'Leaderboard cleared successfully' });
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
    res.status(500).json({ error: 'Failed to clear leaderboard' });
  }
});

// Delete a challenge completely
app.delete('/api/challenges/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    await db.deleteChallenge(challengeId);
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

// Delete a specific user from a challenge
app.delete('/api/challenges/:challengeId/users/:userId', async (req, res) => {
  try {
    const { challengeId, userId } = req.params;
    await db.deleteUserFromChallenge(challengeId, userId);
    
    // Recalculate rankings for remaining users using the same logic as calculate-rankings endpoint
    const ScoreCalculator = require('./scoreCalculator');
    
    // Get recruiter criteria
    const criteria = await db.getRecruiterCriteria(challengeId);
    if (criteria) {
      // Get all AI scores for the challenge
      const aiScores = await db.getAllAIScores(challengeId);
      if (aiScores.length > 0) {
        // Calculate rankings
        const rankings = ScoreCalculator.processChallengeScores(aiScores, criteria);
        
        // Save rankings to database
        for (const ranking of rankings) {
          await db.saveFinalRanking({
            userId: ranking.userId,
            challengeId: ranking.challengeId,
            finalScore: ranking.finalScore,
            rank: ranking.rank,
            logicContribution: ranking.logicContribution,
            clarityContribution: ranking.clarityContribution,
            testingContribution: ranking.testingContribution,
            efficiencyContribution: ranking.efficiencyContribution,
            apiUiContribution: ranking.apiUiContribution,
            edgeCasesContribution: ranking.edgeCasesContribution,
            creativityContribution: ranking.creativityContribution
          });
        }
      }
    }
    
    res.json({ message: 'User deleted successfully and rankings updated' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`EduVerse Leaderboard API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close();
  process.exit(0);
});

module.exports = app;
