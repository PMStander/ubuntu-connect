import React, { useState, useEffect } from 'react';
import { 
  CulturalEvent, 
  EventAttendee, 
  CulturalPerformance, 
  CulturalWorkshop,
  EventImpact 
} from '../types/culturalEvent';
import { culturalEventService } from '../services/culturalEventService';

interface CulturalEventDashboardProps {
  userId: string;
}

const CulturalEventDashboard: React.FC<CulturalEventDashboardProps> = ({ userId }) => {
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [eventImpact, setEventImpact] = useState<EventImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'programming' | 'attendees' | 'impact'>('overview');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadEventDetails(selectedEvent.id);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch user's events
      const sampleEvents = await createSampleEvents();
      setEvents(sampleEvents);
      if (sampleEvents.length > 0) {
        setSelectedEvent(sampleEvents[0]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleEvents = async (): Promise<CulturalEvent[]> => {
    const eventData = {
      title: 'Ubuntu Cultural Festival',
      description: 'A celebration of South African cultural diversity through music, dance, and storytelling',
      eventType: 'festival' as const,
      format: 'hybrid' as const,
      location: {
        venue: 'Community Cultural Center',
        address: 'Cape Town, South Africa',
        culturalSignificance: 'Historic gathering place for multiple communities'
      },
      dateTime: {
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 1 week + 1 day from now
        culturalCalendarConsiderations: ['Heritage Month', 'Traditional harvest season']
      },
      culturalContext: {
        primaryCultures: ['Zulu', 'Xhosa', 'Afrikaans', 'English'],
        culturalSignificance: 'Celebrating unity in diversity through Ubuntu philosophy',
        traditionalElements: ['Traditional music', 'Storytelling', 'Cultural dances', 'Craft demonstrations'],
        culturalLearningObjectives: [
          'Understanding Ubuntu philosophy',
          'Appreciating cultural diversity',
          'Learning traditional practices'
        ]
      },
      targetCommunities: ['Zulu', 'Xhosa', 'Afrikaans', 'English', 'Sotho'],
      accessibility: {
        wheelchairAccessible: true,
        languageSupport: ['en', 'af', 'zu', 'xh', 'st'],
        culturalAccommodations: ['Prayer spaces', 'Dietary considerations', 'Cultural dress areas']
      }
    };

    const event = await culturalEventService.createEvent(eventData, userId);
    return [event];
  };

  const loadEventDetails = async (eventId: string) => {
    try {
      const eventAttendees = await culturalEventService.getEventAttendees(eventId);
      const impact = await culturalEventService.generateImpactReport(eventId);
      setAttendees(eventAttendees);
      setEventImpact(impact);
    } catch (error) {
      console.error('Error loading event details:', error);
    }
  };

  const handleCreateEvent = async () => {
    // This would open an event creation modal
    console.log('Create new cultural event');
  };

  const handleRSVP = async () => {
    if (!selectedEvent) return;

    try {
      const rsvpData = {
        eventId: selectedEvent.id,
        userId,
        attendanceType: 'full_event' as const,
        culturalBackground: 'Zulu',
        culturalContributions: ['Traditional music knowledge', 'Ubuntu philosophy'],
        dietaryRequirements: ['Vegetarian'],
        accessibilityNeeds: [],
        culturalInterests: ['Traditional music', 'Storytelling', 'Cultural dances']
      };

      const attendee = await culturalEventService.rsvpToEvent(rsvpData);
      setAttendees(prev => [...prev, attendee]);
    } catch (error) {
      console.error('Error RSVPing to event:', error);
    }
  };

  const renderEventOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cultural Context</h4>
            <p className="text-gray-700 mb-3">{selectedEvent?.culturalContext.culturalSignificance}</p>
            <div className="flex flex-wrap gap-2">
              {selectedEvent?.culturalContext.primaryCultures.map((culture, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {culture}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Event Information</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Format:</strong> {selectedEvent?.format.replace('_', ' ')}</p>
              <p><strong>Venue:</strong> {selectedEvent?.location.venue}</p>
              <p><strong>Date:</strong> {selectedEvent?.dateTime.startDate.toLocaleDateString()}</p>
              <p><strong>Status:</strong> {selectedEvent?.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Traditional Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedEvent?.culturalContext.traditionalElements.map((element, index) => (
            <div key={index} className="border-l-4 border-green-400 pl-4">
              <h4 className="font-medium text-gray-900">{element.element}</h4>
              <p className="text-sm text-gray-600">{element.significance}</p>
              <span className="text-xs text-green-600">{element.authenticity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Learning Objectives</h3>
        <div className="space-y-3">
          {selectedEvent?.culturalContext.culturalLearningObjectives.map((objective, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-medium">{index + 1}</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{objective.objective}</h4>
                <p className="text-sm text-gray-600">{objective.expectedOutcome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEventProgramming = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Event Programming</h3>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Performance
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Add Workshop
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 mb-4">Cultural Performances</h4>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-gray-900">Traditional Zulu Dance</h5>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Scheduled</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Authentic Zulu dance performance showcasing traditional movements and cultural significance
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Cultural Origin: Zulu</span>
              <span>Duration: 30 minutes</span>
              <span>Audience: All ages</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-gray-900">Ubuntu Storytelling Circle</h5>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Scheduled</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Interactive storytelling session sharing Ubuntu philosophy and traditional wisdom
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Cultural Origin: Pan-African</span>
              <span>Duration: 45 minutes</span>
              <span>Audience: All ages</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 mb-4">Cultural Workshops</h4>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-gray-900">Traditional Beadwork</h5>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Beginner</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Learn the art of traditional South African beadwork and its cultural meanings
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Cultural Focus: Zulu/Xhosa</span>
              <span>Duration: 90 minutes</span>
              <span>Limit: 20 participants</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-gray-900">Ubuntu Philosophy Discussion</h5>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Intermediate</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Deep dive into Ubuntu philosophy and its application in modern community building
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Cultural Focus: Pan-African</span>
              <span>Duration: 60 minutes</span>
              <span>Limit: 30 participants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendees = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Event Attendees</h3>
        <button 
          onClick={handleRSVP}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          RSVP to Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Attendees</h4>
          <p className="text-3xl font-bold text-blue-600">{attendees.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Cultural Diversity</h4>
          <p className="text-3xl font-bold text-green-600">
            {new Set(attendees.map(a => a.culturalBackground.primaryCulture)).size}
          </p>
          <p className="text-sm text-gray-600">Different cultures</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Volunteers</h4>
          <p className="text-3xl font-bold text-purple-600">
            {attendees.filter(a => a.attendanceType === 'volunteer').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 mb-4">Attendee List</h4>
        <div className="space-y-3">
          {attendees.map((attendee, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">
                  {attendee.attendanceType.replace('_', ' ')}
                </h5>
                <p className="text-sm text-gray-600">
                  {attendee.culturalBackground.primaryCulture} • 
                  Registered {attendee.registrationDate.toLocaleDateString()}
                </p>
                {attendee.culturalContributions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {attendee.culturalContributions.slice(0, 2).map((contribution, contribIndex) => (
                      <span key={contribIndex} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                        {contribution.description}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${
                  attendee.checkInStatus.checkedIn 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {attendee.checkInStatus.checkedIn ? 'Checked In' : 'Registered'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderImpact = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Event Impact Report</h3>
      
      {eventImpact && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">Cultural Diversity</h4>
              <p className="text-2xl font-bold text-blue-600">{eventImpact.attendanceMetrics.culturalDiversity}%</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">Cultural Interactions</h4>
              <p className="text-2xl font-bold text-green-600">{eventImpact.culturalExchange.culturalInteractions}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">Relationships Formed</h4>
              <p className="text-2xl font-bold text-purple-600">{eventImpact.socialCohesion.relationshipsFormed}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-2">Economic Benefit</h4>
              <p className="text-2xl font-bold text-orange-600">R{eventImpact.economicImpact.localEconomicBenefit}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4">Cultural Learning</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Learning Objectives Achieved</span>
                  <span className="font-medium">{eventImpact.culturalLearning.learningObjectivesAchieved}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cultural Competency Increase</span>
                  <span className="font-medium">{eventImpact.culturalLearning.culturalCompetencyIncrease}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Appreciation Growth</span>
                  <span className="font-medium">{eventImpact.culturalLearning.appreciationGrowth}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4">Cultural Preservation</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Knowledge Documented</span>
                  <span className="font-medium">{eventImpact.culturalPreservation.traditionalKnowledgeDocumented}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Practices Preserved</span>
                  <span className="font-medium">{eventImpact.culturalPreservation.culturalPracticesPreserved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Intergenerational Transfer</span>
                  <span className="font-medium">{eventImpact.culturalPreservation.intergenerationalTransfer}</span>
                </div>
              </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Cultural Events</h1>
        <button 
          onClick={handleCreateEvent}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create New Event
        </button>
      </div>

      {selectedEvent && (
        <>
          {/* Event Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
            <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                selectedEvent.status === 'active' ? 'bg-green-100 text-green-800' :
                selectedEvent.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedEvent.status}
              </span>
              <span className="text-sm text-gray-500">
                {selectedEvent.format} • {selectedEvent.eventType}
              </span>
              <span className="text-sm text-gray-500">
                {selectedEvent.dateTime.startDate.toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'programming', label: 'Programming' },
                  { key: 'attendees', label: 'Attendees' },
                  { key: 'impact', label: 'Impact' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && renderEventOverview()}
              {activeTab === 'programming' && renderEventProgramming()}
              {activeTab === 'attendees' && renderAttendees()}
              {activeTab === 'impact' && renderImpact()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CulturalEventDashboard;
