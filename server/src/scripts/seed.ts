/**
 * SkillSense AI - Database Seed Script
 * 
 * Populates the database with initial skill taxonomy and roles
 * Run with: npx tsx src/scripts/seed.ts
 */

import mongoose from 'mongoose';
import { config } from '../config/environment';
import { Skill } from '../models/skill.model';
import { Role } from '../models/role.model';
import { Assessment } from '../models/assessment.model';
import { LearningResource } from '../models/learningResource.model';

const skillsData = [
  // Technical Skills
  {
    name: 'JavaScript',
    category: 'technical',
    description: 'Core JavaScript programming language including ES6+ features',
    weight: 1.5,
    tags: ['programming', 'web', 'frontend', 'backend'],
  },
  {
    name: 'TypeScript',
    category: 'technical',
    description: 'Typed superset of JavaScript for large-scale applications',
    weight: 1.3,
    tags: ['programming', 'web', 'typing'],
  },
  {
    name: 'React',
    category: 'technical',
    description: 'Component-based UI library for building interactive web applications',
    weight: 1.4,
    tags: ['frontend', 'ui', 'framework'],
  },
  {
    name: 'Node.js',
    category: 'technical',
    description: 'Server-side JavaScript runtime for building scalable applications',
    weight: 1.4,
    tags: ['backend', 'server', 'runtime'],
  },
  {
    name: 'Python',
    category: 'technical',
    description: 'General-purpose programming language popular in ML and data science',
    weight: 1.5,
    tags: ['programming', 'ml', 'data', 'scripting'],
  },
  {
    name: 'SQL',
    category: 'technical',
    description: 'Structured Query Language for relational database management',
    weight: 1.2,
    tags: ['database', 'query', 'data'],
  },
  {
    name: 'Git',
    category: 'tool',
    description: 'Version control system for tracking code changes',
    weight: 1.0,
    tags: ['version-control', 'collaboration'],
  },
  {
    name: 'REST APIs',
    category: 'technical',
    description: 'Designing and consuming RESTful web services',
    weight: 1.2,
    tags: ['api', 'web', 'integration'],
  },
  {
    name: 'Data Structures',
    category: 'technical',
    description: 'Understanding arrays, linked lists, trees, graphs, and hash tables',
    weight: 1.5,
    tags: ['fundamentals', 'algorithms', 'cs'],
  },
  {
    name: 'Algorithms',
    category: 'technical',
    description: 'Problem-solving techniques including sorting, searching, and optimization',
    weight: 1.5,
    tags: ['fundamentals', 'problem-solving', 'cs'],
  },
  
  // Soft Skills
  {
    name: 'Communication',
    category: 'soft',
    description: 'Clear and effective verbal and written communication',
    weight: 1.3,
    tags: ['interpersonal', 'collaboration'],
  },
  {
    name: 'Problem Solving',
    category: 'soft',
    description: 'Analytical thinking and creative solution development',
    weight: 1.4,
    tags: ['critical-thinking', 'analysis'],
  },
  {
    name: 'Teamwork',
    category: 'soft',
    description: 'Effective collaboration and coordination with team members',
    weight: 1.2,
    tags: ['collaboration', 'interpersonal'],
  },
  {
    name: 'Time Management',
    category: 'soft',
    description: 'Prioritizing tasks and meeting deadlines effectively',
    weight: 1.1,
    tags: ['productivity', 'organization'],
  },
  
  // Domain Skills
  {
    name: 'Machine Learning',
    category: 'domain',
    description: 'Building and deploying ML models for prediction and classification',
    weight: 1.5,
    tags: ['ai', 'data-science', 'modeling'],
  },
  {
    name: 'System Design',
    category: 'domain',
    description: 'Designing scalable and maintainable software architectures',
    weight: 1.6,
    tags: ['architecture', 'scalability', 'design'],
  },
  {
    name: 'Cloud Computing',
    category: 'domain',
    description: 'Working with cloud platforms like AWS, Azure, or GCP',
    weight: 1.3,
    tags: ['infrastructure', 'devops', 'deployment'],
  },
  {
    name: 'Agile Methodology',
    category: 'domain',
    description: 'Working in agile/scrum environments with iterative development',
    weight: 1.0,
    tags: ['process', 'methodology', 'scrum'],
  },
];

const rolesData = [
  {
    title: 'Frontend Developer',
    description: 'Build user interfaces and interactive web applications using modern JavaScript frameworks',
    industry: 'Technology',
    demandLevel: 'high',
    salaryRange: { min: 60000, max: 120000, currency: 'USD' },
    experienceRange: { min: 0, max: 5 },
    requiredSkillNames: [
      { name: 'JavaScript', level: 4, importance: 'must_have' },
      { name: 'React', level: 4, importance: 'must_have' },
      { name: 'TypeScript', level: 3, importance: 'good_to_have' },
      { name: 'Git', level: 3, importance: 'must_have' },
      { name: 'REST APIs', level: 3, importance: 'good_to_have' },
      { name: 'Communication', level: 3, importance: 'good_to_have' },
      { name: 'Problem Solving', level: 4, importance: 'must_have' },
    ],
  },
  {
    title: 'Backend Developer',
    description: 'Design and implement server-side logic, APIs, and database systems',
    industry: 'Technology',
    demandLevel: 'high',
    salaryRange: { min: 70000, max: 140000, currency: 'USD' },
    experienceRange: { min: 1, max: 7 },
    requiredSkillNames: [
      { name: 'Node.js', level: 4, importance: 'must_have' },
      { name: 'JavaScript', level: 4, importance: 'must_have' },
      { name: 'SQL', level: 4, importance: 'must_have' },
      { name: 'REST APIs', level: 4, importance: 'must_have' },
      { name: 'System Design', level: 3, importance: 'good_to_have' },
      { name: 'Git', level: 3, importance: 'must_have' },
      { name: 'Problem Solving', level: 4, importance: 'must_have' },
    ],
  },
  {
    title: 'Full Stack Developer',
    description: 'End-to-end web application development covering both frontend and backend',
    industry: 'Technology',
    demandLevel: 'high',
    salaryRange: { min: 75000, max: 150000, currency: 'USD' },
    experienceRange: { min: 2, max: 8 },
    requiredSkillNames: [
      { name: 'JavaScript', level: 4, importance: 'must_have' },
      { name: 'React', level: 4, importance: 'must_have' },
      { name: 'Node.js', level: 4, importance: 'must_have' },
      { name: 'TypeScript', level: 3, importance: 'good_to_have' },
      { name: 'SQL', level: 3, importance: 'must_have' },
      { name: 'REST APIs', level: 4, importance: 'must_have' },
      { name: 'Git', level: 3, importance: 'must_have' },
      { name: 'System Design', level: 3, importance: 'good_to_have' },
    ],
  },
  {
    title: 'Data Scientist',
    description: 'Extract insights from data using statistical analysis and machine learning',
    industry: 'Technology',
    demandLevel: 'high',
    salaryRange: { min: 90000, max: 170000, currency: 'USD' },
    experienceRange: { min: 1, max: 6 },
    requiredSkillNames: [
      { name: 'Python', level: 4, importance: 'must_have' },
      { name: 'Machine Learning', level: 4, importance: 'must_have' },
      { name: 'SQL', level: 3, importance: 'must_have' },
      { name: 'Data Structures', level: 3, importance: 'good_to_have' },
      { name: 'Algorithms', level: 3, importance: 'good_to_have' },
      { name: 'Communication', level: 4, importance: 'must_have' },
      { name: 'Problem Solving', level: 5, importance: 'must_have' },
    ],
  },
  {
    title: 'Software Engineer',
    description: 'Design, develop, and maintain software systems with focus on quality and scalability',
    industry: 'Technology',
    demandLevel: 'high',
    salaryRange: { min: 80000, max: 160000, currency: 'USD' },
    experienceRange: { min: 2, max: 10 },
    requiredSkillNames: [
      { name: 'Data Structures', level: 4, importance: 'must_have' },
      { name: 'Algorithms', level: 4, importance: 'must_have' },
      { name: 'System Design', level: 4, importance: 'must_have' },
      { name: 'Git', level: 3, importance: 'must_have' },
      { name: 'Problem Solving', level: 5, importance: 'must_have' },
      { name: 'Communication', level: 3, importance: 'good_to_have' },
      { name: 'Teamwork', level: 3, importance: 'good_to_have' },
      { name: 'Agile Methodology', level: 3, importance: 'good_to_have' },
    ],
  },
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.mongodbUri);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Skill.deleteMany({}),
      Role.deleteMany({}),
      Assessment.deleteMany({}),
      LearningResource.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    // Insert skills
    console.log('Seeding skills...');
    const skills = await Skill.insertMany(skillsData);
    console.log(`✓ Inserted ${skills.length} skills`);

    // Create skill name to ID mapping
    const skillMap = new Map(skills.map(s => [s.name, s._id]));

    // Insert roles with proper skill IDs
    console.log('Seeding roles...');
    const rolesWithSkillIds = rolesData.map(role => ({
      ...role,
      requiredSkills: role.requiredSkillNames.map(req => ({
        skillId: skillMap.get(req.name),
        skillName: req.name,
        requiredLevel: req.level,
        importance: req.importance,
      })),
    }));

    // Remove the temporary requiredSkillNames property
    const cleanRoles = rolesWithSkillIds.map(({ requiredSkillNames, ...role }) => role);
    const roles = await Role.insertMany(cleanRoles);
    console.log(`✓ Inserted ${roles.length} roles`);

    // Create sample assessment
    console.log('Seeding sample assessment...');
    const jsSkill = skills.find(s => s.name === 'JavaScript');
    const reactSkill = skills.find(s => s.name === 'React');
    const problemSolvingSkill = skills.find(s => s.name === 'Problem Solving');

    const sampleAssessment = await Assessment.create({
      title: 'Frontend Developer Skills Assessment',
      description: 'Assess your readiness for frontend development roles',
      targetSkills: [jsSkill?._id, reactSkill?._id, problemSolvingSkill?._id].filter(Boolean),
      difficulty: 'intermediate',
      estimatedDuration: 20,
      questions: [
        {
          id: 'q1',
          skillId: jsSkill?._id,
          type: 'multiple_choice',
          text: 'What is the output of: console.log(typeof null)?',
          options: [
            { id: 'a', text: '"null"', isCorrect: false },
            { id: 'b', text: '"object"', isCorrect: true },
            { id: 'c', text: '"undefined"', isCorrect: false },
            { id: 'd', text: 'TypeError', isCorrect: false },
          ],
          correctAnswer: 'b',
          explanation: 'typeof null returns "object" due to a legacy bug in JavaScript.',
          difficultyWeight: 1.2,
        },
        {
          id: 'q2',
          skillId: jsSkill?._id,
          type: 'multiple_choice',
          text: 'Which method creates a new array with filtered elements?',
          options: [
            { id: 'a', text: 'map()', isCorrect: false },
            { id: 'b', text: 'reduce()', isCorrect: false },
            { id: 'c', text: 'filter()', isCorrect: true },
            { id: 'd', text: 'forEach()', isCorrect: false },
          ],
          correctAnswer: 'c',
          explanation: 'filter() creates a new array with elements that pass a test.',
          difficultyWeight: 1.0,
        },
        {
          id: 'q3',
          skillId: reactSkill?._id,
          type: 'multiple_choice',
          text: 'What hook is used to manage side effects in React?',
          options: [
            { id: 'a', text: 'useState', isCorrect: false },
            { id: 'b', text: 'useEffect', isCorrect: true },
            { id: 'c', text: 'useContext', isCorrect: false },
            { id: 'd', text: 'useReducer', isCorrect: false },
          ],
          correctAnswer: 'b',
          explanation: 'useEffect is the hook for handling side effects like data fetching.',
          difficultyWeight: 1.0,
        },
        {
          id: 'q4',
          skillId: reactSkill?._id,
          type: 'self_rating',
          text: 'How would you rate your ability to build responsive React components?',
          options: [
            { id: '1', text: 'Novice - Just learning React basics', proficiencyIndicator: 1 },
            { id: '2', text: 'Beginner - Can build simple components', proficiencyIndicator: 2 },
            { id: '3', text: 'Intermediate - Comfortable with hooks and state', proficiencyIndicator: 3 },
            { id: '4', text: 'Advanced - Can optimize and architect', proficiencyIndicator: 4 },
            { id: '5', text: 'Expert - Deep knowledge of internals', proficiencyIndicator: 5 },
          ],
          difficultyWeight: 1.0,
        },
        {
          id: 'q5',
          skillId: problemSolvingSkill?._id,
          type: 'scenario_based',
          text: 'A user reports that a page loads slowly. What is your first debugging step?',
          options: [
            { id: 'a', text: 'Rewrite the entire component', isCorrect: false },
            { id: 'b', text: 'Check browser DevTools Network/Performance tabs', isCorrect: true },
            { id: 'c', text: 'Add more comments to the code', isCorrect: false },
            { id: 'd', text: 'Ask the user to refresh the page', isCorrect: false },
          ],
          correctAnswer: 'b',
          explanation: 'Profiling with DevTools helps identify actual bottlenecks.',
          difficultyWeight: 1.3,
        },
      ],
    });

    console.log('✓ Created sample assessment');

    // Create Backend Assessment
    const nodeSkill = skills.find(s => s.name === 'Node.js');
    const sqlSkill = skills.find(s => s.name === 'SQL');
    const apiSkill = skills.find(s => s.name === 'REST APIs');

    await Assessment.create({
      title: 'Backend Developer Skills Assessment',
      description: 'Assess your backend development capabilities',
      targetSkills: [nodeSkill?._id, sqlSkill?._id, apiSkill?._id].filter(Boolean),
      difficulty: 'intermediate',
      estimatedDuration: 25,
      questions: [
        {
          id: 'bq1',
          skillId: nodeSkill?._id,
          type: 'multiple_choice',
          text: 'What is the event loop in Node.js?',
          options: [
            { id: 'a', text: 'A for loop that never ends', isCorrect: false },
            { id: 'b', text: 'A mechanism that handles async operations', isCorrect: true },
            { id: 'c', text: 'A debugging tool', isCorrect: false },
            { id: 'd', text: 'A package manager', isCorrect: false },
          ],
          correctAnswer: 'b',
          explanation: 'The event loop handles async operations by offloading them and processing callbacks.',
          difficultyWeight: 1.2,
        },
        {
          id: 'bq2',
          skillId: nodeSkill?._id,
          type: 'multiple_choice',
          text: 'Which module is used to create an HTTP server in Node.js?',
          options: [
            { id: 'a', text: 'fs', isCorrect: false },
            { id: 'b', text: 'path', isCorrect: false },
            { id: 'c', text: 'http', isCorrect: true },
            { id: 'd', text: 'os', isCorrect: false },
          ],
          correctAnswer: 'c',
          explanation: 'The http module provides HTTP server and client functionality.',
          difficultyWeight: 1.0,
        },
        {
          id: 'bq3',
          skillId: sqlSkill?._id,
          type: 'multiple_choice',
          text: 'Which SQL clause is used to filter grouped results?',
          options: [
            { id: 'a', text: 'WHERE', isCorrect: false },
            { id: 'b', text: 'HAVING', isCorrect: true },
            { id: 'c', text: 'GROUP BY', isCorrect: false },
            { id: 'd', text: 'ORDER BY', isCorrect: false },
          ],
          correctAnswer: 'b',
          explanation: 'HAVING filters grouped results, while WHERE filters individual rows.',
          difficultyWeight: 1.2,
        },
        {
          id: 'bq4',
          skillId: apiSkill?._id,
          type: 'multiple_choice',
          text: 'What HTTP status code indicates a successful resource creation?',
          options: [
            { id: 'a', text: '200', isCorrect: false },
            { id: 'b', text: '201', isCorrect: true },
            { id: 'c', text: '204', isCorrect: false },
            { id: 'd', text: '301', isCorrect: false },
          ],
          correctAnswer: 'b',
          explanation: '201 Created indicates a successful resource creation.',
          difficultyWeight: 1.0,
        },
        {
          id: 'bq5',
          skillId: apiSkill?._id,
          type: 'self_rating',
          text: 'How confident are you in designing RESTful API endpoints?',
          options: [
            { id: '1', text: 'Novice - Still learning HTTP basics', proficiencyIndicator: 1 },
            { id: '2', text: 'Beginner - Can create simple endpoints', proficiencyIndicator: 2 },
            { id: '3', text: 'Intermediate - Understand REST principles', proficiencyIndicator: 3 },
            { id: '4', text: 'Advanced - Can design complex APIs', proficiencyIndicator: 4 },
            { id: '5', text: 'Expert - Architect enterprise APIs', proficiencyIndicator: 5 },
          ],
          difficultyWeight: 1.0,
        },
      ],
    });
    console.log('✓ Created backend assessment');

    // Create Python/Data Assessment
    const pythonSkill = skills.find(s => s.name === 'Python');
    const dsSkill = skills.find(s => s.name === 'Data Structures');
    const algoSkill = skills.find(s => s.name === 'Algorithms');

    await Assessment.create({
      title: 'Python & Algorithms Assessment',
      description: 'Test your Python programming and algorithmic thinking',
      targetSkills: [pythonSkill?._id, dsSkill?._id, algoSkill?._id].filter(Boolean),
      difficulty: 'intermediate',
      estimatedDuration: 30,
      questions: [
        {
          id: 'pq1',
          skillId: pythonSkill?._id,
          type: 'multiple_choice',
          text: 'What is the difference between a list and a tuple in Python?',
          options: [
            { id: 'a', text: 'Lists are immutable, tuples are mutable', isCorrect: false },
            { id: 'b', text: 'Tuples are faster than lists', isCorrect: false },
            { id: 'c', text: 'Lists are mutable, tuples are immutable', isCorrect: true },
            { id: 'd', text: 'No difference', isCorrect: false },
          ],
          correctAnswer: 'c',
          explanation: 'Lists can be modified after creation, tuples cannot.',
          difficultyWeight: 1.0,
        },
        {
          id: 'pq2',
          skillId: pythonSkill?._id,
          type: 'multiple_choice',
          text: 'What does the __init__ method do in a Python class?',
          options: [
            { id: 'a', text: 'Destroys the object', isCorrect: false },
            { id: 'b', text: 'Initializes object attributes', isCorrect: true },
            { id: 'c', text: 'Creates a static method', isCorrect: false },
            { id: 'd', text: 'Defines class inheritance', isCorrect: false },
          ],
          correctAnswer: 'b',
          explanation: '__init__ is the constructor method that initializes new objects.',
          difficultyWeight: 1.1,
        },
        {
          id: 'pq3',
          skillId: dsSkill?._id,
          type: 'multiple_choice',
          text: 'What is the time complexity of accessing an element in a hash table?',
          options: [
            { id: 'a', text: 'O(n)', isCorrect: false },
            { id: 'b', text: 'O(log n)', isCorrect: false },
            { id: 'c', text: 'O(1) average case', isCorrect: true },
            { id: 'd', text: 'O(n log n)', isCorrect: false },
          ],
          correctAnswer: 'c',
          explanation: 'Hash tables provide O(1) average case access time.',
          difficultyWeight: 1.3,
        },
        {
          id: 'pq4',
          skillId: algoSkill?._id,
          type: 'multiple_choice',
          text: 'Which sorting algorithm has the best worst-case time complexity?',
          options: [
            { id: 'a', text: 'Quick Sort', isCorrect: false },
            { id: 'b', text: 'Bubble Sort', isCorrect: false },
            { id: 'c', text: 'Merge Sort', isCorrect: true },
            { id: 'd', text: 'Selection Sort', isCorrect: false },
          ],
          correctAnswer: 'c',
          explanation: 'Merge Sort has O(n log n) worst-case complexity.',
          difficultyWeight: 1.4,
        },
        {
          id: 'pq5',
          skillId: dsSkill?._id,
          type: 'self_rating',
          text: 'How comfortable are you implementing common data structures?',
          options: [
            { id: '1', text: 'Novice - Only know arrays', proficiencyIndicator: 1 },
            { id: '2', text: 'Beginner - Familiar with lists/stacks', proficiencyIndicator: 2 },
            { id: '3', text: 'Intermediate - Can implement trees', proficiencyIndicator: 3 },
            { id: '4', text: 'Advanced - Comfortable with graphs', proficiencyIndicator: 4 },
            { id: '5', text: 'Expert - Design custom structures', proficiencyIndicator: 5 },
          ],
          difficultyWeight: 1.0,
        },
      ],
    });
    console.log('✓ Created Python/Algorithms assessment');

    // Seed Learning Resources
    console.log('Seeding learning resources...');
    
    const learningResourcesData = [
      // JavaScript Resources
      {
        title: 'JavaScript: The Complete Guide',
        description: 'Comprehensive JavaScript course covering basics to advanced concepts',
        type: 'course',
        url: 'https://example.com/js-complete',
        provider: 'Udemy',
        skillId: jsSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 52,
        rating: 4.7,
        reviewCount: 45000,
        tags: ['javascript', 'es6', 'web-development'],
        isPremium: true,
      },
      {
        title: 'Modern JavaScript Tutorial',
        description: 'Free, in-depth JavaScript tutorial for modern development',
        type: 'tutorial',
        url: 'https://javascript.info',
        provider: 'javascript.info',
        skillId: jsSkill?._id,
        difficulty: 'intermediate',
        estimatedDuration: 40,
        rating: 4.9,
        reviewCount: 12000,
        tags: ['javascript', 'modern', 'free'],
        isPremium: false,
      },
      {
        title: 'JavaScript30',
        description: 'Build 30 things in 30 days with vanilla JavaScript',
        type: 'course',
        url: 'https://javascript30.com',
        provider: 'Wes Bos',
        skillId: jsSkill?._id,
        difficulty: 'intermediate',
        estimatedDuration: 30,
        rating: 4.8,
        reviewCount: 8500,
        tags: ['javascript', 'projects', 'free'],
        isPremium: false,
      },
      
      // React Resources
      {
        title: 'React - The Complete Guide',
        description: 'Master React, Hooks, Redux, React Router and more',
        type: 'course',
        url: 'https://example.com/react-complete',
        provider: 'Udemy',
        skillId: reactSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 48,
        rating: 4.8,
        reviewCount: 65000,
        tags: ['react', 'hooks', 'redux'],
        isPremium: true,
      },
      {
        title: 'React Official Documentation',
        description: 'Official React docs with interactive examples',
        type: 'documentation',
        url: 'https://react.dev',
        provider: 'Meta',
        skillId: reactSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 20,
        rating: 4.9,
        reviewCount: 5000,
        tags: ['react', 'official', 'free'],
        isPremium: false,
      },
      {
        title: 'Epic React',
        description: 'Advanced React patterns and best practices',
        type: 'course',
        url: 'https://epicreact.dev',
        provider: 'Kent C. Dodds',
        skillId: reactSkill?._id,
        difficulty: 'advanced',
        estimatedDuration: 35,
        rating: 4.9,
        reviewCount: 3200,
        tags: ['react', 'advanced', 'patterns'],
        isPremium: true,
      },
      
      // Node.js Resources
      {
        title: 'Node.js - The Complete Guide',
        description: 'Learn Node.js, Express, MongoDB and more',
        type: 'course',
        url: 'https://example.com/node-complete',
        provider: 'Udemy',
        skillId: nodeSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 40,
        rating: 4.7,
        reviewCount: 35000,
        tags: ['nodejs', 'express', 'mongodb'],
        isPremium: true,
      },
      {
        title: 'Node.js Best Practices',
        description: 'Production-ready Node.js patterns and practices',
        type: 'documentation',
        url: 'https://github.com/goldbergyoni/nodebestpractices',
        provider: 'Community',
        skillId: nodeSkill?._id,
        difficulty: 'advanced',
        estimatedDuration: 15,
        rating: 4.9,
        reviewCount: 2500,
        tags: ['nodejs', 'best-practices', 'free'],
        isPremium: false,
      },
      
      // Python Resources
      {
        title: 'Python for Everybody',
        description: 'Learn Python from scratch with practical examples',
        type: 'course',
        url: 'https://www.py4e.com',
        provider: 'University of Michigan',
        skillId: pythonSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 35,
        rating: 4.8,
        reviewCount: 120000,
        tags: ['python', 'beginner', 'free'],
        isPremium: false,
      },
      {
        title: 'Automate the Boring Stuff with Python',
        description: 'Practical Python programming for total beginners',
        type: 'book',
        url: 'https://automatetheboringstuff.com',
        provider: 'No Starch Press',
        skillId: pythonSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 25,
        rating: 4.7,
        reviewCount: 8000,
        tags: ['python', 'automation', 'free'],
        isPremium: false,
      },
      
      // SQL Resources
      {
        title: 'SQL for Data Science',
        description: 'Master SQL for data analysis and manipulation',
        type: 'course',
        url: 'https://example.com/sql-data-science',
        provider: 'Coursera',
        skillId: sqlSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 20,
        rating: 4.6,
        reviewCount: 45000,
        tags: ['sql', 'data-science', 'database'],
        isPremium: true,
      },
      {
        title: 'SQLZoo Interactive Tutorial',
        description: 'Practice SQL with interactive exercises',
        type: 'tutorial',
        url: 'https://sqlzoo.net',
        provider: 'SQLZoo',
        skillId: sqlSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 10,
        rating: 4.5,
        reviewCount: 3000,
        tags: ['sql', 'interactive', 'free'],
        isPremium: false,
      },
      
      // Data Structures & Algorithms Resources
      {
        title: 'Algorithms Specialization',
        description: 'Stanford algorithms course covering divide-conquer, graphs, and more',
        type: 'course',
        url: 'https://example.com/stanford-algos',
        provider: 'Coursera',
        skillId: algoSkill?._id,
        difficulty: 'intermediate',
        estimatedDuration: 60,
        rating: 4.9,
        reviewCount: 25000,
        tags: ['algorithms', 'stanford', 'theory'],
        isPremium: true,
      },
      {
        title: 'Visualizing Data Structures',
        description: 'Interactive visualizations of common data structures',
        type: 'tutorial',
        url: 'https://visualgo.net',
        provider: 'VisuAlgo',
        skillId: dsSkill?._id,
        difficulty: 'beginner',
        estimatedDuration: 8,
        rating: 4.8,
        reviewCount: 1500,
        tags: ['data-structures', 'visual', 'free'],
        isPremium: false,
      },
      {
        title: 'LeetCode Premium',
        description: 'Practice coding problems with detailed solutions',
        type: 'practice',
        url: 'https://leetcode.com',
        provider: 'LeetCode',
        skillId: algoSkill?._id,
        difficulty: 'intermediate',
        estimatedDuration: 100,
        rating: 4.7,
        reviewCount: 50000,
        tags: ['algorithms', 'practice', 'interviews'],
        isPremium: true,
      },
      
      // Git Resources
      {
        title: 'Git & GitHub Crash Course',
        description: 'Learn version control from basics to advanced workflows',
        type: 'video',
        url: 'https://example.com/git-crash-course',
        provider: 'YouTube',
        skillId: skills.find(s => s.name === 'Git')?._id,
        difficulty: 'beginner',
        estimatedDuration: 2,
        rating: 4.6,
        reviewCount: 150000,
        tags: ['git', 'github', 'free'],
        isPremium: false,
      },
      
      // REST API Resources
      {
        title: 'RESTful Web Services',
        description: 'Design and implement RESTful APIs',
        type: 'course',
        url: 'https://example.com/rest-api-course',
        provider: 'Pluralsight',
        skillId: apiSkill?._id,
        difficulty: 'intermediate',
        estimatedDuration: 12,
        rating: 4.5,
        reviewCount: 8000,
        tags: ['rest', 'api', 'design'],
        isPremium: true,
      },
    ].filter(r => r.skillId); // Filter out resources with undefined skillIds
    
    await LearningResource.insertMany(learningResourcesData);
    console.log(`✓ Created ${learningResourcesData.length} learning resources`);

    console.log('\n════════════════════════════════════════');
    console.log('  Database seeding completed successfully!');
    console.log('════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
