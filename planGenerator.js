/**
 * I HAVE 2 HOURS — Intelligent Actionable Plan Generator
 * Generates realistic, time-boxed study/work plans tailored to subject, duration, specific goal, and skill level.
 */

const PlanGenerator = (function() {
  'use strict';

  // Topic Metadata & Default Suggestions
  const TOPIC_CONFIG = {
    python: {
      name: 'Python',
      icon: '💻',
      suggestions: [
        'Master Python functions & *args/**kwargs',
        'Revise OOP: Classes, inheritance, dunder methods',
        'Learn List comprehensions, generators & iterators',
        'Practice error handling and custom exceptions',
        'Build a simple CLI tool with argparse'
      ],
      defaultGoal: 'Practice Python core concepts & functions'
    },
    ml: {
      name: 'Machine Learning',
      icon: '🧠',
      suggestions: [
        'Revise Linear Regression & Cost Functions',
        'Master Logistic Regression & Decision Boundaries',
        'Understand Decision Trees & Random Forests',
        'Prepare for tomorrow\'s ML exam',
        'Learn Gradient Boosting & XGBoost intuition'
      ],
      defaultGoal: 'Revise Linear Regression'
    },
    datascience: {
      name: 'Data Science',
      icon: '📊',
      suggestions: [
        'Perform end-to-end EDA with Pandas & Seaborn',
        'Data cleaning: Handling missing values & outliers',
        'Master GroupBy, Pivots, and Merge operations',
        'Revise Hypothesis Testing (p-values, t-test)',
        'Feature engineering: scaling, encoding, selection'
      ],
      defaultGoal: 'Master Pandas data cleaning & exploratory analysis'
    },
    dsa: {
      name: 'DSA',
      icon: '🧩',
      suggestions: [
        'Solve 4 Two-Pointer & Sliding Window problems',
        'Master Binary Tree traversals (Inorder/Pre/Post/Level)',
        'Practice Dynamic Programming: 0/1 Knapsack pattern',
        'Revise Graph BFS & DFS with cycle detection',
        'Solve 5 LeetCode Mediums on Arrays & HashMaps'
      ],
      defaultGoal: 'Solve 5 LeetCode Medium problems with pattern recognition'
    },
    exam: {
      name: 'Exam Prep',
      icon: '📚',
      suggestions: [
        'High-yield active recall of hardest chapters',
        'Solve previous year exam question paper under timed conditions',
        'Synthesize 1-page condensed formula & concept cheat-sheet',
        'Identify & patch knowledge gaps from practice quizzes',
        'Memorize core definitions & theorem proofs'
      ],
      defaultGoal: 'High-yield active recall and past paper problem solving'
    },
    project: {
      name: 'Project',
      icon: '🚀',
      suggestions: [
        'Build and test REST API backend routes',
        'Design responsive frontend dashboard layout',
        'Implement user authentication with JWT / sessions',
        'Fix critical bugs and polish mobile UI interactions',
        'Write README, deploy to production, and test live'
      ],
      defaultGoal: 'Build the core feature & backend integration of project'
    },
    english: {
      name: 'English',
      icon: '🇬🇧',
      suggestions: [
        'Practice IELTS / TOEFL Task 2 essay structure & writing',
        'Speaking fluency drill: 20-minute shadowing & recording',
        'Learn 25 high-frequency academic/business idioms',
        'Professional email writing & negotiation vocabulary',
        'Grammar mastery: conditionals and active/passive voice'
      ],
      defaultGoal: 'Speaking fluency shadowing & structured essay writing'
    },
    custom: {
      name: 'Custom Goal',
      icon: '🎯',
      suggestions: [
        'System Design: Design a URL shortener or feed',
        'SQL: Master Window Functions and CTEs',
        'Docker: Containerize a multi-service app',
        'Deep Focus reading: Finish 2 dense research papers'
      ],
      defaultGoal: 'Intense focused study and practical implementation'
    }
  };

  /**
   * Blueprint templates by topic and difficulty
   */
  const CURRICULUM = {
    // MACHINE LEARNING
    ml: {
      concept: (goal, level) => {
        const isLinearReg = !goal || goal.toLowerCase().includes('linear regression');
        const displaySubject = isLinearReg ? 'linear regression' : (goal || 'the algorithm');
        return {
          title: 'Concept Refresh',
          icon: '📖',
          type: 'focus',
          tasks: isLinearReg ? [
            'What linear regression does (intuition, line of best fit)',
            'Features (X) and target (y) distinction',
            'Prediction equation: y = wx + b (weights and bias)',
            'Loss/cost function: Mean Squared Error (MSE) formulation'
          ] : [
            `What ${displaySubject} does (core intuition and use-cases)`,
            'Features (input dimensions) and target output representation',
            'Model prediction equation / decision boundary',
            'Loss/cost function formulation and optimization objective'
          ],
          outcome: `You should be able to explain ${displaySubject} without notes.`
        };
      },
      build: (goal, level) => {
        const isLinearReg = !goal || goal.toLowerCase().includes('linear regression');
        const displaySubject = isLinearReg ? 'linear regression' : (goal || 'the model');
        return {
          title: 'Build It',
          icon: '💻',
          type: 'focus',
          tasks: isLinearReg ? [
            'Load dataset (e.g. using pandas / sklearn datasets)',
            'Select features and train/test split',
            'Train model using LinearRegression()',
            'Generate predictions and evaluate MSE & R² score'
          ] : [
            'Load dataset and verify datatypes & distributions',
            'Select features and perform train/test split',
            `Train ${displaySubject} in Python (e.g. Scikit-Learn)`,
            'Generate predictions and compute baseline evaluation metrics'
          ],
          outcome: `Working ${displaySubject} script fitting data and printing predictions.`
        };
      },
      challenge: (goal, level) => ({
        title: 'Stress-Test & Edge Cases',
        icon: '⚡',
        type: 'focus',
        tasks: [
          'Analyze failure modes: inspect residual errors or prediction outliers',
          'Test assumptions: check for multicollinearity and feature scaling impact',
          level === 'Beginner'
            ? 'Introduce regularized variations (Ridge / Lasso) to observe weight shrinkage'
            : 'Apply K-Fold cross-validation to assess generalization variance',
          'Visualize predictions vs ground truth with a clean regression plot'
        ],
        outcome: 'Deep understanding of model limitations, assumptions, and regularization.'
      }),
      review: (goal) => ({
        title: 'Review & Recap',
        icon: '🎯',
        type: 'recap',
        tasks: [
          `Answer 3 mock interview questions out loud regarding ${goal || 'your topic'}`,
          'Write a 5-bullet summary cheat sheet with formulas and diagnostic tips',
          'Verify target outcome: summarize key concepts without looking at notes'
        ],
        outcome: 'Permanent knowledge retention and instant recall ready for exams or interviews.'
      })
    },

    // PYTHON
    python: {
      concept: (goal, level) => ({
        title: 'Syntax & Mental Model Refinement',
        icon: '📖',
        type: 'focus',
        tasks: [
          `Identify the exact language mechanics required for: ${goal}`,
          'Review memory model: understand mutability vs immutability, pass-by-reference semantics',
          'Inspect idiomatic "Pythonic" patterns (PEP 8, comprehensions, context managers)',
          level === 'Advanced'
            ? 'Analyze bytecode / inspect execution time using dis or timeit'
            : 'Write down minimal illustrative code snippets in interactive REPL / IPython'
        ],
        outcome: 'Crystal clear comprehension of the syntax rules and internal execution flow.'
      }),
      build: (goal, level) => ({
        title: 'Active Coding Sprint',
        icon: '💻',
        type: 'focus',
        tasks: [
          `Write modular code tackling: ${goal}`,
          'Decompose logic into pure functions with explicit type hints and docstrings',
          'Test edge cases immediately: empty inputs, boundary values, incorrect types',
          'Add meaningful error handling with try-except blocks instead of silent failures'
        ],
        outcome: 'Fully functioning, tested code solving the core objective without runtime crashes.'
      }),
      challenge: (goal, level) => ({
        title: 'Refactor & Stress-Test',
        icon: '⚡',
        type: 'focus',
        tasks: [
          'Refactor for clarity: eliminate redundant variables and flatten nested conditionals',
          'Write 3 automated test cases using pytest or unittest',
          'Benchmark execution efficiency and profile memory usage if data size grows 100x',
          'Package code cleanly into a reusable script or class structure'
        ],
        outcome: 'Production-quality, maintainable code following Pythonic best practices.'
      }),
      review: (goal) => ({
        title: 'Error Log & Summary',
        icon: '🎯',
        type: 'recap',
        tasks: [
          'Document every bug or misconception encountered during the session and why it happened',
          'Commit code to Git with a descriptive, concise commit message',
          'Review the code once more with fresh eyes to verify readability'
        ],
        outcome: 'Zero unresolved bugs and an updated personal reference notes archive.'
      })
    },

    // DATA SCIENCE
    datascience: {
      concept: (goal, level) => ({
        title: 'Data Landscape & Framing',
        icon: '📊',
        type: 'focus',
        tasks: [
          `Define the analytical goal clearly: ${goal}`,
          'Audit data schema: check column types, null percentages, duplicate records, and target distributions',
          'Formulate 3 specific hypotheses to prove or disprove during the session',
          'Choose the right visual representations (histograms for distributions, boxplots for outliers, heatmaps for correlations)'
        ],
        outcome: 'Clear roadmap of the dataset dimensions and priority questions to answer.'
      }),
      build: (goal, level) => ({
        title: 'Data Wrangling & Exploration',
        icon: '💻',
        type: 'focus',
        tasks: [
          'Implement data cleaning pipeline: handle nulls logically (imputation vs deletion), parse dates, clean strings',
          'Engineer 2–3 new high-signal features (ratios, aggregations, time differences)',
          'Perform GroupBy aggregations to identify trends across categories',
          'Generate high-contrast, informative visualizations with labelled axes and legends'
        ],
        outcome: 'A polished, clean dataframe and visual plots revealing key data insights.'
      }),
      challenge: (goal, level) => ({
        title: 'Statistical Validation & Depth',
        icon: '⚡',
        type: 'focus',
        tasks: [
          'Validate visual trends with statistical significance (p-values, correlation coefficients, or confidence intervals)',
          'Investigate anomalies or surprising outlier clusters to verify they are real signal, not data entry errors',
          'Summarize top 3 actionable business or scientific takeaways from the findings'
        ],
        outcome: 'Data-backed conclusions with empirical evidence and zero statistical fallacies.'
      }),
      review: (goal) => ({
        title: 'Insights Synthesis & Executive Summary',
        icon: '🎯',
        type: 'recap',
        tasks: [
          'Write a concise 4-sentence executive summary answering the original hypothesis',
          'Export key summary statistics and save visualization plots',
          'Clean up notebook: remove scratch cells and add markdown explanatory headers'
        ],
        outcome: 'A professional, presentation-ready report that anyone can understand in 2 minutes.'
      })
    },

    // DSA
    dsa: {
      concept: (goal, level) => ({
        title: 'Pattern Identification & Warm-up',
        icon: '🧩',
        type: 'focus',
        tasks: [
          `Review the underlying algorithmic pattern for: ${goal}`,
          'Identify canonical triggers: when to use Two Pointers, Monotonic Stack, Sliding Window, or DFS vs BFS',
          'Trace one classic easy/warm-up example by hand on paper before typing any code',
          'State optimal Time and Space complexity targets upfront'
        ],
        outcome: 'Instant pattern recognition and mental clarity on how to navigate the problem space.'
      }),
      build: (goal, level) => ({
        title: 'High-Intensity Problem Solving',
        icon: '💻',
        type: 'focus',
        tasks: [
          'Solve Target Problem 1 under strict 20-minute timed condition',
          'Write pseudocode and declare invariant state variables before implementation',
          'Implement the solution cleanly without relying on external hints',
          'Dry-run on sample test cases with empty array / boundary index checks'
        ],
        outcome: 'Green accepted submissions for primary target problems with zero runtime errors.'
      }),
      challenge: (goal, level) => ({
        title: 'Medium/Hard Twist & Edge Cases',
        icon: '⚡',
        type: 'focus',
        tasks: [
          'Tackle Target Problem 2 with higher constraint variations or modified requirements',
          'Stress-test extreme inputs: duplicates, negative numbers, single-element, massive inputs (10^5)',
          'Optimize space complexity (e.g. from O(N) to O(1) in-place pointers if possible)'
        ],
        outcome: 'Ability to tackle problem variations without freezing up during coding interviews.'
      }),
      review: (goal) => ({
        title: 'Pattern Journal & Error Audit',
        icon: '🎯',
        type: 'recap',
        tasks: [
          'Add solved problems to your personal DSA Tracker / Anki deck',
          'Document the "Aha!" moment: what was the exact insight that made the optimal solution click?',
          'Record common pitfalls (e.g. off-by-one errors, base case omissions) in your mistake log'
        ],
        outcome: 'Permanent addition to your algorithmic muscle memory.'
      })
    },

    // EXAM
    exam: {
      concept: (goal, level) => ({
        title: 'High-Yield Scoping & Active Recall',
        icon: '📚',
        type: 'focus',
        tasks: [
          `Scan syllabus / past papers to flag highest-weighted topics for: ${goal}`,
          'Do a closed-book Brain Dump: write down every formula, definition, and concept you can remember',
          'Compare brain dump with syllabus to immediately isolate critical blind spots',
          'Prioritize topics based on high yield vs current weakness matrix'
        ],
        outcome: 'A prioritized hit-list of the exact topics that will appear on the exam.'
      }),
      build: (goal, level) => ({
        title: 'Timed Past-Paper Blitz',
        icon: '✍️',
        type: 'focus',
        tasks: [
          'Set a strict timer and solve 4–6 actual past exam questions with zero open books',
          'Show complete step-by-step working out as required by exam grading rubrics',
          'Mark answers strictly using the official grading scheme / solution key',
          'Analyze every lost mark: was it conceptual, calculation error, or misreading the question?'
        ],
        outcome: 'Concrete test-taking stamina and familiarity with real exam question phrasings.'
      }),
      challenge: (goal, level) => ({
        title: 'Worst-Case Scenario Mastery',
        icon: '⚡',
        type: 'focus',
        tasks: [
          'Drill the single hardest question style from past years until the pattern is trivial',
          'Create a 1-page condensed Formula & Reaction/Definition Master Sheet',
          'Explain the trickiest concept aloud to an imaginary student (Feynman Technique)'
        ],
        outcome: 'Zero fear of trick questions on exam day.'
      }),
      review: (goal) => ({
        title: 'Final Confidence Check & Packing',
        icon: '🎯',
        type: 'recap',
        tasks: [
          'Review your 1-page Master Cheat Sheet one last time',
          'Test yourself on 5 flashcards or key formulas without checking notes',
          'Organize exam materials (calculator, pens, ID) and set a strict sleep alarm'
        ],
        outcome: 'Calm, confident mindset with zero last-minute panic.'
      })
    },

    // PROJECT
    project: {
      concept: (goal, level) => ({
        title: 'Scope Breakdown & Architectural Spec',
        icon: '📐',
        type: 'focus',
        tasks: [
          `Define the exact "Definition of Done" for this session: ${goal}`,
          'Draft minimal data structures, state models, or API endpoints on paper before coding',
          'Identify the single riskiest technical hurdle and plan the simplest viable solution',
          'Verify dev environment is clean and dependencies are up to date'
        ],
        outcome: 'No architectural ambiguity before typing the first line of code.'
      }),
      build: (goal, level) => ({
        title: 'Deep Execution Sprint',
        icon: '🚀',
        type: 'focus',
        tasks: [
          'Build the core logic / component end-to-end without getting sidetracked by secondary styling',
          'Connect the data layer to the user interface or API handler',
          'Implement happy path flow and verify it works with real or mock data',
          'Write defensive guards against null/undefined state and unexpected payload formats'
        ],
        outcome: 'Working, tangible feature running locally that you can demonstrate.'
      }),
      challenge: (goal, level) => ({
        title: 'Edge Cases, UI Polish & Mobile Testing',
        icon: '⚡',
        type: 'focus',
        tasks: [
          'Test edge cases: network delay, empty state, long text overflow, invalid inputs',
          'Polish responsive styles for mobile viewports and refine spacing / visual hierarchy',
          'Eliminate console warnings, lint errors, and dead code'
        ],
        outcome: 'Rock-solid feature that looks professional and feels snappy.'
      }),
      review: (goal) => ({
        title: 'Git Commit, Demo & Next Steps',
        icon: '🎯',
        type: 'recap',
        tasks: [
          'Perform git status and write a clean, semantic commit message (e.g. feat: implement auth modal)',
          'Update project README or task board (move task to Done)',
          'Note the first 3 tasks for your next working session so you can jump straight in'
        ],
        outcome: 'Committed progress, clean git history, and effortless momentum for tomorrow.'
      })
    },

    // ENGLISH
    english: {
      concept: (goal, level) => ({
        title: 'Structural Framework & Vocabulary Bank',
        icon: '📖',
        type: 'focus',
        tasks: [
          `Review the target format and structural rubric for: ${goal}`,
          'Brainstorm and record 8 high-level topic-specific collocations and academic idioms',
          'Analyze 1 exemplar essay or band-9 speech transcript for cohesive transition devices',
          'Identify 2 habitual grammar or pronunciation mistakes you want to consciously avoid'
        ],
        outcome: 'A rich vocabulary bank and clear structural outline ready for active production.'
      }),
      build: (goal, level) => ({
        title: 'Active Production Sprint',
        icon: '✍️',
        type: 'focus',
        tasks: [
          'Timed writing/speaking sprint: generate complete response under exam/real-world timer',
          'Ensure strong paragraph structure: Topic sentence → Supporting argument → Concrete example → Concluding link',
          'Intentionally incorporate your 8 chosen vocabulary phrases and complex sentence structures',
          'If speaking: record your voice using your phone to evaluate pacing and clarity'
        ],
        outcome: 'A complete, high-quality essay draft or recorded speaking response.'
      }),
      challenge: (goal, level) => ({
        title: 'Self-Correction & Polish',
        icon: '⚡',
        type: 'focus',
        tasks: [
          'Listen to your recording or read your draft out loud to detect awkward rhythm or run-ons',
          'Check grammar: subject-verb agreement, accurate preposition usage, and article consistency',
          'Rewrite 3 basic sentences into sophisticated compound or inverted structures'
        ],
        outcome: 'Significant leap in natural fluency, coherence, and lexical sophistication.'
      }),
      review: (goal) => ({
        title: 'Personal Idiom Vault & Reflection',
        icon: '🎯',
        type: 'recap',
        tasks: [
          'Save your polished response and new phrases into your personal vocabulary vault',
          'Note down 1 pronunciation word or grammar rule to practice tomorrow',
          'Celebrate completing an intense active communication session'
        ],
        outcome: 'Measured improvement in confidence and exam-ready communication skills.'
      })
    },

    // CUSTOM / GENERAL
    custom: {
      concept: (goal, level) => ({
        title: 'Deep Scoping & First Principles',
        icon: '🎯',
        type: 'focus',
        tasks: [
          `Deconstruct the target objective into 3 actionable milestones: ${goal}`,
          'Gather all needed documentation, references, and tabs; close distracting notifications',
          'Define the exact observable outcome: what does "done" look like at minute 0?',
          'Review the core fundamentals or previous session notes to bridge context'
        ],
        outcome: 'Zero ambiguity on what needs to happen and full mental activation.'
      }),
      build: (goal, level) => ({
        title: 'Deep Work Sprint',
        icon: '⚡',
        type: 'focus',
        tasks: [
          `Execute Milestone 1 with 100% single-task focus: ${goal}`,
          'Produce the raw output (code, written pages, solved equations, designed assets)',
          'Avoid premature optimization: get the initial working version completed first',
          'Maintain an inline scratchpad for stray thoughts instead of context-switching'
        ],
        outcome: 'Substantial, measurable core progress that moves the needle.'
      }),
      challenge: (goal, level) => ({
        title: 'Refinement & Quality Polish',
        icon: '💎',
        type: 'focus',
        tasks: [
          'Critique the work done against high standards of quality and correctness',
          'Test boundaries, fix rough edges, and resolve ambiguous sections',
          'Format and organize the output so it is clean and permanent'
        ],
        outcome: 'High-caliber result with zero sloppy shortcuts.'
      }),
      review: (goal) => ({
        title: 'Synthesis, Review & Catalog',
        icon: '📝',
        type: 'recap',
        tasks: [
          'Conduct a 3-minute self-audit: Did you achieve the target outcome defined in Step 1?',
          'Save all work, push backups or commits, and tidy up your workspace',
          'Write a 1-sentence recap of what you accomplished'
        ],
        outcome: 'Complete closure, documented progress, and a satisfying sense of accomplishment.'
      })
    }
  };

  /**
   * Universal break generator for realistic study sessions
   */
  function createBreakBlock(durationMinutes, breakNumber = 1) {
    const breakDescriptions = [
      {
        title: 'Cognitive Reset & Hydration',
        tasks: [
          'Step away from all screens immediately',
          'Drink 250ml of cold water to rehydrate your brain',
          'Do 60 seconds of gentle neck, shoulder, and hamstring stretches',
          'No scrolling feeds or checking social notifications—let your hippocampus consolidate memory'
        ],
        outcome: 'Mental fatigue flushed out and cognitive focus restored to 100%.'
      },
      {
        title: 'Recharge & Movement',
        tasks: [
          'Walk around your room or step outside for fresh air and natural light',
          'Rest your eyes by looking at an object 20+ feet away (20-20-20 rule)',
          'Take 5 deep physiological sighs (two quick inhales through nose, long exhale through mouth)'
        ],
        outcome: 'Reset dopamine baseline and lowered visual eye strain.'
      }
    ];

    const template = breakDescriptions[(breakNumber - 1) % breakDescriptions.length];

    return {
      title: template.title,
      icon: '☕',
      type: 'break',
      tasks: template.tasks,
      outcome: template.outcome
    };
  }

  /**
   * Smart Time-Budgeting Allocator
   * Divides total available minutes into practical, scientifically proven focus intervals + breaks + recap.
   */
  function calculateTimeSlots(totalMinutes) {
    const minutes = Math.max(15, parseInt(totalMinutes, 10) || 120);

    // 15 - 30 minutes: High-intensity single sprint, no break
    if (minutes <= 30) {
      const warmup = Math.min(5, Math.floor(minutes * 0.2));
      const recap = Math.min(5, Math.floor(minutes * 0.2));
      const core = minutes - warmup - recap;
      return [
        { name: 'concept', duration: warmup },
        { name: 'build', duration: core },
        { name: 'review', duration: recap }
      ];
    }

    // 35 - 45 minutes: 1 solid focused block
    if (minutes <= 45) {
      const warmup = 8;
      const recap = 7;
      const core = minutes - warmup - recap;
      return [
        { name: 'concept', duration: warmup },
        { name: 'build', duration: core },
        { name: 'review', duration: recap }
      ];
    }

    // 50 - 65 minutes (1 hour range): 2 mini-phases with 5m breather
    if (minutes <= 65) {
      return [
        { name: 'concept', duration: 12 },
        { name: 'build', duration: 25 },
        { name: 'break', duration: 5, breakNum: 1 },
        { name: 'challenge', duration: 12 },
        { name: 'review', duration: 6 }
      ];
    }

    // 70 - 100 minutes (90 min classic range! Matches prompt example exactly):
    if (minutes <= 100) {
      // For exactly 90 min: 0-15 (15m), 15-40 (25m), 40-45 (5m break), 45-75 (30m challenge), 75-90 (15m review)
      const conceptTime = 15;
      const breakTime = 5;
      const reviewTime = 15;
      const remaining = minutes - conceptTime - breakTime - reviewTime;
      const buildTime = Math.floor(remaining * 0.45);
      const challengeTime = remaining - buildTime;

      return [
        { name: 'concept', duration: conceptTime },
        { name: 'build', duration: buildTime },
        { name: 'break', duration: breakTime, breakNum: 1 },
        { name: 'challenge', duration: challengeTime },
        { name: 'review', duration: reviewTime }
      ];
    }

    // 105 - 140 minutes (2 Hours - the signature session!):
    if (minutes <= 140) {
      // 120 min: 15m warm-up, 40m build block 1, 10m cognitive break, 40m deep build block 2, 15m review
      const conceptTime = 15;
      const breakTime = 10;
      const reviewTime = 15;
      const remaining = minutes - conceptTime - breakTime - reviewTime;
      const buildTime1 = Math.floor(remaining * 0.5);
      const buildTime2 = remaining - buildTime1;

      return [
        { name: 'concept', duration: conceptTime },
        { name: 'build', duration: buildTime1 },
        { name: 'break', duration: breakTime, breakNum: 1 },
        { name: 'challenge', duration: buildTime2 },
        { name: 'review', duration: reviewTime }
      ];
    }

    // 145 - 200 minutes (3 Hours range):
    if (minutes <= 200) {
      return [
        { name: 'concept', duration: 15 },
        { name: 'build', duration: 45 },
        { name: 'break', duration: 10, breakNum: 1 },
        { name: 'challenge', duration: 50 },
        { name: 'break', duration: 10, breakNum: 2 },
        { name: 'build2', duration: 35 },
        { name: 'review', duration: 15 }
      ];
    }

    // 205+ minutes (4 Hours range):
    return [
      { name: 'concept', duration: 20 },
      { name: 'build', duration: 50 },
      { name: 'break', duration: 10, breakNum: 1 },
      { name: 'challenge', duration: 50 },
      { name: 'break', duration: 15, breakNum: 2 },
      { name: 'build2', duration: 50 },
      { name: 'break', duration: 10, breakNum: 3 },
      { name: 'review', duration: minutes - 205 }
    ];
  }

  /**
   * Main Generator Method
   */
  function generatePlan(options) {
    const {
      topicId = 'python',
      customTopic = '',
      minutes = 120,
      goal = '',
      level = 'Beginner'
    } = options;

    const topicKey = topicId in CURRICULUM ? topicId : 'custom';
    const config = TOPIC_CONFIG[topicKey] || TOPIC_CONFIG.custom;
    const finalTopicName = topicKey === 'custom' && customTopic.trim() ? customTopic.trim() : config.name;
    const finalGoal = (goal && goal.trim()) ? goal.trim() : (config.defaultGoal || 'Master the session topic');

    const totalMins = parseInt(minutes, 10) || 120;
    const timeSlots = calculateTimeSlots(totalMins);

    const curriculumSet = CURRICULUM[topicKey] || CURRICULUM.custom;

    let currentStartMinute = 0;
    const blocks = [];
    let focusBlockCount = 0;
    let breakCount = 0;

    timeSlots.forEach((slot, index) => {
      const startMin = currentStartMinute;
      const endMin = currentStartMinute + slot.duration;
      currentStartMinute = endMin;

      let blockData;

      if (slot.name === 'break') {
        breakCount++;
        blockData = createBreakBlock(slot.duration, slot.breakNum || 1);
      } else if (slot.name === 'concept') {
        focusBlockCount++;
        blockData = curriculumSet.concept(finalGoal, level);
      } else if (slot.name === 'build' || slot.name === 'build2') {
        focusBlockCount++;
        blockData = curriculumSet.build(finalGoal, level);
        if (slot.name === 'build2') {
          blockData.title = 'Advanced Application & Integration';
        }
      } else if (slot.name === 'challenge') {
        focusBlockCount++;
        blockData = curriculumSet.challenge(finalGoal, level);
      } else if (slot.name === 'review') {
        focusBlockCount++;
        blockData = curriculumSet.review(finalGoal, level);
      } else {
        focusBlockCount++;
        blockData = curriculumSet.build(finalGoal, level);
      }

      blocks.push({
        id: `block-${index + 1}`,
        blockIndex: index + 1,
        startMin,
        endMin,
        duration: slot.duration,
        timeSpanLabel: `${startMin}–${endMin} min`,
        title: blockData.title,
        icon: blockData.icon,
        type: blockData.type, // 'focus' | 'break' | 'recap'
        tasks: blockData.tasks || [],
        outcome: blockData.outcome || '',
        isBreak: blockData.type === 'break',
        isRecap: blockData.type === 'recap'
      });
    });

    // Formatting Headline (e.g. "Your 90-Minute ML Plan", "Your 2-Hour Python Plan")
    let durationString = `${totalMins} min`;
    if (totalMins === 60) durationString = '1-Hour';
    else if (totalMins === 90) durationString = '90-Minute';
    else if (totalMins === 120) durationString = '2-Hour';
    else if (totalMins === 180) durationString = '3-Hour';
    else if (totalMins === 240) durationString = '4-Hour';
    else if (totalMins % 60 === 0) durationString = `${totalMins / 60}-Hour`;
    else durationString = `${totalMins}-Minute`;

    const topicShortName = topicKey === 'ml' ? 'ML' : (topicKey === 'dsa' ? 'DSA' : finalTopicName);
    const headline = `Your ${durationString} ${topicShortName} Plan`;

    return {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topicId,
      topicName: finalTopicName,
      topicIcon: config.icon,
      goal: finalGoal,
      level,
      totalMinutes: totalMins,
      durationLabel: `${totalMins} minutes`,
      headline,
      blocks,
      stats: {
        totalBlocks: blocks.length,
        focusBlocks: focusBlockCount,
        breakBlocks: breakCount,
        totalTasks: blocks.reduce((acc, b) => acc + (b.tasks ? b.tasks.length : 0), 0)
      }
    };
  }

  // Public API
  return {
    TOPIC_CONFIG,
    generatePlan
  };
})();

// Export for browser and node
if (typeof window !== 'undefined') {
  window.PlanGenerator = PlanGenerator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlanGenerator;
}
