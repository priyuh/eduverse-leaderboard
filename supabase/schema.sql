-- EduVerse Leaderboard Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  challenge_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Scores table
CREATE TABLE IF NOT EXISTS ai_scores (
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
  FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id),
  UNIQUE(user_id, challenge_id)
);

-- Recruiter Criteria table
CREATE TABLE IF NOT EXISTS recruiter_criteria (
  id SERIAL PRIMARY KEY,
  challenge_id TEXT UNIQUE NOT NULL,
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
);

-- Final Rankings table
CREATE TABLE IF NOT EXISTS final_rankings (
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
  FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id),
  UNIQUE(user_id, challenge_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_scores_challenge_id ON ai_scores(challenge_id);
CREATE INDEX IF NOT EXISTS idx_ai_scores_user_id ON ai_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_final_rankings_challenge_id ON final_rankings(challenge_id);
CREATE INDEX IF NOT EXISTS idx_final_rankings_rank ON final_rankings(challenge_id, rank);
CREATE INDEX IF NOT EXISTS idx_recruiter_criteria_challenge_id ON recruiter_criteria(challenge_id);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_rankings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON challenges FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON ai_scores FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON recruiter_criteria FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON final_rankings FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON ai_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON recruiter_criteria FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access" ON final_rankings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON challenges FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON ai_scores FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON recruiter_criteria FOR UPDATE USING (true);
CREATE POLICY "Allow public update access" ON final_rankings FOR UPDATE USING (true);

-- Insert some sample data for testing
INSERT INTO challenges (challenge_id, title, description) VALUES 
('demo-challenge-1', 'EduVerse Coding Challenge #1', 'Build a leaderboard system with AI evaluation'),
('demo-challenge-2', 'EduVerse Coding Challenge #2', 'Create a real-time chat application')
ON CONFLICT (challenge_id) DO NOTHING;

INSERT INTO users (user_id, name, email) VALUES 
('demo-user-1', 'Alice Johnson', 'alice@example.com'),
('demo-user-2', 'Bob Smith', 'bob@example.com'),
('demo-user-3', 'Carol Davis', 'carol@example.com')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO recruiter_criteria (challenge_id, logic_weight, clarity_weight, testing_weight, efficiency_weight, api_ui_weight, edge_cases_weight, creativity_weight) VALUES 
('demo-challenge-1', 0.25, 0.30, 0.0, 0.0, 0.20, 0.15, 0.10),
('demo-challenge-2', 0.30, 0.25, 0.10, 0.10, 0.15, 0.05, 0.05)
ON CONFLICT (challenge_id) DO NOTHING;
