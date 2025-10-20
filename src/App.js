import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Leaderboard from './components/Leaderboard';
import './App.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

function App() {
  const [challengeId, setChallengeId] = useState('demo-challenge-1');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDemoSetup, setShowDemoSetup] = useState(false);

  useEffect(() => {
    // Check if we have any data, if not show demo setup
    checkForData();
  }, []);

  const checkForData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenges/${challengeId}/leaderboard`);
      if (response.data.leaderboard.length === 0) {
        setShowDemoSetup(true);
      }
    } catch (err) {
      setShowDemoSetup(true);
    }
  };

  const setupDemoData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create demo challenge
      await axios.post(`${API_BASE_URL}/challenges`, {
        challengeId: 'demo-challenge-1',
        title: 'EduVerse Coding Challenge - Algorithm Implementation',
        description: 'Implement an efficient sorting algorithm with comprehensive testing'
      });

      // Set recruiter criteria
      await axios.post(`${API_BASE_URL}/challenges/demo-challenge-1/criteria`, {
        logic_weight: 0.25,
        clarity_weight: 0.30,
        testing_weight: 0.0,
        efficiency_weight: 0.0,
        api_ui_weight: 0.20,
        edge_cases_weight: 0.15,
        creativity_weight: 0.10
      });

      // Submit demo AI scores
      const demoUsers = [
        {
          user_id: 'alice_dev',
          challenge_id: 'demo-challenge-1',
          ai_score: 92.5,
          code_quality: 88.0,
          testing_rate: 95.0,
          logic_score: 90.0,
          clarity_score: 85.0,
          efficiency_score: 0.0,
          api_ui_score: 88.0,
          edge_cases_score: 92.0,
          creativity_score: 85.0,
          email: 'alice@example.com'
        },
        {
          user_id: 'bob_coder',
          challenge_id: 'demo-challenge-1',
          ai_score: 87.3,
          code_quality: 82.0,
          testing_rate: 88.0,
          logic_score: 85.0,
          clarity_score: 90.0,
          efficiency_score: 0.0,
          api_ui_score: 85.0,
          edge_cases_score: 80.0,
          creativity_score: 90.0,
          email: 'bob@example.com'
        },
        {
          user_id: 'charlie_engineer',
          challenge_id: 'demo-challenge-1',
          ai_score: 89.1,
          code_quality: 90.0,
          testing_rate: 85.0,
          logic_score: 88.0,
          clarity_score: 92.0,
          efficiency_score: 0.0,
          api_ui_score: 90.0,
          edge_cases_score: 88.0,
          creativity_score: 82.0,
          email: 'charlie@example.com'
        },
        {
          user_id: 'diana_programmer',
          challenge_id: 'demo-challenge-1',
          ai_score: 85.7,
          code_quality: 85.0,
          testing_rate: 90.0,
          logic_score: 82.0,
          clarity_score: 88.0,
          efficiency_score: 0.0,
          api_ui_score: 82.0,
          edge_cases_score: 85.0,
          creativity_score: 88.0,
          email: 'diana@example.com'
        },
        {
          user_id: 'eve_developer',
          challenge_id: 'demo-challenge-1',
          ai_score: 91.2,
          code_quality: 92.0,
          testing_rate: 87.0,
          logic_score: 95.0,
          clarity_score: 85.0,
          efficiency_score: 0.0,
          api_ui_score: 95.0,
          edge_cases_score: 90.0,
          creativity_score: 80.0,
          email: 'eve@example.com'
        }
      ];

      for (const user of demoUsers) {
        await axios.post(`${API_BASE_URL}/scores`, user);
      }

      // Calculate rankings
      await axios.post(`${API_BASE_URL}/challenges/demo-challenge-1/calculate-rankings`);

      setShowDemoSetup(false);
      window.location.reload(); // Refresh to show the leaderboard
    } catch (err) {
      setError('Failed to setup demo data: ' + (err.response?.data?.error || err.message));
      console.error('Demo setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 EduVerse Leaderboard System</h1>
        <p>AI-Powered Code Evaluation & Ranking Platform</p>
      </header>

      <main className="App-main">
        {showDemoSetup ? (
          <div className="demo-setup">
            <div className="demo-setup-content">
              <h2>Welcome to EduVerse Leaderboard!</h2>
              <p>This system processes AI-generated code scores and applies recruiter-defined grading criteria to create comprehensive leaderboards.</p>
              
              <div className="features">
                <h3>Key Features:</h3>
                <ul>
                  <li>✅ Weighted scoring algorithm with tie handling</li>
                  <li>✅ Real-time leaderboard with search functionality</li>
                  <li>✅ Top 3 highlighting with medal icons</li>
                  <li>✅ Detailed score breakdowns by evaluation criteria</li>
                  <li>✅ SQLite database persistence</li>
                  <li>✅ RESTful API architecture</li>
                </ul>
                
                <h3>Evaluation Criteria:</h3>
                <ul>
                  <li>📝 <strong>Code clarity & structure:</strong> 30%</li>
                  <li>🧠 <strong>Correctness of computation logic:</strong> 25%</li>
                  <li>🎨 <strong>API / UI design quality:</strong> 20%</li>
                  <li>🔍 <strong>Handling of edge cases/scalability:</strong> 15%</li>
                  <li>💡 <strong>Creativity / extra features:</strong> 10%</li>
                </ul>
              </div>

              <div className="demo-actions">
                <button 
                  onClick={setupDemoData} 
                  disabled={loading}
                  className="setup-demo-button"
                >
                  {loading ? 'Setting up demo...' : 'Setup Demo Data'}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="leaderboard-section">
            <div className="challenge-selector">
              <label htmlFor="challenge-select">Select Challenge:</label>
              <select 
                id="challenge-select"
                value={challengeId} 
                onChange={(e) => setChallengeId(e.target.value)}
                className="challenge-select"
              >
                <option value="demo-challenge-1">Demo Challenge 1 - Algorithm Implementation</option>
              </select>
            </div>
            
            <Leaderboard challengeId={challengeId} />
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Built for EduVerse - AI-Powered Education Platform</p>
        <div className="tech-stack">
          <span>React</span>
          <span>Node.js</span>
          <span>Express</span>
          <span>SQLite</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
