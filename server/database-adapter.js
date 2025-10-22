// Database adapter that works with both SQLite (dev) and cloud databases (production)
const path = require('path');

class DatabaseAdapter {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.db = null;
    this.init();
  }

  async init() {
    if (this.isProduction) {
      // For production, we'll use a simple in-memory store or connect to a cloud database
      // For now, using a simple JSON-based approach that can be replaced with a real cloud DB
      this.db = new Map();
      console.log('Using in-memory database for production');
    } else {
      // For development, use SQLite
      const sqlite3 = require('sqlite3').verbose();
      this.db = new sqlite3.Database(path.join(__dirname, 'leaderboard.db'));
      this.initSQLiteTables();
    }
  }

  initSQLiteTables() {
    if (!this.isProduction) {
      this.db.serialize(() => {
        // Users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Challenges table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // AI Scores table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS ai_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            challenge_id TEXT NOT NULL,
            ai_score REAL NOT NULL,
            code_quality REAL NOT NULL,
            testing_rate REAL NOT NULL,
            logic_score REAL NOT NULL,
            clarity_score REAL NOT NULL,
            efficiency_score REAL NOT NULL,
            api_ui_score REAL NOT NULL DEFAULT 0,
            edge_cases_score REAL NOT NULL DEFAULT 0,
            creativity_score REAL NOT NULL DEFAULT 0,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id),
            FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id),
            UNIQUE(user_id, challenge_id)
          )
        `);

        // Recruiter Criteria table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS recruiter_criteria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id TEXT NOT NULL,
            logic_weight REAL NOT NULL DEFAULT 0.25,
            clarity_weight REAL NOT NULL DEFAULT 0.30,
            testing_weight REAL NOT NULL DEFAULT 0.0,
            efficiency_weight REAL NOT NULL DEFAULT 0.0,
            api_ui_weight REAL NOT NULL DEFAULT 0.20,
            edge_cases_weight REAL NOT NULL DEFAULT 0.15,
            creativity_weight REAL NOT NULL DEFAULT 0.10,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id)
          )
        `);

        // Final Rankings table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS final_rankings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            challenge_id TEXT NOT NULL,
            final_score REAL NOT NULL,
            rank INTEGER NOT NULL,
            logic_contribution REAL NOT NULL,
            clarity_contribution REAL NOT NULL,
            testing_contribution REAL NOT NULL,
            efficiency_contribution REAL NOT NULL,
            api_ui_contribution REAL NOT NULL DEFAULT 0,
            edge_cases_contribution REAL NOT NULL DEFAULT 0,
            creativity_contribution REAL NOT NULL DEFAULT 0,
            calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id),
            FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id),
            UNIQUE(user_id, challenge_id)
          )
        `);
      });
    }
  }

  // User operations
  async createUser(userId, name, email = null) {
    if (this.isProduction) {
      const user = { id: Date.now(), userId, name, email, created_at: new Date().toISOString() };
      this.db.set(`user_${userId}`, user);
      return user;
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(
          'INSERT OR REPLACE INTO users (user_id, name, email) VALUES (?, ?, ?)',
          [userId, name, email],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, userId, name, email });
          }
        );
      });
    }
  }

  async getUser(userId) {
    if (this.isProduction) {
      return this.db.get(`user_${userId}`) || null;
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(
          'SELECT * FROM users WHERE user_id = ?',
          [userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }
  }

  // Challenge operations
  async createChallenge(challengeId, title, description = null) {
    if (this.isProduction) {
      const challenge = { id: Date.now(), challengeId, title, description, created_at: new Date().toISOString() };
      this.db.set(`challenge_${challengeId}`, challenge);
      return challenge;
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(
          'INSERT OR REPLACE INTO challenges (challenge_id, title, description) VALUES (?, ?, ?)',
          [challengeId, title, description],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, challengeId, title, description });
          }
        );
      });
    }
  }

  // AI Score operations
  async submitAIScore(scoreData) {
    const { 
      user_id, challenge_id, ai_score, code_quality, testing_rate, 
      logic_score, clarity_score, efficiency_score, 
      api_ui_score = 0, edge_cases_score = 0, creativity_score = 0 
    } = scoreData;

    if (this.isProduction) {
      const score = { 
        id: Date.now(), 
        ...scoreData, 
        submitted_at: new Date().toISOString() 
      };
      this.db.set(`ai_score_${user_id}_${challenge_id}`, score);
      return score;
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(
          `INSERT OR REPLACE INTO ai_scores 
           (user_id, challenge_id, ai_score, code_quality, testing_rate, logic_score, clarity_score, efficiency_score, api_ui_score, edge_cases_score, creativity_score) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user_id, challenge_id, ai_score, code_quality, testing_rate, logic_score, clarity_score, efficiency_score, api_ui_score, edge_cases_score, creativity_score],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, ...scoreData });
          }
        );
      });
    }
  }

  // Recruiter Criteria operations
  async setRecruiterCriteria(challengeId, criteria) {
    const { 
      logic_weight, clarity_weight, testing_weight, efficiency_weight,
      api_ui_weight = 0.20, edge_cases_weight = 0.15, creativity_weight = 0.10
    } = criteria;

    if (this.isProduction) {
      const criteriaData = { 
        id: Date.now(), 
        challengeId, 
        ...criteria, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.db.set(`criteria_${challengeId}`, criteriaData);
      return criteriaData;
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(
          `INSERT OR REPLACE INTO recruiter_criteria 
           (challenge_id, logic_weight, clarity_weight, testing_weight, efficiency_weight, api_ui_weight, edge_cases_weight, creativity_weight, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [challengeId, logic_weight, clarity_weight, testing_weight, efficiency_weight, api_ui_weight, edge_cases_weight, creativity_weight],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, challengeId, ...criteria });
          }
        );
      });
    }
  }

  async getRecruiterCriteria(challengeId) {
    if (this.isProduction) {
      return this.db.get(`criteria_${challengeId}`) || null;
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(
          'SELECT * FROM recruiter_criteria WHERE challenge_id = ?',
          [challengeId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }
  }

  // Ranking operations
  async saveFinalRanking(rankingData) {
    const { 
      userId, challengeId, finalScore, rank, 
      logicContribution, clarityContribution, testingContribution, efficiencyContribution,
      apiUiContribution = 0, edgeCasesContribution = 0, creativityContribution = 0
    } = rankingData;

    if (this.isProduction) {
      const ranking = { 
        id: Date.now(), 
        ...rankingData, 
        calculated_at: new Date().toISOString() 
      };
      this.db.set(`ranking_${userId}_${challengeId}`, ranking);
      return ranking;
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(
          `INSERT OR REPLACE INTO final_rankings 
           (user_id, challenge_id, final_score, rank, logic_contribution, clarity_contribution, testing_contribution, efficiency_contribution, api_ui_contribution, edge_cases_contribution, creativity_contribution) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, challengeId, finalScore, rank, logicContribution, clarityContribution, testingContribution, efficiencyContribution, apiUiContribution, edgeCasesContribution, creativityContribution],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, ...rankingData });
          }
        );
      });
    }
  }

  async getAllChallenges() {
    try {
      if (this.isProduction) {
        // For production, get all challenges from the in-memory store
        const challenges = [];
        for (const [key, value] of this.db.entries()) {
          if (key.startsWith('challenge_')) {
            challenges.push(value);
          }
        }
        return challenges;
      } else {
        return new Promise((resolve, reject) => {
          this.db.all(
            'SELECT * FROM challenges ORDER BY created_at DESC',
            [],
            (err, rows) => {
              if (err) {
                console.error('Database error in getAllChallenges:', err);
                reject(err);
              } else {
                console.log('Retrieved challenges:', rows);
                resolve(rows);
              }
            }
          );
        });
      }
    } catch (error) {
      console.error('Error in getAllChallenges:', error);
      throw error;
    }
  }

  async getLeaderboard(challengeId, limit = 100) {
    if (this.isProduction) {
      // For production, we need to simulate the complex join query
      // This is a simplified version - in a real app, you'd use a proper cloud database
      const rankings = [];
      for (const [key, value] of this.db.entries()) {
        if (key.startsWith(`ranking_`) && value.challengeId === challengeId) {
          const userId = value.userId;
          const user = this.db.get(`user_${userId}`);
          const aiScore = this.db.get(`ai_score_${userId}_${challengeId}`);
          
          if (user && aiScore) {
            rankings.push({
              user_id: userId,
              name: user.name,
              final_score: value.finalScore,
              rank: value.rank,
              logic_contribution: value.logicContribution,
              clarity_contribution: value.clarityContribution,
              testing_contribution: value.testingContribution,
              efficiency_contribution: value.efficiencyContribution,
              api_ui_contribution: value.apiUiContribution,
              edge_cases_contribution: value.edgeCasesContribution,
              creativity_contribution: value.creativityContribution,
              ai_score: aiScore.ai_score,
              code_quality: aiScore.code_quality,
              testing_rate: aiScore.testing_rate,
              logic_score: aiScore.logic_score,
              clarity_score: aiScore.clarity_score,
              efficiency_score: aiScore.efficiency_score,
              api_ui_score: aiScore.api_ui_score,
              edge_cases_score: aiScore.edge_cases_score,
              creativity_score: aiScore.creativity_score
            });
          }
        }
      }
      return rankings.sort((a, b) => a.rank - b.rank).slice(0, limit);
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(
          `SELECT 
            fr.user_id,
            u.name,
            fr.final_score,
            fr.rank,
            fr.logic_contribution,
            fr.clarity_contribution,
            fr.testing_contribution,
            fr.efficiency_contribution,
            fr.api_ui_contribution,
            fr.edge_cases_contribution,
            fr.creativity_contribution,
            ai.ai_score,
            ai.code_quality,
            ai.testing_rate,
            ai.logic_score,
            ai.clarity_score,
            ai.efficiency_score,
            ai.api_ui_score,
            ai.edge_cases_score,
            ai.creativity_score
          FROM final_rankings fr
          JOIN users u ON fr.user_id = u.user_id
          JOIN ai_scores ai ON fr.user_id = ai.user_id AND fr.challenge_id = ai.challenge_id
          WHERE fr.challenge_id = ?
          ORDER BY fr.rank ASC
          LIMIT ?`,
          [challengeId, limit],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
    }
  }

  async getAllAIScores(challengeId) {
    if (this.isProduction) {
      const scores = [];
      for (const [key, value] of this.db.entries()) {
        if (key.startsWith(`ai_score_`) && value.challenge_id === challengeId) {
          scores.push(value);
        }
      }
      return scores;
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(
          'SELECT * FROM ai_scores WHERE challenge_id = ?',
          [challengeId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
    }
  }

  async deleteChallengeLeaderboard(challengeId) {
    if (this.isProduction) {
      // For production, remove all related data from in-memory store
      for (const [key, value] of this.db.entries()) {
        if (key.includes(`_${challengeId}`) || 
            (value && value.challengeId === challengeId) ||
            (value && value.challenge_id === challengeId)) {
          this.db.delete(key);
        }
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.serialize(() => {
          // Delete from ai_scores
          this.db.run('DELETE FROM ai_scores WHERE challenge_id = ?', [challengeId]);
          
          // Delete from final_rankings
          this.db.run('DELETE FROM final_rankings WHERE challenge_id = ?', [challengeId]);
          
          resolve();
        });
      });
    }
  }

  async deleteChallenge(challengeId) {
    if (this.isProduction) {
      // For production, remove all related data from in-memory store
      for (const [key, value] of this.db.entries()) {
        if (key.includes(`_${challengeId}`) || 
            (value && value.challengeId === challengeId) ||
            (value && value.challenge_id === challengeId)) {
          this.db.delete(key);
        }
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.serialize(() => {
          // Delete from ai_scores
          this.db.run('DELETE FROM ai_scores WHERE challenge_id = ?', [challengeId]);
          
          // Delete from final_rankings
          this.db.run('DELETE FROM final_rankings WHERE challenge_id = ?', [challengeId]);
          
          // Delete from recruiter_criteria
          this.db.run('DELETE FROM recruiter_criteria WHERE challenge_id = ?', [challengeId]);
          
          // Delete from challenges
          this.db.run('DELETE FROM challenges WHERE challenge_id = ?', [challengeId]);
          
          resolve();
        });
      });
    }
  }

  async deleteUserFromChallenge(challengeId, userId) {
    if (this.isProduction) {
      // For production, remove user data from in-memory store
      for (const [key, value] of this.db.entries()) {
        if (key.includes(`_${challengeId}_${userId}`) || 
            (value && value.challengeId === challengeId && value.userId === userId) ||
            (value && value.challenge_id === challengeId && value.user_id === userId)) {
          this.db.delete(key);
        }
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.serialize(() => {
          // Delete from ai_scores
          this.db.run('DELETE FROM ai_scores WHERE challenge_id = ? AND user_id = ?', [challengeId, userId], (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Delete from final_rankings
            this.db.run('DELETE FROM final_rankings WHERE challenge_id = ? AND user_id = ?', [challengeId, userId], (err) => {
              if (err) {
                reject(err);
                return;
              }
              
              // Recalculate rankings for all remaining users in this challenge
              // this.recalculateRankingsSync(challengeId, resolve, reject);
              resolve();
            });
          });
        });
      });
    }
  }

  recalculateRankings(challengeId) {
    if (this.isProduction) {
      // For production, recalculate rankings in memory
      const scores = [];
      for (const [key, value] of this.db.entries()) {
        if (key.startsWith(`ai_score_`) && value.challenge_id === challengeId) {
          scores.push(value);
        }
      }
      
      // Sort by final_score descending
      scores.sort((a, b) => b.final_score - a.final_score);
      
      // Update rankings
      for (let i = 0; i < scores.length; i++) {
        const newRank = i + 1;
        const key = `final_ranking_${challengeId}_${scores[i].user_id}`;
        this.db.set(key, {
          ...scores[i],
          rank: newRank
        });
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.serialize(() => {
          // Get all remaining scores for this challenge
          this.db.all(
            'SELECT * FROM ai_scores WHERE challenge_id = ? ORDER BY final_score DESC',
            [challengeId],
            (err, scores) => {
              if (err) {
                reject(err);
                return;
              }
              
              // Update rankings for all remaining users
              let completed = 0;
              const total = scores.length;
              
              if (total === 0) {
                resolve();
                return;
              }
              
              scores.forEach((score, index) => {
                const newRank = index + 1;
                this.db.run(
                  'UPDATE final_rankings SET rank = ? WHERE challenge_id = ? AND user_id = ?',
                  [newRank, challengeId, score.user_id],
                  (updateErr) => {
                    if (updateErr) {
                      reject(updateErr);
                      return;
                    }
                    
                    completed++;
                    if (completed === total) {
                      resolve();
                    }
                  }
                );
              });
            }
          );
        });
      });
    }
  }

  recalculateRankingsSync(challengeId, resolve, reject) {
    if (this.isProduction) {
      // For production, recalculate rankings in memory
      const scores = [];
      for (const [key, value] of this.db.entries()) {
        if (key.startsWith(`ai_score_`) && value.challenge_id === challengeId) {
          scores.push(value);
        }
      }
      
      // Sort by final_score descending
      scores.sort((a, b) => b.final_score - a.final_score);
      
      // Update rankings
      for (let i = 0; i < scores.length; i++) {
        const newRank = i + 1;
        const key = `final_ranking_${challengeId}_${scores[i].user_id}`;
        this.db.set(key, {
          ...scores[i],
          rank: newRank
        });
      }
      resolve();
    } else {
      // Get all remaining scores for this challenge
      this.db.all(
        'SELECT * FROM ai_scores WHERE challenge_id = ? ORDER BY final_score DESC',
        [challengeId],
        (err, scores) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Update rankings for all remaining users
          let completed = 0;
          const total = scores.length;
          
          if (total === 0) {
            resolve();
            return;
          }
          
          scores.forEach((score, index) => {
            const newRank = index + 1;
            this.db.run(
              'UPDATE final_rankings SET rank = ? WHERE challenge_id = ? AND user_id = ?',
              [newRank, challengeId, score.user_id],
              (updateErr) => {
                if (updateErr) {
                  reject(updateErr);
                  return;
                }
                
                completed++;
                if (completed === total) {
                  resolve();
                }
              }
            );
          });
        }
      );
    }
  }

  close() {
    if (!this.isProduction && this.db) {
      this.db.close();
    }
  }
}

module.exports = DatabaseAdapter;
