class ScoreCalculator {
  /**
   * Calculate final weighted score based on AI scores and recruiter criteria
   * @param {Object} aiScore - AI evaluation scores
   * @param {Object} criteria - Recruiter-defined weights
   * @returns {Object} Final score breakdown
   */
  static calculateFinalScore(aiScore, criteria) {
    const {
      logic_score,
      clarity_score,
      testing_rate,
      efficiency_score = 0,
      api_ui_score = 0,
      edge_cases_score = 0,
      creativity_score = 0
    } = aiScore;

    const {
      logic_weight = 0.25,
      clarity_weight = 0.30,
      testing_weight = 0.0,
      efficiency_weight = 0.0,
      api_ui_weight = 0.20,
      edge_cases_weight = 0.15,
      creativity_weight = 0.10
    } = criteria;

    // Validate weights sum to 1.0 (with small tolerance for floating point)
    const totalWeight = logic_weight + clarity_weight + testing_weight + efficiency_weight + api_ui_weight + edge_cases_weight + creativity_weight;
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new Error(`Weights must sum to 1.0, got ${totalWeight}`);
    }

    // Calculate weighted contributions
    const logicContribution = logic_score * logic_weight;
    const clarityContribution = clarity_score * clarity_weight;
    const testingContribution = testing_rate * testing_weight;
    const efficiencyContribution = efficiency_score * efficiency_weight;
    const apiUiContribution = api_ui_score * api_ui_weight;
    const edgeCasesContribution = edge_cases_score * edge_cases_weight;
    const creativityContribution = creativity_score * creativity_weight;

    // Calculate final score
    const finalScore = logicContribution + clarityContribution + testingContribution + efficiencyContribution + apiUiContribution + edgeCasesContribution + creativityContribution;

    return {
      finalScore: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
      logicContribution: Math.round(logicContribution * 100) / 100,
      clarityContribution: Math.round(clarityContribution * 100) / 100,
      testingContribution: Math.round(testingContribution * 100) / 100,
      efficiencyContribution: Math.round(efficiencyContribution * 100) / 100,
      apiUiContribution: Math.round(apiUiContribution * 100) / 100,
      edgeCasesContribution: Math.round(edgeCasesContribution * 100) / 100,
      creativityContribution: Math.round(creativityContribution * 100) / 100,
      breakdown: {
        logic: { score: logic_score, weight: logic_weight, contribution: logicContribution },
        clarity: { score: clarity_score, weight: clarity_weight, contribution: clarityContribution },
        testing: { score: testing_rate, weight: testing_weight, contribution: testingContribution },
        efficiency: { score: efficiency_score, weight: efficiency_weight, contribution: efficiencyContribution },
        apiUi: { score: api_ui_score, weight: api_ui_weight, contribution: apiUiContribution },
        edgeCases: { score: edge_cases_score, weight: edge_cases_weight, contribution: edgeCasesContribution },
        creativity: { score: creativity_score, weight: creativity_weight, contribution: creativityContribution }
      }
    };
  }

  /**
   * Calculate rankings with proper tie handling
   * @param {Array} scores - Array of score objects with user_id and finalScore
   * @returns {Array} Ranked scores with rank property
   */
  static calculateRankings(scores) {
    if (!scores || scores.length === 0) {
      return [];
    }

    // Sort by final score in descending order
    const sortedScores = [...scores].sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks with tie handling
    const rankedScores = [];
    let currentRank = 1;
    let previousScore = null;

    for (let i = 0; i < sortedScores.length; i++) {
      const score = sortedScores[i];
      
      if (previousScore !== null && score.finalScore !== previousScore) {
        currentRank = i + 1;
      }
      
      rankedScores.push({
        ...score,
        rank: currentRank
      });
      
      previousScore = score.finalScore;
    }

    return rankedScores;
  }

  /**
   * Process all scores for a challenge and calculate rankings
   * @param {Array} aiScores - Array of AI scores
   * @param {Object} criteria - Recruiter criteria
   * @returns {Array} Final rankings
   */
  static processChallengeScores(aiScores, criteria) {
    if (!aiScores || aiScores.length === 0) {
      return [];
    }

    // Calculate final scores for all users
    const finalScores = aiScores.map(aiScore => {
      const calculation = this.calculateFinalScore(aiScore, criteria);
      return {
        userId: aiScore.user_id,
        challengeId: aiScore.challenge_id,
        finalScore: calculation.finalScore,
        ...calculation
      };
    });

    // Calculate rankings
    const rankings = this.calculateRankings(finalScores);

    return rankings;
  }

  /**
   * Validate AI score data
   * @param {Object} aiScore - AI score object
   * @returns {Object} Validation result
   */
  static validateAIScore(aiScore) {
    const errors = [];
    const required = ['user_id', 'challenge_id', 'ai_score', 'code_quality', 'testing_rate', 'logic_score', 'clarity_score'];
    
    // Check required fields
    for (const field of required) {
      if (aiScore[field] === undefined || aiScore[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check score ranges (assuming 0-100 scale)
    const scoreFields = ['ai_score', 'code_quality', 'testing_rate', 'logic_score', 'clarity_score', 'efficiency_score', 'api_ui_score', 'edge_cases_score', 'creativity_score'];
    for (const field of scoreFields) {
      if (aiScore[field] !== undefined && aiScore[field] !== null) {
        if (typeof aiScore[field] !== 'number' || aiScore[field] < 0 || aiScore[field] > 100) {
          errors.push(`${field} must be a number between 0 and 100`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate recruiter criteria
   * @param {Object} criteria - Recruiter criteria object
   * @returns {Object} Validation result
   */
  static validateCriteria(criteria) {
    const errors = [];
    const weightFields = ['logic_weight', 'clarity_weight', 'testing_weight', 'efficiency_weight', 'api_ui_weight', 'edge_cases_weight', 'creativity_weight'];
    
    // Check weight ranges
    for (const field of weightFields) {
      if (criteria[field] !== undefined && criteria[field] !== null) {
        if (typeof criteria[field] !== 'number' || criteria[field] < 0 || criteria[field] > 1) {
          errors.push(`${field} must be a number between 0 and 1`);
        }
      }
    }

    // Check total weight
    const totalWeight = weightFields.reduce((sum, field) => sum + (criteria[field] || 0), 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      errors.push(`Total weight must equal 1.0, got ${totalWeight}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ScoreCalculator;
