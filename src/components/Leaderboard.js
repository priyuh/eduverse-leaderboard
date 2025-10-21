import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Leaderboard.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const Leaderboard = ({ challengeId, onBack, refreshTrigger }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/challenges/${challengeId}/leaderboard`);
      setLeaderboard(response.data.leaderboard);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard, refreshTrigger]);

  useEffect(() => {
    // Filter leaderboard based on search term
    if (searchTerm.trim() === '') {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLeaderboard(filtered);
    }
  }, [leaderboard, searchTerm]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankClass = (rank) => {
    if (rank <= 3) return 'top-three';
    return '';
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName} (@${userId}) from the leaderboard? This action cannot be undone.`)) {
      return;
    }

    setDeletingUser(userId);
    try {
      await axios.delete(`${API_BASE_URL}/challenges/${challengeId}/users/${userId}`);
      // Refresh the leaderboard after deletion
      await fetchLeaderboard();
    } catch (err) {
      setError('Failed to delete user: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error">{error}</div>
        <button onClick={fetchLeaderboard} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <div className="header-top">
          <button onClick={onBack} className="back-button">
            ← Back to Home
          </button>
          <h2>Leaderboard - Challenge {challengeId}</h2>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="stats">
          <span>Total Participants: {leaderboard.length}</span>
          <span>Showing: {filteredLeaderboard.length}</span>
        </div>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <div className="rank-col">Rank</div>
          <div className="name-col">Name</div>
          <div className="score-col">Final Score</div>
          <div className="breakdown-col">Score Breakdown</div>
          <div className="actions-col">Actions</div>
        </div>

        {filteredLeaderboard.length === 0 ? (
          <div className="no-results">
            {searchTerm ? 'No results found for your search.' : 'No participants yet.'}
          </div>
        ) : (
          filteredLeaderboard.map((entry, index) => (
            <div key={entry.user_id} className={`table-row ${getRankClass(entry.rank)}`}>
              <div className="rank-col">
                <span className="rank-icon">{getRankIcon(entry.rank)}</span>
                <span className="rank-number">{entry.rank}</span>
              </div>
              <div className="name-col">
                <div className="user-name">{entry.name}</div>
                <div className="user-id">@{entry.user_id}</div>
              </div>
              <div className="score-col">
                <div className="final-score">{entry.final_score.toFixed(2)}</div>
              </div>
              <div className="breakdown-col">
                <div className="score-breakdown">
                  <div className="breakdown-item">
                    <span className="label">Clarity & Structure:</span>
                    <span className="value">{entry.clarity_contribution.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="label">Logic:</span>
                    <span className="value">{entry.logic_contribution.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="label">API/UI Design:</span>
                    <span className="value">{entry.api_ui_contribution.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="label">Edge Cases:</span>
                    <span className="value">{entry.edge_cases_contribution.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="label">Creativity:</span>
                    <span className="value">{entry.creativity_contribution.toFixed(2)}</span>
                  </div>
                  {entry.testing_contribution > 0 && (
                    <div className="breakdown-item">
                      <span className="label">Testing:</span>
                      <span className="value">{entry.testing_contribution.toFixed(2)}</span>
                    </div>
                  )}
                  {entry.efficiency_contribution > 0 && (
                    <div className="breakdown-item">
                      <span className="label">Efficiency:</span>
                      <span className="value">{entry.efficiency_contribution.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="actions-col">
                <button
                  onClick={() => handleDeleteUser(entry.user_id, entry.name)}
                  disabled={deletingUser === entry.user_id}
                  className="delete-user-button"
                  title={`Delete ${entry.name}`}
                >
                  {deletingUser === entry.user_id ? '⏳' : '❌'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="leaderboard-footer">
        <button onClick={fetchLeaderboard} className="refresh-button">
          Refresh Leaderboard
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;