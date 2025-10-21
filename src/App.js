import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Leaderboard from './components/Leaderboard';
import ScoreSubmission from './components/ScoreSubmission';
import ChallengeManagement from './components/ChallengeManagement';
import './App.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

function App() {
  const [challengeId, setChallengeId] = useState('demo-challenge-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDemoSetup, setShowDemoSetup] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showChallengeManagement, setShowChallengeManagement] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [deletingChallenge, setDeletingChallenge] = useState(false);

  const fetchAvailableChallenges = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenges`);
      setAvailableChallenges(response.data.challenges || []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setAvailableChallenges([]);
    }
  }, []);

  const checkForData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenges/${challengeId}/leaderboard`);
      if (response.data.leaderboard.length === 0) {
        setShowDemoSetup(true);
        setShowLeaderboard(false);
      } else {
        setShowDemoSetup(false);
        setShowLeaderboard(true);
      }
    } catch (err) {
      setShowDemoSetup(true);
      setShowLeaderboard(false);
    }
  }, [challengeId]);

  const checkForDataWithoutRedirect = useCallback(async (selectedChallengeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenges/${selectedChallengeId}/leaderboard`);
      // Just return the data, don't change the view state
      return response.data.leaderboard;
    } catch (err) {
      console.error('Error checking challenge data:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    // Fetch available challenges
    fetchAvailableChallenges();
  }, [fetchAvailableChallenges]);

  useEffect(() => {
    // Check for data on initial load
    checkForData();
  }, [checkForData]);


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
      setShowLeaderboard(true);
    } catch (err) {
      setError('Failed to setup demo data: ' + (err.response?.data?.error || err.message));
      console.error('Demo setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setShowLeaderboard(false);
    setShowChallengeManagement(false);
    setShowDemoSetup(true);
  };

  const handleScoreSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleChallengeCreated = () => {
    fetchAvailableChallenges(); // Refresh challenges list
  };

  const handleDeleteChallenge = async () => {
    const challengeName = availableChallenges.find(c => c.challenge_id === challengeId)?.title || challengeId;
    
    if (!window.confirm(`Are you sure you want to delete the challenge "${challengeName}"? This will permanently delete the challenge and all its data. This action cannot be undone.`)) {
      return;
    }

    setDeletingChallenge(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/challenges/${challengeId}`);
      
      // Refresh challenges list
      await fetchAvailableChallenges();
      
      // If we deleted the current challenge, switch to the first available one or go to demo setup
      if (availableChallenges.length <= 1) {
        setShowLeaderboard(false);
        setShowDemoSetup(true);
      } else {
        const remainingChallenges = availableChallenges.filter(c => c.challenge_id !== challengeId);
        if (remainingChallenges.length > 0) {
          setChallengeId(remainingChallenges[0].challenge_id);
          setRefreshTrigger(prev => prev + 1);
        }
      }
    } catch (err) {
      setError('Failed to delete challenge: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingChallenge(false);
    }
  };

  const handleChallengeSelect = (selectedChallengeId) => {
    setChallengeId(selectedChallengeId);
    setShowChallengeManagement(false);
    setShowLeaderboard(true);
  };

  const handleChallengeChange = async (selectedChallengeId) => {
    setChallengeId(selectedChallengeId);
    setRefreshTrigger(prev => prev + 1); // Trigger leaderboard refresh
    
    // Ensure we stay on the leaderboard page when switching challenges
    if (showLeaderboard) {
      // We're already on the leaderboard, just update the challenge
      return;
    } else if (showChallengeManagement) {
      // We're on challenge management, switch to leaderboard for the selected challenge
      setShowChallengeManagement(false);
      setShowLeaderboard(true);
    } else {
      // We're on demo setup, check if the selected challenge has data
      const leaderboardData = await checkForDataWithoutRedirect(selectedChallengeId);
      if (leaderboardData.length > 0) {
        setShowDemoSetup(false);
        setShowLeaderboard(true);
      }
      // If no data, stay on demo setup
    }
  };

  const handleManageChallenges = () => {
    setShowDemoSetup(false);
    setShowLeaderboard(false);
    setShowChallengeManagement(true);
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
              <p>Create and manage coding challenges with AI-powered scoring and comprehensive leaderboards.</p>
              
              <div className="demo-actions">
                <button
                  onClick={setupDemoData}
                  disabled={loading}
                  className="demo-action-button setup-demo-button"
                >
                  {loading ? 'Setting up demo...' : 'Setup Demo Data'}
                </button>
                <button
                  onClick={handleManageChallenges}
                  className="demo-action-button manage-challenges-button"
                >
                  Manage Challenges
                </button>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : showLeaderboard ? (
          <div className="leaderboard-section">
            <div className="challenge-selector">
              <div className="challenge-controls">
                <div className="challenge-dropdown">
                  <label htmlFor="challenge-select">Select Challenge:</label>
                  <select 
                    id="challenge-select"
                    value={challengeId} 
                    onChange={(e) => handleChallengeChange(e.target.value)}
                    className="challenge-select"
                  >
                    {availableChallenges.map((challenge) => (
                      <option key={challenge.challenge_id} value={challenge.challenge_id}>
                        {challenge.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleDeleteChallenge}
                  disabled={deletingChallenge}
                  className="delete-challenge-button"
                >
                  {deletingChallenge ? 'Deleting...' : '🗑️ Delete Challenge'}
                </button>
              </div>
            </div>
            
            <ScoreSubmission 
              challengeId={challengeId} 
              onScoreSubmitted={handleScoreSubmitted}
            />
            
            <Leaderboard 
              challengeId={challengeId} 
              onBack={handleBackToHome}
              refreshTrigger={refreshTrigger}
            />
          </div>
        ) : showChallengeManagement ? (
          <ChallengeManagement 
            onChallengeSelect={handleChallengeSelect}
            onBack={handleBackToHome}
            onChallengeCreated={handleChallengeCreated}
          />
        ) : null}
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
