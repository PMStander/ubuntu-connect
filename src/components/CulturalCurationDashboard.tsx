import React, { useState, useEffect } from 'react';
import {
  CulturalAchievementCuration,
  CurationRequest,
  ValidationRequest,
  CommunityReviewData,
  PublicationDecision
} from '../types/achievement';
import { culturalCurationService } from '../services/culturalCurationService';

interface CulturalCurationDashboardProps {
  userId: string;
  userRole: 'cultural_representative' | 'expert' | 'community_member';
}

const CulturalCurationDashboard: React.FC<CulturalCurationDashboardProps> = ({ userId, userRole }) => {
  const [curations, setCurations] = useState<CulturalAchievementCuration[]>([]);
  const [pendingValidations, setPendingValidations] = useState<ValidationRequest[]>([]);
  const [selectedCuration, setSelectedCuration] = useState<CulturalAchievementCuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my_curations' | 'pending_review' | 'published' | 'analytics'>('my_curations');
  const [showCurationForm, setShowCurationForm] = useState(false);
  const [curationReport, setCurationReport] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [userId, userRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (userRole === 'cultural_representative') {
        const userCurations = await culturalCurationService.getCurationsByRepresentative(userId);
        setCurations(userCurations);
      }
      
      if (userRole === 'expert') {
        const validations = await culturalCurationService.getPendingValidations(userId);
        setPendingValidations(validations);
      }
      
      const report = await culturalCurationService.generateCurationReport({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      });
      setCurationReport(report);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCuration = async (formData: any) => {
    try {
      const request: CurationRequest = {
        achievementId: formData.achievementId,
        culturalRepresentativeId: userId,
        curationReason: formData.reason,
        proposedSignificance: formData.significance,
        traditionalElements: formData.traditionalElements.split(',').map((e: string) => e.trim()),
        culturalProtocols: formData.protocols.split(',').map((p: string) => p.trim()),
        sensitivityLevel: formData.sensitivityLevel,
        communityConsultationRequired: formData.requiresConsultation
      };

      const curation = await culturalCurationService.submitCurationRequest(request);
      setCurations(prev => [...prev, curation]);
      setShowCurationForm(false);
    } catch (error) {
      console.error('Error submitting curation:', error);
    }
  };

  const handleValidationSubmission = async (validationId: string, findings: string, confidence: number) => {
    try {
      const validation = {
        expertId: userId,
        expertType: 'cultural_expert' as const,
        consultationDate: new Date(),
        findings,
        recommendations: [findings],
        confidence
      };

      await culturalCurationService.submitExpertValidation(validationId, userId, validation);
      
      // Remove from pending validations
      setPendingValidations(prev => prev.filter(v => v.curationId !== validationId));
    } catch (error) {
      console.error('Error submitting validation:', error);
    }
  };

  const handleCommunityReview = async (curationId: string, reviewData: any) => {
    try {
      const review: CommunityReviewData = {
        curationId,
        reviewerId: userId,
        reviewType: reviewData.type,
        rating: reviewData.rating,
        feedback: reviewData.feedback,
        culturalContext: reviewData.culturalContext
      };

      await culturalCurationService.submitCommunityReview(review);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handlePublicationDecision = async (curationId: string, decision: any) => {
    try {
      const publicationDecision: PublicationDecision = {
        curationId,
        decision: decision.action,
        visibility: decision.visibility,
        conditions: decision.conditions || [],
        reviewNotes: decision.notes
      };

      await culturalCurationService.makePublicationDecision(publicationDecision);
      await loadDashboardData();
    } catch (error) {
      console.error('Error making publication decision:', error);
    }
  };

  const renderCurationCard = (curation: CulturalAchievementCuration) => (
    <div 
      key={curation.id}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedCuration(curation)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-900">
          Cultural Significance Curation
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs ${
          curation.publicationStatus.status === 'published' ? 'bg-green-100 text-green-800' :
          curation.publicationStatus.status === 'cultural_review' ? 'bg-yellow-100 text-yellow-800' :
          curation.publicationStatus.status === 'community_review' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {curation.publicationStatus.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4">
        {curation.curationMetadata.culturalSignificance.culturalImpact}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sensitivity Level:</span>
          <span className="font-medium capitalize">{curation.curationMetadata.sensitivityLevel.level}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Validation Score:</span>
          <span className="font-medium">{curation.culturalValidation.validationScore}/100</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Community Approval:</span>
          <span className="font-medium">{curation.communityEndorsement.votingResults.approvalPercentage}%</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {curation.curationMetadata.traditionalElements.slice(0, 3).map((element, index) => (
          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
            {element.element}
          </span>
        ))}
        {curation.curationMetadata.traditionalElements.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
            +{curation.curationMetadata.traditionalElements.length - 3} more
          </span>
        )}
      </div>
    </div>
  );

  const renderValidationCard = (validation: ValidationRequest) => (
    <div key={validation.curationId} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-900">Validation Request</h3>
        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
          {validation.validatorType.replace('_', ' ')}
        </span>
      </div>
      
      <div className="space-y-3 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Validation Criteria:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {validation.validationCriteria.map((criterion: string, index: number) => (
              <li key={index}>• {criterion}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Your Expertise Areas:</h4>
          <div className="flex flex-wrap gap-2">
            {validation.expertiseAreas.map((area: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <textarea
          placeholder="Enter your validation findings..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          rows={3}
          id={`findings-${validation.curationId}`}
        />
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Confidence Level:</label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="80"
            className="flex-1"
            id={`confidence-${validation.curationId}`}
          />
          <span className="text-sm text-gray-600">80%</span>
        </div>
        
        <button
          onClick={() => {
            const findings = (document.getElementById(`findings-${validation.curationId}`) as HTMLTextAreaElement).value;
            const confidence = parseInt((document.getElementById(`confidence-${validation.curationId}`) as HTMLInputElement).value);
            handleValidationSubmission(validation.curationId, findings, confidence);
          }}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Submit Validation
        </button>
      </div>
    </div>
  );

  const renderCurationForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Submit Cultural Curation</h2>
          <button
            onClick={() => setShowCurationForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const data = Object.fromEntries(formData.entries());
          (data as any).requiresConsultation = (formData.get('requiresConsultation') as string) === 'on';
          handleSubmitCuration(data);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Achievement ID</label>
              <input
                type="text"
                name="achievementId"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter achievement ID to curate"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curation Reason</label>
              <textarea
                name="reason"
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Why is this achievement culturally significant?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cultural Significance</label>
              <textarea
                name="significance"
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the cultural significance and impact"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Traditional Elements</label>
              <input
                type="text"
                name="traditionalElements"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Comma-separated list of traditional elements"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cultural Protocols</label>
              <input
                type="text"
                name="protocols"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Comma-separated list of cultural protocols"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sensitivity Level</label>
              <select
                name="sensitivityLevel"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="community_only">Community Only</option>
                <option value="restricted">Restricted</option>
                <option value="sacred">Sacred</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="requiresConsultation"
                id="requiresConsultation"
                className="mr-2"
              />
              <label htmlFor="requiresConsultation" className="text-sm text-gray-700">
                Requires community consultation
              </label>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setShowCurationForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit Curation
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {curationReport && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6">Curation Analytics (Last 30 Days)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{curationReport.totalCurations}</div>
                <div className="text-sm text-gray-600">Total Curations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{curationReport.publishedCurations}</div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{Math.round(curationReport.publicationRate)}%</div>
                <div className="text-sm text-gray-600">Publication Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{Math.round(curationReport.averageValidationScore)}</div>
                <div className="text-sm text-gray-600">Avg Validation Score</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-semibold mb-4">Cultural Distribution</h4>
              <div className="space-y-2">
                {Object.entries(curationReport.culturalDistribution).map(([culture, count]) => (
                  <div key={culture} className="flex justify-between">
                    <span className="text-sm text-gray-600">{culture}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-semibold mb-4">Sensitivity Distribution</h4>
              <div className="space-y-2">
                {Object.entries(curationReport.sensitivityDistribution).map(([level, count]) => (
                  <div key={level} className="flex justify-between">
                    <span className="text-sm text-gray-600 capitalize">{level.replace('_', ' ')}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-semibold mb-4">Top Curations by Engagement</h4>
            <div className="space-y-3">
              {curationReport.topCurations.map((curation: any, index: number) => (
                <div key={curation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">#{index + 1}</span>
                    <span className="ml-2 text-sm text-gray-700">{curation.culturalSignificance}</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{curation.engagement} engagement</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cultural Curation Dashboard</h1>
          <p className="text-gray-600">
            Curate and validate culturally significant achievements with community oversight
          </p>
        </div>
        
        {userRole === 'cultural_representative' && (
          <button
            onClick={() => setShowCurationForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Submit New Curation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { key: 'my_curations', label: 'My Curations', icon: '📝', show: userRole === 'cultural_representative' },
          { key: 'pending_review', label: 'Pending Review', icon: '⏳', show: userRole === 'expert' },
          { key: 'published', label: 'Published', icon: '✅', show: true },
          { key: 'analytics', label: 'Analytics', icon: '📊', show: true }
        ].filter(tab => tab.show).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'my_curations' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Your Curations ({curations.length})</h2>
          {curations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curations.map(renderCurationCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No curations yet</h3>
              <p className="text-gray-600 mb-4">Start curating culturally significant achievements</p>
              <button
                onClick={() => setShowCurationForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Your First Curation
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending_review' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Pending Validations ({pendingValidations.length})</h2>
          {pendingValidations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingValidations.map(renderValidationCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending validations</h3>
              <p className="text-gray-600">All validation requests have been completed</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'published' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Published Curations</h2>
          <div className="text-center py-12">
            <p className="text-gray-600">Published curations will be displayed here</p>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && renderAnalytics()}

      {/* Curation Form Modal */}
      {showCurationForm && renderCurationForm()}

      {/* Curation Detail Modal */}
      {selectedCuration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Curation Details</h2>
              <button
                onClick={() => setSelectedCuration(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Cultural Significance</h3>
                <p className="text-gray-700">{selectedCuration.curationMetadata.culturalSignificance.culturalImpact}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Traditional Elements</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCuration.curationMetadata.traditionalElements.map((element, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {element.element}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Validation Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Validation Score:</span>
                    <span className="ml-2 font-medium">{selectedCuration.culturalValidation.validationScore}/100</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Cultural Accuracy:</span>
                    <span className="ml-2 font-medium">{selectedCuration.culturalValidation.culturalAccuracyRating}/100</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Community Approval</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Approval Rate:</span>
                    <span className="font-medium">{selectedCuration.communityEndorsement.votingResults.approvalPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Votes:</span>
                    <span className="font-medium">{selectedCuration.communityEndorsement.votingResults.totalVotes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CulturalCurationDashboard;
