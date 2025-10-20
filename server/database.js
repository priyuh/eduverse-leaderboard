const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'leaderboard.db'));
    this.init();
  }

  init() {
    // Create tables
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
          FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id)
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
          FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id)
        )
      `);
    });
  }

  // User operations
  createUser(userId, name, email = null) {
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

  getUser(userId) {
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

  // Challenge operations
  createChallenge(challengeId, title, description = null) {
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

  // AI Score operations
  submitAIScore(scoreData) {
    return new Promise((resolve, reject) => {
      const { 
        user_id, challenge_id, ai_score, code_quality, testing_rate, 
        logic_score, clarity_score, efficiency_score, 
        api_ui_score = 0, edge_cases_score = 0, creativity_score = 0 
      } = scoreData;
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

  // Recruiter Criteria operations
  setRecruiterCriteria(challengeId, criteria) {
    return new Promise((resolve, reject) => {
      const { 
        logic_weight, clarity_weight, testing_weight, efficiency_weight,
        api_ui_weight = 0.20, edge_cases_weight = 0.15, creativity_weight = 0.10
      } = criteria;
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

  getRecruiterCriteria(challengeId) {
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

  // Ranking operations
  saveFinalRanking(rankingData) {
    return new Promise((resolve, reject) => {
      const { 
        userId, challengeId, finalScore, rank, 
        logicContribution, clarityContribution, testingContribution, efficiencyContribution,
        apiUiContribution = 0, edgeCasesContribution = 0, creativityContribution = 0
      } = rankingData;
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

  getLeaderboard(challengeId, limit = 100) {
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

  getAllAIScores(challengeId) {
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

  close() {
    this.db.close();
  }
}

module.exports = Database;
