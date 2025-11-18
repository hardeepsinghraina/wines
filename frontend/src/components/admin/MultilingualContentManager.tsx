'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { Modal } from '../ui/Modal';
import { contentManagementAPI } from '../../lib/content-management-api';
import { ProductContent } from '../../../../shared/types/content-management';

interface MultilingualContentManagerProps {
  className?: string;
}

export const MultilingualContentManager: React.FC<MultilingualContentManagerProps> = ({
  className = ''
}) => {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [contentId, setContentId] = useState('');
  const [selectedContent, setSelectedContent] = useState<ProductContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [translationForm, setTranslationForm] = useState({
    fromLanguage: 'en',
    toLanguage: 'fr'
  });
  const [translating, setTranslating] = useState(false);

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

  const handleLoadContent = async () => {
    if (!contentId) return;

    try {
      setLoading(true);
      const content = await contentManagementAPI.getContent(contentId);
      setSelectedContent(content);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateContent = async () => {
    if (!selectedContent) return;

    try {
      setTranslating(true);
      const translatedContent = await contentManagementAPI.translateContent(
        selectedContent.id,
        translationForm.fromLanguage,
        translationForm.toLanguage
      );
      setSelectedContent(translatedContent);
      setShowTranslateModal(false);
    } catch (error) {
      console.error('Error translating content:', error);
    } finally {
      setTranslating(false);
    }
  };

  const getLanguageName = (code: string) => {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'fr': 'French',
      'de': 'German',
      'es': 'Spanish',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'zh': 'Chinese',
      'ko': 'Korean',
      'ru': 'Russian'
    };
    return languageNames[code] || code.toUpperCase();
  };

  const getLanguageFlag = (code: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'es': '🇪🇸',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ja': '🇯🇵',
      'zh': '🇨🇳',
      'ko': '🇰🇷',
      'ru': '🇷🇺'
    };
    return flags[code] || '🌐';
  };

  const getContentCompleteness = (content: Record<string, string>, language: string) => {
    const value = content[language];
    if (!value || value.trim() === '') return 0;
    if (value.length < 50) return 25;
    if (value.length < 100) return 50;
    if (value.length < 200) return 75;
    return 100;
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`multilingual-content-manager ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Multilingual Content Manager</h2>
        <p className="text-gray-600">Manage content translations across multiple languages</p>
      </div>

      {/* Content Loader */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Load Content for Translation</h3>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Enter content ID"
            />
          </div>
          <Button
            onClick={handleLoadContent}
            disabled={!contentId || loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {loading ? <Loading size="sm" /> : 'Load Content'}
          </Button>
        </div>
      </Card>

      {/* Content Translation Interface */}
      {selectedContent && (
        <div className="space-y-6">
          {/* Content Overview */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedContent.title.en || 'Untitled Content'}
                </h3>
                <p className="text-gray-600">Content ID: {selectedContent.id}</p>
              </div>
              <Button
                onClick={() => setShowTranslateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                🌐 Translate Content
              </Button>
            </div>

            {/* Language Completeness Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {availableLanguages.map((lang) => {
                const titleCompleteness = getContentCompleteness(selectedContent.title, lang);
                const descCompleteness = getContentCompleteness(selectedContent.description, lang);
                const avgCompleteness = Math.round((titleCompleteness + descCompleteness) / 2);

                return (
                  <div key={lang} className="text-center p-3 border border-gray-200 rounded-lg">
                    <div className="text-2xl mb-2">{getLanguageFlag(lang)}</div>
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {getLanguageName(lang)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${getCompletenessColor(avgCompleteness)}`}
                        style={{ width: `${avgCompleteness}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">{avgCompleteness}% complete</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Translation Status by Field */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Translation Status by Field</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Field
                    </th>
                    {availableLanguages.map((lang) => (
                      <th key={lang} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getLanguageFlag(lang)} {lang.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { key: 'title', label: 'Title', data: selectedContent.title },
                    { key: 'description', label: 'Description', data: selectedContent.description },
                    { key: 'shortDescription', label: 'Short Description', data: selectedContent.shortDescription },
                    { key: 'tastingNotes', label: 'Tasting Notes', data: selectedContent.tastingNotes },
                    { key: 'pairingNotes', label: 'Pairing Notes', data: selectedContent.pairingNotes },
                    { key: 'servingInstructions', label: 'Serving Instructions', data: selectedContent.servingInstructions },
                    { key: 'storageInstructions', label: 'Storage Instructions', data: selectedContent.storageInstructions },
                    { key: 'seoTitle', label: 'SEO Title', data: selectedContent.seoTitle },
                    { key: 'seoDescription', label: 'SEO Description', data: selectedContent.seoDescription }
                  ].map((field) => (
                    <tr key={field.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {field.label}
                      </td>
                      {availableLanguages.map((lang) => {
                        const hasContent = field.data[lang] && field.data[lang].trim() !== '';
                        const completeness = getContentCompleteness(field.data, lang);
                        
                        return (
                          <td key={lang} className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${hasContent ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="text-xs text-gray-500">{completeness}%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Content Preview by Language */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preview</h3>
            <div className="space-y-6">
              {availableLanguages.filter(lang => 
                selectedContent.title[lang] || selectedContent.description[lang]
              ).map((lang) => (
                <div key={lang} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{getLanguageFlag(lang)}</span>
                    <h4 className="text-lg font-medium text-gray-900">{getLanguageName(lang)}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedContent.title[lang] && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Title</div>
                        <div className="text-gray-900">{selectedContent.title[lang]}</div>
                      </div>
                    )}
                    
                    {selectedContent.description[lang] && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                        <div className="text-gray-600 text-sm line-clamp-3">
                          {selectedContent.description[lang]}
                        </div>
                      </div>
                    )}
                    
                    {selectedContent.tastingNotes[lang] && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Tasting Notes</div>
                        <div className="text-gray-600 text-sm">
                          {selectedContent.tastingNotes[lang]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* No Content State */}
      {!selectedContent && !loading && (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Multilingual Content Management</h3>
          <p className="text-gray-500 mb-4">
            Load content above to manage translations across {availableLanguages.length} supported languages
          </p>
          <div className="flex justify-center space-x-2 text-2xl">
            {availableLanguages.slice(0, 8).map((lang) => (
              <span key={lang} title={getLanguageName(lang)}>
                {getLanguageFlag(lang)}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Translation Modal */}
      {showTranslateModal && (
        <Modal
          isOpen={showTranslateModal}
          onClose={() => setShowTranslateModal(false)}
          title="Translate Content"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Language
                </label>
                <select
                  value={translationForm.fromLanguage}
                  onChange={(e) => setTranslationForm(prev => ({ ...prev, fromLanguage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {getLanguageFlag(lang)} {getLanguageName(lang)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Language
                </label>
                <select
                  value={translationForm.toLanguage}
                  onChange={(e) => setTranslationForm(prev => ({ ...prev, toLanguage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableLanguages.filter(lang => lang !== translationForm.fromLanguage).map((lang) => (
                    <option key={lang} value={lang}>
                      {getLanguageFlag(lang)} {getLanguageName(lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Translation Information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Automatic translation will be applied to all text fields</li>
                    <li>Review and edit translations before publishing</li>
                    <li>SEO fields will also be translated for better search visibility</li>
                    <li>Custom fields may require manual review</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowTranslateModal(false)}
                variant="outline"
                disabled={translating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTranslateContent}
                disabled={translating || translationForm.fromLanguage === translationForm.toLanguage}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {translating ? <Loading size="sm" /> : '🌐 Translate Content'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MultilingualContentManager;