// Sample catalogue shared by seed.js (fresh databases) and scripts/addCourseContent.js
// (adds outcomes/curriculum to existing courses with the same titles, without touching anything else).
module.exports = [
  {
    title: 'Generative AI Foundations',
    description: 'Learn prompt design, LLM workflows and practical ways to use generative AI at work.',
    instructor: 'Aarav Mehta', category: 'Generative AI', duration: '4 weeks', level: 'Beginner', price: 1499,
    outcomes: [
      'Explain how large language models generate text and where they fail',
      'Write structured prompts with roles, context, examples and constraints',
      'Evaluate AI output for accuracy, bias and fitness for purpose',
      'Design a repeatable generative AI workflow for a real work task',
    ],
    curriculum: [
      'How large language models work',
      'Prompt design fundamentals',
      'Iterating, evaluating and improving outputs',
      'Responsible and safe use of generative AI',
      'Project: build a prompt library for your role',
    ],
  },
  {
    title: 'AI Agents & Automation',
    description: 'Build reliable AI-assisted workflows with agent patterns, tool use and business automation.',
    instructor: 'Neha Kapoor', category: 'Agentic AI', duration: '6 weeks', level: 'Intermediate', price: 2499,
    outcomes: [
      'Describe common agent patterns: planning, tool use and reflection',
      'Connect a language model to external tools and data sources',
      'Add guardrails, logging and human review to automated workflows',
      'Ship a small multi-step agent that completes a business task',
    ],
    curriculum: [
      'From chatbots to agents',
      'Tool calling and structured outputs',
      'Planning, memory and multi-step reasoning',
      'Reliability: evaluation, guardrails and monitoring',
      'Project: an agent that automates a real workflow',
    ],
  },
  {
    title: 'Data Analytics: From Excel to Insight',
    description: 'Turn business data into confident decisions using Excel, SQL and dashboard thinking.',
    instructor: 'Rohan Verma', category: 'Data Analytics', duration: '3 weeks', level: 'Beginner', price: 999,
    outcomes: [
      'Clean and structure raw data in spreadsheets',
      'Write SQL queries to filter, join and aggregate data',
      'Choose the right chart for the question you are answering',
      'Present findings as a clear, decision-ready summary',
    ],
    curriculum: [
      'Spreadsheet essentials for analysis',
      'Introduction to SQL',
      'Visualising data effectively',
      'Project: an insight report from a real dataset',
    ],
  },
  {
    title: 'Business Analytics Essentials',
    description: 'Frame business questions, read performance signals and communicate actionable insights.',
    instructor: 'Sana Khan', category: 'Business Analytics', duration: '2 weeks', level: 'Beginner', price: 1199,
    outcomes: [
      'Turn vague business problems into answerable questions',
      'Identify the metrics that matter for a team or product',
      'Spot trends, anomalies and misleading comparisons',
      'Communicate recommendations to non-technical stakeholders',
    ],
    curriculum: [
      'Framing the business question',
      'KPIs and performance metrics',
      'Reading and questioning data',
      'Storytelling with insights',
    ],
  },
  {
    title: 'Machine Learning for Career Builders',
    description: 'Understand core ML concepts and create a simple predictive model with guided practice.',
    instructor: 'Karan Singh', category: 'Artificial Intelligence', duration: '5 weeks', level: 'Intermediate', price: 2199,
    outcomes: [
      'Explain supervised and unsupervised learning with examples',
      'Prepare a dataset with features, labels and train/test splits',
      'Train and evaluate a simple predictive model',
      'Interpret model results and communicate their limits',
    ],
    curriculum: [
      'What machine learning is (and is not)',
      'Preparing data for modelling',
      'Training your first model',
      'Evaluating model performance',
      'Project: a guided prediction model',
    ],
  },
  {
    title: 'Automate Work with No-Code AI',
    description: 'Design practical AI automations for research, content and everyday operational tasks.',
    instructor: 'Ishita Rao', category: 'AI Automation', duration: '2 days', level: 'Beginner', price: 699,
    outcomes: [
      'Identify repetitive tasks that are good candidates for automation',
      'Build no-code automations that combine apps and AI steps',
      'Test automations safely before relying on them',
    ],
    curriculum: [
      'Finding automation opportunities',
      'Building your first no-code workflow',
      'Adding AI steps and testing safely',
    ],
  },
];
