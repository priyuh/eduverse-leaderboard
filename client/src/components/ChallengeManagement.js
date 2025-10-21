import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ChallengeManagement.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const ChallengeManagement = ({ onChallengeSelect, onBack, onChallengeCreated }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [newChallenge, setNewChallenge] = useState({
    challengeId: '',
    title: '',
    description: '',
    logic_weight: 0.25,
    clarity_weight: 0.30,
    testing_weight: 0.0,
    efficiency_weight: 0.0,
    api_ui_weight: 0.20,
    edge_cases_weight: 0.15,
    creativity_weight: 0.10
  });

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/challenges`);
      setChallenges(response.data.challenges || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch challenges');
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChallenge(prev => ({
      ...prev,
      [name]: name.includes('_weight') ? parseFloat(value) || 0 : value
    }));
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      // Create the challenge
      await axios.post(`${API_BASE_URL}/challenges`, {
        challengeId: newChallenge.challengeId,
        title: newChallenge.title,
        description: newChallenge.description
      });

      // Set the criteria
      await axios.post(`${API_BASE_URL}/challenges/${newChallenge.challengeId}/criteria`, {
        logic_weight: newChallenge.logic_weight,
        clarity_weight: newChallenge.clarity_weight,
        testing_weight: newChallenge.testing_weight,
        efficiency_weight: newChallenge.efficiency_weight,
        api_ui_weight: newChallenge.api_ui_weight,
        edge_cases_weight: newChallenge.edge_cases_weight,
        creativity_weight: newChallenge.creativity_weight
      });

      // Reset form
      setNewChallenge({
        challengeId: '',
        title: '',
        description: '',
        logic_weight: 0.25,
        clarity_weight: 0.30,
        testing_weight: 0.0,
        efficiency_weight: 0.0,
        api_ui_weight: 0.20,
        edge_cases_weight: 0.15,
        creativity_weight: 0.10
      });

      setShowCreateForm(false);
      await fetchChallenges(); // Refresh the list
      
      // Notify parent component to refresh challenges list
      if (onChallengeCreated) {
        onChallengeCreated();
      }
    } catch (err) {
      setCreateError('Failed to create challenge: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  const getChallengeStats = async (challengeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenges/${challengeId}/leaderboard`);
      return response.data.leaderboard.length;
    } catch (err) {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="challenge-management">
        <div className="loading">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="challenge-management">
      <div className="challenge-header">
        <button onClick={onBack} className="back-button">
          ← Back to Home
        </button>
        <h2>Challenge Management</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-challenge-button"
        >
          + Create New Challenge
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="create-challenge-form">
          <h3>Create New Challenge</h3>
          <form onSubmit={handleCreateChallenge}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="challengeId">Challenge ID *</label>
                <input
                  type="text"
                  id="challengeId"
                  name="challengeId"
                  value={newChallenge.challengeId}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., algorithm-challenge-2"
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newChallenge.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Advanced Algorithm Challenge"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newChallenge.description}
                onChange={handleInputChange}
                placeholder="Describe the challenge requirements..."
                rows="3"
              />
            </div>

            <div className="criteria-section">
              <h4>Scoring Criteria Weights</h4>
              <div className="criteria-grid">
                <div className="form-group">
                  <label htmlFor="logic_weight">Logic Weight</label>
                  <input
                    type="number"
                    id="logic_weight"
                    name="logic_weight"
                    value={newChallenge.logic_weight}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="clarity_weight">Clarity Weight</label>
                  <input
                    type="number"
                    id="clarity_weight"
                    name="clarity_weight"
                    value={newChallenge.clarity_weight}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="testing_weight">Testing Weight</label>
                  <input
                    type="number"
                    id="testing_weight"
                    name="testing_weight"
                    value={newChallenge.testing_weight}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="efficiency_weight">Efficiency Weight</label>
                  <input
                    type="number"
                    id="efficiency_weight"
                    name="efficiency_weight"
                    value={newChallenge.efficiency_weight}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="api_ui_weight">API/UI Weight</label>
                  <input
                    type="number"
                    id="api_ui_weight"
                    name="api_ui_weight"
                    value={newChallenge.api_ui_weight}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edge_cases_weight">Edge Cases Weight</label>
                  <input
                    type="number"
                    id="edge_cases_weight"
                    name="edge_cases_weight"
                    value={newChallenge.edge_cases_weight}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="creativity_weight">Creativity Weight</label>
                  <input
                    type="number"
                    id="creativity_weight"
                    name="creativity_weight"
                    value={newChallenge.creativity_weight}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {createError && (
              <div className="error-message">
                {createError}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={creating}
                className="submit-button"
              >
                {creating ? 'Creating...' : 'Create Challenge'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="challenges-list">
        <h3>Available Challenges</h3>
        {challenges.length === 0 ? (
          <div className="no-challenges">
            <p>No challenges found. Create your first challenge!</p>
          </div>
        ) : (
          <div className="challenges-grid">
            {challenges.map((challenge) => (
              <div key={challenge.challenge_id} className="challenge-card">
                <div className="challenge-info">
                  <h4>{challenge.title}</h4>
                  <p className="challenge-id">ID: {challenge.challenge_id}</p>
                  {challenge.description && (
                    <p className="challenge-description">{challenge.description}</p>
                  )}
                </div>
                <div className="challenge-actions">
                  <button 
                    onClick={() => onChallengeSelect(challenge.challenge_id)}
                    className="view-leaderboard-button"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeManagement;
