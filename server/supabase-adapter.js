// Supabase database adapter for production
const { createClient } = require('@supabase/supabase-js');

class SupabaseAdapter {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (this.isProduction) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and Key are required for production');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseKey);
      console.log('Using Supabase database for production');
    } else {
      // For development, use the existing SQLite adapter
      const DatabaseAdapter = require('./database-adapter');
      this.db = new DatabaseAdapter();
      console.log('Using SQLite database for development');
    }
  }

  async init() {
    if (this.isProduction) {
      // Initialize Supabase tables if they don't exist
      await this.createTables();
    } else {
      await this.db.init();
    }
  }

  async createTables() {
    if (!this.isProduction) return;

    // Create tables using Supabase SQL
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Challenges table
      `CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        challenge_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // AI Scores table
      `CREATE TABLE IF NOT EXISTS ai_scores (
        id SERIAL PRIMARY KEY,
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
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id)
      )`,
      
      // Recruiter Criteria table
      `CREATE TABLE IF NOT EXISTS recruiter_criteria (
        id SERIAL PRIMARY KEY,
        challenge_id TEXT NOT NULL,
        logic_weight REAL NOT NULL DEFAULT 0.25,
        clarity_weight REAL NOT NULL DEFAULT 0.30,
        testing_weight REAL NOT NULL DEFAULT 0.0,
        efficiency_weight REAL NOT NULL DEFAULT 0.0,
        api_ui_weight REAL NOT NULL DEFAULT 0.20,
        edge_cases_weight REAL NOT NULL DEFAULT 0.15,
        creativity_weight REAL NOT NULL DEFAULT 0.10,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id)
      )`,
      
      // Final Rankings table
      `CREATE TABLE IF NOT EXISTS final_rankings (
        id SERIAL PRIMARY KEY,
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
        calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id)
      )`
    ];

    for (const table of tables) {
      try {
        const { error } = await this.supabase.rpc('exec_sql', { sql: table });
        if (error) {
          console.log('Table might already exist:', error.message);
        }
      } catch (error) {
        console.log('Error creating table:', error.message);
      }
    }
  }

  // User operations
  async createUser(userId, name, email = null) {
    if (this.isProduction) {
      const { data, error } = await this.supabase
        .from('users')
        .upsert({ user_id: userId, name, email })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return await this.db.createUser(userId, name, email);
    }
  }

  async getUser(userId) {
    if (this.isProduction) {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } else {
      return await this.db.getUser(userId);
    }
  }

  // Challenge operations
  async createChallenge(challengeId, title, description = null) {
    if (this.isProduction) {
      const { data, error } = await this.supabase
        .from('challenges')
        .upsert({ challenge_id: challengeId, title, description })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return await this.db.createChallenge(challengeId, title, description);
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
      const { data, error } = await this.supabase
        .from('ai_scores')
        .upsert({
          user_id,
          challenge_id,
          ai_score,
          code_quality,
          testing_rate,
          logic_score,
          clarity_score,
          efficiency_score,
          api_ui_score,
          edge_cases_score,
          creativity_score
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return await this.db.submitAIScore(scoreData);
    }
  }

  // Recruiter Criteria operations
  async setRecruiterCriteria(challengeId, criteria) {
    const { 
      logic_weight, clarity_weight, testing_weight, efficiency_weight,
      api_ui_weight = 0.20, edge_cases_weight = 0.15, creativity_weight = 0.10
    } = criteria;

    if (this.isProduction) {
      const { data, error } = await this.supabase
        .from('recruiter_criteria')
        .upsert({
          challenge_id: challengeId,
          logic_weight,
          clarity_weight,
          testing_weight,
          efficiency_weight,
          api_ui_weight,
          edge_cases_weight,
          creativity_weight,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return await this.db.setRecruiterCriteria(challengeId, criteria);
    }
  }

  async getRecruiterCriteria(challengeId) {
    if (this.isProduction) {
      const { data, error } = await this.supabase
        .from('recruiter_criteria')
        .select('*')
        .eq('challenge_id', challengeId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } else {
      return await this.db.getRecruiterCriteria(challengeId);
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
      const { data, error } = await this.supabase
        .from('final_rankings')
        .upsert({
          user_id: userId,
          challenge_id: challengeId,
          final_score: finalScore,
          rank,
          logic_contribution: logicContribution,
          clarity_contribution: clarityContribution,
          testing_contribution: testingContribution,
          efficiency_contribution: efficiencyContribution,
          api_ui_contribution: apiUiContribution,
          edge_cases_contribution: edgeCasesContribution,
          creativity_contribution: creativityContribution
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      return await this.db.saveFinalRanking(rankingData);
    }
  }

  async getLeaderboard(challengeId, limit = 100) {
    if (this.isProduction) {
      const { data, error } = await this.supabase
        .from('final_rankings')
        .select(`
          user_id,
          final_score,
          rank,
          logic_contribution,
          clarity_contribution,
          testing_contribution,
          efficiency_contribution,
          api_ui_contribution,
          edge_cases_contribution,
          creativity_contribution,
          users!inner(name),
          ai_scores!inner(
            ai_score,
            code_quality,
            testing_rate,
            logic_score,
            clarity_score,
            efficiency_score,
            api_ui_score,
            edge_cases_score,
            creativity_score
          )
        `)
        .eq('challenge_id', challengeId)
        .order('rank', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      
      // Transform the data to match the expected format
      return data.map(row => ({
        user_id: row.user_id,
        name: row.users.name,
        final_score: row.final_score,
        rank: row.rank,
        logic_contribution: row.logic_contribution,
        clarity_contribution: row.clarity_contribution,
        testing_contribution: row.testing_contribution,
        efficiency_contribution: row.efficiency_contribution,
        api_ui_contribution: row.api_ui_contribution,
        edge_cases_contribution: row.edge_cases_contribution,
        creativity_contribution: row.creativity_contribution,
        ai_score: row.ai_scores.ai_score,
        code_quality: row.ai_scores.code_quality,
        testing_rate: row.ai_scores.testing_rate,
        logic_score: row.ai_scores.logic_score,
        clarity_score: row.ai_scores.clarity_score,
        efficiency_score: row.ai_scores.efficiency_score,
        api_ui_score: row.ai_scores.api_ui_score,
        edge_cases_score: row.ai_scores.edge_cases_score,
        creativity_score: row.ai_scores.creativity_score
      }));
    } else {
      return await this.db.getLeaderboard(challengeId, limit);
    }
  }

  async getAllAIScores(challengeId) {
    if (this.isProduction) {
      const { data, error } = await this.supabase
        .from('ai_scores')
        .select('*')
        .eq('challenge_id', challengeId);
      
      if (error) throw error;
      return data;
    } else {
      return await this.db.getAllAIScores(challengeId);
    }
  }

  close() {
    if (!this.isProduction && this.db) {
      this.db.close();
    }
  }
}

module.exports = SupabaseAdapter;
