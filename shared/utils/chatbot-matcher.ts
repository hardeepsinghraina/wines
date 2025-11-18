import { PredefinedResponse } from '../types/chatbot';
import { CHATBOT_RESPONSES, DEFAULT_RESPONSE } from '../constants/chatbot-responses';

/**
 * Matches user input to the most relevant predefined response
 * Uses keyword matching with scoring algorithm
 */
export class ChatbotMatcher {
  private responses: PredefinedResponse[];

  constructor(responses: PredefinedResponse[] = CHATBOT_RESPONSES) {
    this.responses = responses;
  }

  /**
   * Find the best matching response for user input
   */
  findBestMatch(userInput: string): string {
    if (!userInput || userInput.trim().length === 0) {
      return DEFAULT_RESPONSE;
    }

    const normalizedInput = this.normalizeText(userInput);
    const words = normalizedInput.split(/\s+/);
    
    let bestMatch: PredefinedResponse | null = null;
    let highestScore = 0;

    for (const response of this.responses) {
      const score = this.calculateMatchScore(words, response.keywords);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = response;
      }
    }

    // Return best match if score is above threshold, otherwise default
    return highestScore >= 0.3 ? bestMatch!.response : DEFAULT_RESPONSE;
  }

  /**
   * Get predefined questions for quick selection
   */
  getPredefinedQuestions(): Array<{ question: string; category: string }> {
    return this.responses
      .filter(response => response.question)
      .map(response => ({
        question: response.question!,
        category: response.category
      }));
  }

  /**
   * Get response by question (for predefined question selection)
   */
  getResponseByQuestion(question: string): string {
    const response = this.responses.find(r => r.question === question);
    return response ? response.response : DEFAULT_RESPONSE;
  }

  /**
   * Normalize text for better matching
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate match score between user words and response keywords
   */
  private calculateMatchScore(userWords: string[], keywords: string[]): number {
    if (userWords.length === 0 || keywords.length === 0) {
      return 0;
    }

    let matchCount = 0;
    let totalWeight = 0;

    for (const userWord of userWords) {
      for (const keyword of keywords) {
        const similarity = this.calculateWordSimilarity(userWord, keyword);
        if (similarity > 0.7) { // Threshold for considering a match
          matchCount += similarity;
          totalWeight += 1;
        }
      }
    }

    // Normalize score by the number of user words and keywords
    const normalizedScore = matchCount / Math.max(userWords.length, keywords.length);
    
    // Boost score if multiple keywords match
    const keywordBonus = Math.min(totalWeight / keywords.length, 1);
    
    return normalizedScore * 0.7 + keywordBonus * 0.3;
  }

  /**
   * Calculate similarity between two words
   * Uses simple string matching and partial matching
   */
  private calculateWordSimilarity(word1: string, word2: string): number {
    if (word1 === word2) {
      return 1.0;
    }

    // Check if one word contains the other
    if (word1.includes(word2) || word2.includes(word1)) {
      return 0.8;
    }

    // Check for common prefixes/suffixes
    if (word1.length >= 3 && word2.length >= 3) {
      if (word1.substring(0, 3) === word2.substring(0, 3)) {
        return 0.6;
      }
    }

    return 0;
  }
}