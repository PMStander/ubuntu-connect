import React, { useState } from 'react';
import CrossCulturalProjectDashboard from '../components/CrossCulturalProjectDashboard';
import CrossCulturalCommunication from '../components/CrossCulturalCommunication';
import CulturalEventDashboard from '../components/CulturalEventDashboard';

interface CrossCulturalCollaborationPageProps {
  userId: string;
}

const CrossCulturalCollaborationPage: React.FC<CrossCulturalCollaborationPageProps> = ({ userId }) => {
  const [activeSection, setActiveSection] = useState<'projects' | 'communication' | 'events'>('projects');

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'projects':
        return <CrossCulturalProjectDashboard userId={userId} />;
      case 'communication':
        return <CrossCulturalCommunication userId={userId} />;
      case 'events':
        return <CulturalEventDashboard userId={userId} />;
      default:
        return <CrossCulturalProjectDashboard userId={userId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cross-Cultural Collaboration</h1>
              <p className="text-gray-600 mt-1">
                Connect, collaborate, and celebrate South Africa's cultural diversity
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveSection('projects')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'projects'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveSection('communication')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'communication'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Communication
                </button>
                <button
                  onClick={() => setActiveSection('events')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'events'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Description */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {activeSection === 'projects' && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">Cross-Cultural Project Management</h3>
                <p className="text-blue-700">
                  Create and manage projects that bring together diverse communities to solve challenges 
                  and build understanding through collaborative action.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'communication' && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">Real-Time Cross-Cultural Communication</h3>
                <p className="text-blue-700">
                  Bridge language barriers and preserve cultural context with intelligent translation 
                  and cultural guidance for meaningful cross-cultural conversations.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'events' && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">Cultural Event Organization & Coordination</h3>
                <p className="text-blue-700">
                  Organize and coordinate cultural events that celebrate heritage, facilitate exchange, 
                  and create inclusive celebrations that unite diverse communities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {renderSectionContent()}
      </div>

      {/* Ubuntu Philosophy Footer */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Ubuntu: "I am because we are"</h3>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our cross-cultural collaboration tools are built on the Ubuntu philosophy, 
              recognizing that our individual growth and success are interconnected with 
              the wellbeing and prosperity of our communities. Through respectful collaboration, 
              cultural exchange, and shared learning, we build bridges that strengthen 
              the beautiful tapestry of South African diversity.
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">Respect & Understanding</h4>
              <p className="text-gray-400 text-sm">
                Honor all cultural traditions and approaches to collaboration
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">Inclusive Collaboration</h4>
              <p className="text-gray-400 text-sm">
                Ensure all voices are heard and valued in decision-making processes
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">Cultural Preservation</h4>
              <p className="text-gray-400 text-sm">
                Document and preserve cultural knowledge for future generations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossCulturalCollaborationPage;
