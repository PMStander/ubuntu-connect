import { 
  CrossCulturalProject, 
  ProjectTeam, 
  ProjectTask, 
  CulturalCollaboration,
  ImpactMetrics,
  ProjectMember,
  CulturalContext,
  TeamRecommendation,
  ProjectObjective,
  CulturalMilestone
} from '../types/crossCulturalProject';

export interface ProjectCreationData {
  title: string;
  description: string;
  vision: string;
  objectives: ProjectObjective[];
  culturalContext: CulturalContext;
  requiredSkills: string[];
  targetCommunities: string[];
  timeline: {
    startDate: Date;
    endDate: Date;
    culturalMilestones: CulturalMilestone[];
  };
}

export interface TeamFormationRequest {
  projectId: string;
  requiredSkills: string[];
  culturalRepresentation: string[];
  commitmentLevel: 'full_time' | 'part_time' | 'consulting' | 'advisory';
}

export interface TaskCreationData {
  projectId: string;
  title: string;
  description: string;
  culturalContext: CulturalContext;
  requiredSkills: string[];
  culturalRequirements: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
  dueDate: Date;
}

class CrossCulturalProjectService {
  private projects: Map<string, CrossCulturalProject> = new Map();
  private tasks: Map<string, ProjectTask[]> = new Map();
  private teams: Map<string, ProjectTeam> = new Map();

  // Project Management
  async createProject(data: ProjectCreationData, createdBy: string): Promise<CrossCulturalProject> {
    const project: CrossCulturalProject = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      vision: data.vision,
      objectives: data.objectives,
      culturalContext: {
        primaryCultures: data.culturalContext.primaryCultures || [],
        culturalObjectives: data.culturalContext.culturalObjectives || [],
        culturalSensitivities: data.culturalContext.culturalSensitivities || [],
        traditionalKnowledgeIntegration: data.culturalContext.traditionalKnowledgeIntegration || false,
        languageRequirements: data.culturalContext.languageRequirements || [],
        culturalMilestones: data.timeline.culturalMilestones,
        communityEndorsements: []
      },
      requiredSkills: data.requiredSkills.map(skill => ({ skill, level: 'intermediate', priority: 'medium' })),
      targetCommunities: data.targetCommunities.map(community => ({ 
        community, 
        role: 'participant', 
        representation: 'equal' 
      })),
      timeline: {
        startDate: data.timeline.startDate,
        endDate: data.timeline.endDate,
        phases: [],
        culturalEvents: data.timeline.culturalMilestones
      },
      status: 'planning',
      impact: this.initializeImpactMetrics(),
      team: this.initializeTeam(),
      culturalGuidelines: [],
      collaborationProtocols: [],
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set(project.id, project);
    this.tasks.set(project.id, []);
    this.teams.set(project.id, project.team);

    return project;
  }

  async getProject(projectId: string): Promise<CrossCulturalProject | null> {
    return this.projects.get(projectId) || null;
  }

  async updateProject(projectId: string, updates: Partial<CrossCulturalProject>): Promise<CrossCulturalProject> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date()
    };

    this.projects.set(projectId, updatedProject);
    return updatedProject;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const deleted = this.projects.delete(projectId);
    this.tasks.delete(projectId);
    this.teams.delete(projectId);
    return deleted;
  }

  async getProjectsByUser(userId: string): Promise<CrossCulturalProject[]> {
    return Array.from(this.projects.values()).filter(project => 
      project.createdBy === userId || 
      project.team.members.some(member => member.userId === userId)
    );
  }

  async getProjectsByCulturalContext(culturalContext: string): Promise<CrossCulturalProject[]> {
    return Array.from(this.projects.values()).filter(project =>
      project.culturalContext.primaryCultures.includes(culturalContext)
    );
  }

  // Team Formation & Management
  async recommendTeamComposition(projectId: string): Promise<TeamRecommendation[]> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Simulate intelligent team composition recommendations
    const recommendations: TeamRecommendation[] = [
      {
        userId: 'user1',
        culturalBackground: 'Zulu',
        skills: ['project_management', 'community_engagement'],
        culturalExpertise: ['traditional_governance', 'ubuntu_philosophy'],
        recommendationScore: 95,
        role: 'project_lead',
        culturalContribution: 'Leadership in Ubuntu principles and traditional decision-making'
      },
      {
        userId: 'user2',
        culturalBackground: 'Afrikaans',
        skills: ['technical_development', 'innovation'],
        culturalExpertise: ['agricultural_innovation', 'sustainable_practices'],
        recommendationScore: 88,
        role: 'skill_expert',
        culturalContribution: 'Technical innovation with cultural sustainability focus'
      },
      {
        userId: 'user3',
        culturalBackground: 'Xhosa',
        skills: ['community_liaison', 'cultural_preservation'],
        culturalExpertise: ['oral_traditions', 'cultural_ceremonies'],
        recommendationScore: 92,
        role: 'cultural_representative',
        culturalContribution: 'Cultural preservation and traditional knowledge integration'
      }
    ];

    return recommendations;
  }

  async addTeamMember(projectId: string, member: ProjectMember): Promise<ProjectTeam> {
    const team = this.teams.get(projectId);
    if (!team) {
      throw new Error('Project team not found');
    }

    team.members.push({
      ...member,
      joinedAt: new Date()
    });

    // Update cultural diversity score
    team.culturalDiversityScore = this.calculateCulturalDiversityScore(team.members);

    this.teams.set(projectId, team);
    return team;
  }

  async removeTeamMember(projectId: string, userId: string): Promise<ProjectTeam> {
    const team = this.teams.get(projectId);
    if (!team) {
      throw new Error('Project team not found');
    }

    team.members = team.members.filter(member => member.userId !== userId);
    team.culturalDiversityScore = this.calculateCulturalDiversityScore(team.members);

    this.teams.set(projectId, team);
    return team;
  }

  // Task Management
  async createTask(data: TaskCreationData): Promise<ProjectTask> {
    const task: ProjectTask = {
      id: this.generateId(),
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      culturalContext: {
        culturalRequirements: data.culturalRequirements,
        culturalSensitivities: [],
        culturalLearningObjectives: []
      },
      assignedTo: [],
      requiredSkills: data.requiredSkills,
      culturalRequirements: data.culturalRequirements.map(req => ({ 
        requirement: req, 
        priority: 'medium' 
      })),
      priority: data.priority,
      status: 'backlog',
      estimatedHours: data.estimatedHours,
      culturalLearning: [],
      dependencies: [],
      dueDate: data.dueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const projectTasks = this.tasks.get(data.projectId) || [];
    projectTasks.push(task);
    this.tasks.set(data.projectId, projectTasks);

    return task;
  }

  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    return this.tasks.get(projectId) || [];
  }

  async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
    for (const [projectId, tasks] of this.tasks.entries()) {
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updates,
          updatedAt: new Date()
        };
        this.tasks.set(projectId, tasks);
        return tasks[taskIndex];
      }
    }
    throw new Error('Task not found');
  }

  // Impact Tracking
  async updateImpactMetrics(projectId: string, metrics: Partial<ImpactMetrics>): Promise<ImpactMetrics> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.impact = {
      ...project.impact,
      ...metrics
    };

    this.projects.set(projectId, project);
    return project.impact;
  }

  async getCulturalImpactAssessment(projectId: string): Promise<any> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    return {
      culturalPreservation: project.impact.culturalPreservation,
      crossCulturalLearning: project.impact.learningOutcomes,
      communityEngagement: project.impact.communityReach,
      culturalInnovation: project.impact.culturalImpact
    };
  }

  // Helper Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeImpactMetrics(): ImpactMetrics {
    return {
      communityReach: { communities: 0, individuals: 0, regions: [] },
      culturalImpact: { preservationScore: 0, innovationScore: 0, exchangeScore: 0 },
      socialImpact: { relationshipsFormed: 0, understandingImproved: 0, conflictsResolved: 0 },
      economicImpact: { opportunitiesCreated: 0, valueGenerated: 0, sustainabilityScore: 0 },
      learningOutcomes: [],
      sustainabilityMetrics: [],
      culturalPreservation: []
    };
  }

  private initializeTeam(): ProjectTeam {
    return {
      members: [],
      culturalRepresentatives: [],
      skillsMatrix: { skills: [], coverage: 0 },
      culturalDiversityScore: 0,
      communicationPreferences: [],
      decisionMakingProcess: { type: 'consensus', culturalConsiderations: [] },
      conflictResolutionProtocol: { approach: 'mediation', culturalAdaptations: [] }
    };
  }

  private calculateCulturalDiversityScore(members: ProjectMember[]): number {
    const cultures = new Set(members.map(member => member.culturalBackground.primaryCulture));
    const maxCultures = 11; // South Africa has 11 official languages/cultures
    return Math.min((cultures.size / maxCultures) * 100, 100);
  }
}

export const crossCulturalProjectService = new CrossCulturalProjectService();
