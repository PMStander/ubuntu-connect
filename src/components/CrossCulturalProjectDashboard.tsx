import React, { useState, useEffect } from 'react';
import { 
  CrossCulturalProject, 
  ProjectTask, 
  ProjectMember, 
  TeamRecommendation 
} from '../types/crossCulturalProject';
import { crossCulturalProjectService } from '../services/crossCulturalProjectService';

interface CrossCulturalProjectDashboardProps {
  userId: string;
}

const CrossCulturalProjectDashboard: React.FC<CrossCulturalProjectDashboardProps> = ({ userId }) => {
  const [projects, setProjects] = useState<CrossCulturalProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CrossCulturalProject | null>(null);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [teamRecommendations, setTeamRecommendations] = useState<TeamRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'impact'>('overview');

  useEffect(() => {
    loadUserProjects();
  }, [userId]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails(selectedProject.id);
    }
  }, [selectedProject]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      const userProjects = await crossCulturalProjectService.getProjectsByUser(userId);
      setProjects(userProjects);
      if (userProjects.length > 0) {
        setSelectedProject(userProjects[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    try {
      const tasks = await crossCulturalProjectService.getProjectTasks(projectId);
      const recommendations = await crossCulturalProjectService.recommendTeamComposition(projectId);
      setProjectTasks(tasks);
      setTeamRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading project details:', error);
    }
  };

  const handleCreateProject = async () => {
    // This would open a project creation modal
    console.log('Create new cross-cultural project');
  };

  const handleJoinTeam = async (recommendation: TeamRecommendation) => {
    if (!selectedProject) return;
    
    try {
      const newMember: ProjectMember = {
        userId: recommendation.userId,
        role: recommendation.role as any,
        culturalBackground: {
          primaryCulture: recommendation.culturalBackground,
          secondaryCultures: [],
          languages: [],
          culturalExpertise: recommendation.culturalExpertise,
          traditionalKnowledge: []
        },
        skillContributions: recommendation.skills.map(skill => ({
          skill,
          level: 'intermediate',
          experience: '2+ years',
          culturalContext: recommendation.culturalBackground
        })),
        availabilityPattern: {
          hoursPerWeek: 20,
          preferredDays: ['Monday', 'Wednesday', 'Friday'],
          timeZone: 'Africa/Johannesburg',
          culturalConstraints: []
        },
        culturalResponsibilities: [{
          responsibility: recommendation.culturalContribution,
          description: 'Cultural guidance and representation',
          culturalContext: recommendation.culturalBackground,
          accountability: 'Team and community'
        }],
        joinedAt: new Date(),
        commitmentLevel: 'part_time'
      };

      await crossCulturalProjectService.addTeamMember(selectedProject.id, newMember);
      await loadProjectDetails(selectedProject.id);
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  const renderProjectOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Vision</h3>
        <p className="text-gray-700 mb-4">{selectedProject?.vision}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cultural Context</h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject?.culturalContext.primaryCultures.map((culture, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {culture}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Target Communities</h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject?.targetCommunities.map((community, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {community.community}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Milestones</h3>
        <div className="space-y-3">
          {selectedProject?.culturalContext.culturalMilestones.map((milestone, index) => (
            <div key={index} className="border-l-4 border-orange-400 pl-4">
              <h4 className="font-medium text-gray-900">{milestone.title}</h4>
              <p className="text-sm text-gray-600">{milestone.culturalSignificance}</p>
              <p className="text-xs text-gray-500">Target: {milestone.targetDate.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProjectTasks = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add Task
        </button>
      </div>
      
      <div className="grid gap-4">
        {projectTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{task.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {task.culturalRequirements.map((req, index) => (
                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  {req.requirement}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Due: {task.dueDate.toLocaleDateString()}</span>
              <span>{task.estimatedHours}h estimated</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeamManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Team</h3>
        <div className="grid gap-4">
          {selectedProject?.team.members.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{member.role.replace('_', ' ')}</h4>
                <p className="text-sm text-gray-600">
                  {member.culturalBackground.primaryCulture} • {member.commitmentLevel.replace('_', ' ')}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {member.skillContributions.slice(0, 3).map((skill, skillIndex) => (
                    <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {skill.skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Joined {member.joinedAt.toLocaleDateString()}</p>
                <p className="text-xs text-gray-400">{member.availabilityPattern.hoursPerWeek}h/week</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Team Members</h3>
        <div className="grid gap-4">
          {teamRecommendations.map((recommendation, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{recommendation.role.replace('_', ' ')}</h4>
                  <p className="text-sm text-gray-600">{recommendation.culturalBackground}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-green-600">{recommendation.recommendationScore}%</span>
                  <p className="text-xs text-gray-500">match</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{recommendation.culturalContribution}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {recommendation.skills.map((skill, skillIndex) => (
                  <span key={skillIndex} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
              
              <button 
                onClick={() => handleJoinTeam(recommendation)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Invite to Team
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderImpactTracking = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Reach</h3>
          <p className="text-3xl font-bold text-blue-600">{selectedProject?.impact.communityReach.communities}</p>
          <p className="text-sm text-gray-600">Communities Engaged</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cultural Impact</h3>
          <p className="text-3xl font-bold text-green-600">{selectedProject?.impact.culturalImpact.preservationScore}%</p>
          <p className="text-sm text-gray-600">Preservation Score</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Impact</h3>
          <p className="text-3xl font-bold text-purple-600">{selectedProject?.impact.socialImpact.relationshipsFormed}</p>
          <p className="text-sm text-gray-600">Relationships Formed</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Learning Outcomes</h3>
        <div className="space-y-3">
          {selectedProject?.impact.learningOutcomes.map((outcome, index) => (
            <div key={index} className="border-l-4 border-indigo-400 pl-4">
              <h4 className="font-medium text-gray-900">{outcome.outcome}</h4>
              <p className="text-sm text-gray-600">{outcome.culturalContext}</p>
              <p className="text-xs text-gray-500">Type: {outcome.learningType}</p>
            </div>
          ))}
        </div>
      </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Cross-Cultural Projects</h1>
        <button 
          onClick={handleCreateProject}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Project Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Your Projects</h2>
            </div>
            <div className="p-4 space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedProject?.id === project.id 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <h3 className="font-medium truncate">{project.title}</h3>
                  <p className="text-sm text-gray-600 truncate">{project.status}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedProject && (
            <>
              {/* Project Header */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.title}</h2>
                <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedProject.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedProject.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProject.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Cultural Diversity: {selectedProject.team.culturalDiversityScore}%
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { key: 'overview', label: 'Overview' },
                      { key: 'tasks', label: 'Tasks' },
                      { key: 'team', label: 'Team' },
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
                  {activeTab === 'overview' && renderProjectOverview()}
                  {activeTab === 'tasks' && renderProjectTasks()}
                  {activeTab === 'team' && renderTeamManagement()}
                  {activeTab === 'impact' && renderImpactTracking()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossCulturalProjectDashboard;
