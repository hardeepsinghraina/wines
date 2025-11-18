'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { contentManagementAPI } from '../../lib/content-management-api';
import { SEOAnalysis } from '../../../../shared/types/content-management';

interface SEOOptimizationPanelProps {
  className?: string;
}

export const SEOOptimizationPanel: React.FC<SEOOptimizationPanelProps> = ({
  className = ''
}) => {
  const [contentId, setContentId] = useState('');
  const [language, setLanguage] = useState('en');
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  useEffect(() => {
    loadAvailableLanguages();
  }, []);

  const loadAvailableLanguages = async () => {
    try {
      const languages = await contentManagementAPI.getAvailableLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const handleAnalyzeSEO = async () => {
    if (!contentId) return;

    try {
      setLoading(true);
      const seoAnalysis = await contentManagementAPI.analyzeSEO(contentId, language);
      setAnalysis(seoAnalysis);
    } catch (error) {
      console.error('Error analyzing SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`seo-optimization-panel ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">SEO Optimization</h2>
        <p className="text-gray-600">Analyze and optimize content for search engines</p>
      </div>

      {/* Analysis Form */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyze Content SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content ID *
            </label>
            <input
              type="text"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Enter content ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAnalyzeSEO}
              disabled={!contentId || loading}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {loading ? <Loading size="sm" /> : '🔍 Analyze SEO'}
            </Button>
          </div>
        </div>
      </Card>

      {/* SEO Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">SEO Score</h3>
              <div className="text-sm text-gray-500">
                Analyzed {new Date(analysis.analyzedAt).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.score)}`}>
                {analysis.score}/100
              </div>
              <div>
                <div className="text-lg font-medium text-gray-900">
                  {analysis.score >= 80 ? 'Excellent' : analysis.score >= 60 ? 'Good' : 'Needs Improvement'}
                </div>
                <div className="text-sm text-gray-600">
                  Content ID: {analysis.contentId} | Language: {analysis.language.toUpperCase()}
                </div>
              </div>
            </div>
          </Card>

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Found</h3>
              <div className="space-y-4">
                {analysis.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{getIssueIcon(issue.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{issue.field}</div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(issue.impact)}`}>
                            {issue.impact.toUpperCase()} IMPACT
                          </span>
                        </div>
                        <p className="text-gray-600">{issue.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-4">
                {analysis.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">💡</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{recommendation.field}</div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(recommendation.priority)}`}>
                            {recommendation.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{recommendation.suggestion}</p>
                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                          <strong>Estimated Impact:</strong> {recommendation.estimatedImpact}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Keyword Analysis */}
          {analysis.keywords.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Analysis</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Density
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Search Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysis.keywords.map((keyword, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {keyword.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {keyword.density.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{keyword.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {keyword.searchVolume.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${keyword.competition * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                              {(keyword.competition * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${keyword.difficulty * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                              {(keyword.difficulty * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* SEO Tips */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Best Practices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Content Optimization</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Use target keywords naturally in content</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Write compelling meta descriptions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Optimize title tags for search intent</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Use header tags (H1, H2, H3) properly</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Technical SEO</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Ensure fast page loading times</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Implement structured data markup</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Optimize images with alt text</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Create XML sitemaps</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* No Analysis State */}
      {!analysis && !loading && (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">SEO Analysis</h3>
          <p className="text-gray-500 mb-4">
            Enter a content ID above to analyze its SEO performance and get optimization recommendations
          </p>
          <div className="text-sm text-gray-400">
            Our SEO analyzer checks title tags, meta descriptions, keyword density, and more
          </div>
        </Card>
      )}
    </div>
  );
};

export default SEOOptimizationPanel;