const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  try {
    console.log('🧪 Testing EduVerse Leaderboard API...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Create demo challenge
    console.log('\n2. Creating demo challenge...');
    const challengeResponse = await axios.post(`${API_BASE_URL}/challenges`, {
      challengeId: 'test-challenge-1',
      title: 'Test Challenge - API Validation',
      description: 'Testing the API endpoints'
    });
    console.log('✅ Challenge created:', challengeResponse.data);

    // Set recruiter criteria
    console.log('\n3. Setting recruiter criteria...');
    const criteriaResponse = await axios.post(`${API_BASE_URL}/challenges/test-challenge-1/criteria`, {
      logic_weight: 0.4,
      clarity_weight: 0.3,
      testing_weight: 0.3,
      efficiency_weight: 0.0
    });
    console.log('✅ Criteria set:', criteriaResponse.data);

    // Submit test AI scores
    console.log('\n4. Submitting test AI scores...');
    const testUsers = [
      {
        user_id: 'test_user_1',
        challenge_id: 'test-challenge-1',
        ai_score: 95.0,
        code_quality: 90.0,
        testing_rate: 100.0,
        logic_score: 95.0,
        clarity_score: 90.0,
        efficiency_score: 0.0,
        email: 'test1@example.com'
      },
      {
        user_id: 'test_user_2',
        challenge_id: 'test-challenge-1',
        ai_score: 85.0,
        code_quality: 80.0,
        testing_rate: 90.0,
        logic_score: 85.0,
        clarity_score: 85.0,
        efficiency_score: 0.0,
        email: 'test2@example.com'
      }
    ];

    for (const user of testUsers) {
      const scoreResponse = await axios.post(`${API_BASE_URL}/scores`, user);
      console.log(`✅ Score submitted for ${user.user_id}:`, scoreResponse.data);
    }

    // Calculate rankings
    console.log('\n5. Calculating rankings...');
    const rankingResponse = await axios.post(`${API_BASE_URL}/challenges/test-challenge-1/calculate-rankings`);
    console.log('✅ Rankings calculated:', rankingResponse.data);

    // Get leaderboard
    console.log('\n6. Fetching leaderboard...');
    const leaderboardResponse = await axios.get(`${API_BASE_URL}/challenges/test-challenge-1/leaderboard`);
    console.log('✅ Leaderboard:', leaderboardResponse.data);

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📊 Final Results:');
    leaderboardResponse.data.leaderboard.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.name} (@${entry.user_id}) - Score: ${entry.final_score.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();


