import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ScoreSubmission.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const ScoreSubmission = ({ challengeId, onScoreSubmitted }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    email: '',
    ai_score: '',
    code_quality: '',
    testing_rate: '',
    logic_score: '',
    clarity_score: '',
    efficiency_score: '',
    api_ui_score: '',
    edge_cases_score: '',
    creativity_score: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successTimeout, setSuccessTimeout] = useState(null);

  const showSuccessWithTimeout = (message) => {
    setSuccess(message);
    
    // Clear any existing timeout
    if (successTimeout) {
      clearTimeout(successTimeout);
    }
    
    // Set new timeout to hide success message after 5 seconds
    const timeout = setTimeout(() => {
      setSuccess(false);
    }, 5000);
    
    setSuccessTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeout) {
        clearTimeout(successTimeout);
      }
    };
  }, [successTimeout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert string values to numbers
      const scoreData = {
        user_id: formData.user_id,
        challenge_id: challengeId,
        email: formData.email,
        ai_score: parseFloat(formData.ai_score),
        code_quality: parseFloat(formData.code_quality),
        testing_rate: parseFloat(formData.testing_rate),
        logic_score: parseFloat(formData.logic_score),
        clarity_score: parseFloat(formData.clarity_score),
        efficiency_score: parseFloat(formData.efficiency_score) || 0,
        api_ui_score: parseFloat(formData.api_ui_score) || 0,
        edge_cases_score: parseFloat(formData.edge_cases_score) || 0,
        creativity_score: parseFloat(formData.creativity_score) || 0
      };

      // Submit the score
      await axios.post(`${API_BASE_URL}/scores`, scoreData);

      // Calculate rankings
      await axios.post(`${API_BASE_URL}/challenges/${challengeId}/calculate-rankings`);

      showSuccessWithTimeout('Score submitted successfully! The leaderboard has been updated.');
      setFormData({
        user_id: '',
        email: '',
        ai_score: '',
        code_quality: '',
        testing_rate: '',
        logic_score: '',
        clarity_score: '',
        efficiency_score: '',
        api_ui_score: '',
        edge_cases_score: '',
        creativity_score: ''
      });

      // Notify parent component to refresh leaderboard
      if (onScoreSubmitted) {
        onScoreSubmitted();
      }
    } catch (err) {
      setError('Failed to submit score: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeaderboard = async () => {
    if (!window.confirm('Are you sure you want to delete the entire leaderboard for this challenge? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/challenges/${challengeId}/leaderboard`);
      showSuccessWithTimeout('Leaderboard cleared successfully!');
      
      // Notify parent component to refresh
      if (onScoreSubmitted) {
        onScoreSubmitted();
      }
    } catch (err) {
      setError('Failed to clear leaderboard: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="score-submission">
      <h3>Submit New Score</h3>
      <form onSubmit={handleSubmit} className="score-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="user_id">User ID *</label>
            <input
              type="text"
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
              placeholder="e.g., john_doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g., john@example.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ai_score">AI Score * (0-100)</label>
            <input
              type="number"
              id="ai_score"
              name="ai_score"
              value={formData.ai_score}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="code_quality">Code Quality * (0-100)</label>
            <input
              type="number"
              id="code_quality"
              name="code_quality"
              value={formData.code_quality}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="testing_rate">Testing Rate * (0-100)</label>
            <input
              type="number"
              id="testing_rate"
              name="testing_rate"
              value={formData.testing_rate}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="logic_score">Logic Score * (0-100)</label>
            <input
              type="number"
              id="logic_score"
              name="logic_score"
              value={formData.logic_score}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clarity_score">Clarity Score * (0-100)</label>
            <input
              type="number"
              id="clarity_score"
              name="clarity_score"
              value={formData.clarity_score}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="efficiency_score">Efficiency Score (0-100)</label>
            <input
              type="number"
              id="efficiency_score"
              name="efficiency_score"
              value={formData.efficiency_score}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="api_ui_score">API/UI Score (0-100)</label>
            <input
              type="number"
              id="api_ui_score"
              name="api_ui_score"
              value={formData.api_ui_score}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="edge_cases_score">Edge Cases Score (0-100)</label>
            <input
              type="number"
              id="edge_cases_score"
              name="edge_cases_score"
              value={formData.edge_cases_score}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="creativity_score">Creativity Score (0-100)</label>
            <input
              type="number"
              id="creativity_score"
              name="creativity_score"
              value={formData.creativity_score}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="form-group">
            {/* Empty div for spacing */}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Submitting...' : 'Submit Score'}
        </button>
      </form>

      <div className="delete-actions">
        <button 
          onClick={handleDeleteLeaderboard}
          disabled={deleting}
          className="delete-leaderboard-button"
        >
          {deleting ? 'Clearing...' : '🗑️ Clear Leaderboard'}
        </button>
      </div>
    </div>
  );
};

export default ScoreSubmission;
