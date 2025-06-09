import React, { useState, useEffect, useRef } from 'react';
import { 
  CrossCulturalConversation, 
  CrossCulturalMessage, 
  MessageTranslation,
  CommunicationAnalytics 
} from '../types/communication';
import { realTimeCommunicationService } from '../services/realTimeCommunicationService';

interface CrossCulturalCommunicationProps {
  userId: string;
  conversationId?: string;
}

const CrossCulturalCommunication: React.FC<CrossCulturalCommunicationProps> = ({ 
  userId, 
  conversationId 
}) => {
  const [conversations, setConversations] = useState<CrossCulturalConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<CrossCulturalConversation | null>(null);
  const [messages, setMessages] = useState<CrossCulturalMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [culturalGuidanceEnabled, setCulturalGuidanceEnabled] = useState(true);
  const [analytics, setAnalytics] = useState<CommunicationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'zu', name: 'Zulu' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'st', name: 'Sesotho' },
    { code: 'tn', name: 'Setswana' },
    { code: 'ss', name: 'Siswati' },
    { code: 've', name: 'Venda' },
    { code: 'ts', name: 'Tsonga' },
    { code: 'nr', name: 'Ndebele (South)' },
    { code: 'nd', name: 'Ndebele (North)' }
  ];

  useEffect(() => {
    loadConversations();
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [userId, conversationId]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      loadAnalytics(activeConversation.id);
      // Connect to WebSocket for real-time updates
      realTimeCommunicationService.connectToConversation(activeConversation.id, userId);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch user's conversations
      setConversations([]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (convId: string) => {
    try {
      const conversation = await realTimeCommunicationService.getConversation(convId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const conversationMessages = await realTimeCommunicationService.getMessages(
        convId, 
        translationEnabled ? selectedLanguage : undefined
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadAnalytics = async (convId: string) => {
    try {
      const conversationAnalytics = await realTimeCommunicationService.getConversationAnalytics(convId);
      setAnalytics(conversationAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const messageData = {
        text: newMessage,
        language: selectedLanguage,
        messageType: 'text' as const
      };

      const sentMessage = await realTimeCommunicationService.sendMessage(
        activeConversation.id,
        userId,
        messageData
      );

      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewConversation = async () => {
    try {
      const conversationData = {
        participants: [userId], // In real implementation, would select participants
        conversationType: 'group_chat' as const,
        culturalContext: {
          conversationCultures: ['Zulu', 'English', 'Afrikaans'],
          culturalSensitivities: [],
          communicationProtocols: [],
          translationPreferences: {}
        },
        translationEnabled: true
      };

      const newConversation = await realTimeCommunicationService.createConversation(
        conversationData,
        userId
      );

      setConversations(prev => [...prev, newConversation]);
      setActiveConversation(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const getMessageTranslation = (message: CrossCulturalMessage): string => {
    if (!translationEnabled || message.originalLanguage === selectedLanguage) {
      return message.originalText;
    }

    const translation = message.translations.find(t => t.language === selectedLanguage);
    return translation ? translation.translatedText : message.originalText;
  };

  const renderMessage = (message: CrossCulturalMessage) => {
    const isOwnMessage = message.senderId === userId;
    const displayText = getMessageTranslation(message);
    const translation = message.translations.find(t => t.language === selectedLanguage);

    return (
      <div
        key={message.id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm">{displayText}</p>
          
          {translation && translation.culturalNotes && translation.culturalNotes.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-gray-800">
              <strong>Cultural Note:</strong> {translation.culturalNotes[0]}
            </div>
          )}
          
          {message.culturalAnnotations.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.culturalAnnotations.map((annotation, index) => (
                <div key={index} className="p-2 bg-purple-100 rounded text-xs text-gray-800">
                  <strong>{annotation.annotationType}:</strong> {annotation.content}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2 text-xs opacity-75">
            <span>{message.timestamp.toLocaleTimeString()}</span>
            {message.originalLanguage !== selectedLanguage && (
              <span className="ml-2">
                Translated from {message.originalLanguage.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCulturalGuidance = () => {
    if (!culturalGuidanceEnabled || !activeConversation) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-900 mb-2">Cultural Guidance</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• This conversation includes participants from {activeConversation.culturalContext.conversationCultures?.join(', ')} cultures</p>
          <p>• Consider using respectful greetings and showing appreciation for cultural sharing</p>
          <p>• Ask questions about cultural references to show genuine interest</p>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-3">Communication Insights</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Cultural Engagement</p>
            <p className="font-semibold text-green-600">{analytics.culturalEngagement.score}%</p>
          </div>
          <div>
            <p className="text-gray-600">Translation Quality</p>
            <p className="font-semibold text-blue-600">{analytics.translationQuality.averageConfidence}%</p>
          </div>
          <div>
            <p className="text-gray-600">Understanding Score</p>
            <p className="font-semibold text-purple-600">{analytics.crossCulturalUnderstanding.understandingScore}%</p>
          </div>
          <div>
            <p className="text-gray-600">Relationship Building</p>
            <p className="font-semibold text-orange-600">{analytics.relationshipBuilding.relationshipStrength}%</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cross-Cultural Communication</h1>
        <button 
          onClick={createNewConversation}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          New Conversation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Language Selection */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-900 mb-3">Language Settings</h3>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            
            <div className="mt-3 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={translationEnabled}
                  onChange={(e) => setTranslationEnabled(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Enable Translation</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={culturalGuidanceEnabled}
                  onChange={(e) => setCulturalGuidanceEnabled(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Cultural Guidance</span>
              </label>
            </div>
          </div>

          {/* Analytics */}
          {renderAnalytics()}
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          {activeConversation ? (
            <div className="bg-white rounded-lg shadow h-96 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">
                  Cross-Cultural Conversation
                </h3>
                <p className="text-sm text-gray-600">
                  {activeConversation.participants.length} participants • 
                  {activeConversation.primaryLanguages.join(', ')} languages
                </p>
              </div>

              {/* Cultural Guidance */}
              <div className="p-4">
                {renderCulturalGuidance()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Type your message in ${supportedLanguages.find(l => l.code === selectedLanguage)?.name}...`}
                    className="flex-1 p-2 border border-gray-300 rounded-md resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  {translationEnabled && (
                    <span>Messages will be automatically translated for all participants</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Welcome to Cross-Cultural Communication
              </h3>
              <p className="text-gray-600 mb-6">
                Start a conversation to connect with people from different cultural backgrounds.
                Our platform provides real-time translation and cultural context to help you
                communicate effectively and build meaningful relationships.
              </p>
              <button 
                onClick={createNewConversation}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Start Your First Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossCulturalCommunication;
