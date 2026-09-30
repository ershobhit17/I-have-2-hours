/**
 * I HAVE 2 HOURS — AI Engine (OpenRouter Integration)
 * Calls OpenRouter AI to generate 100% custom, deep, time-boxed study/work plans.
 * Gracefully falls back to the built-in smart algorithm if no key is provided or if network fails.
 */

const AIService = (function() {
  'use strict';

  const DEFAULT_API_KEY = '';
  const STORAGE_KEY_API = 'ihave2hours_openrouter_key';
  const STORAGE_KEY_MODEL = 'ihave2hours_openrouter_model';
  const DEFAULT_MODEL = 'google/gemini-2.5-flash';

  const memoryStore = {};

  function storageGet(k) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(k);
    }
    return memoryStore[k] || null;
  }

  function storageSet(k, v) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(k, v);
    } else {
      memoryStore[k] = v;
    }
  }

  function storageRemove(k) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(k);
    } else {
      delete memoryStore[k];
    }
  }

  function getApiKey() {
    // Priority: 1. localStorage, 2. window.APP_CONFIG (from local uncommitted config.js), 3. fallback empty
    const localSaved = storageGet(STORAGE_KEY_API);
    if (localSaved && localSaved.trim().length > 10) return localSaved.trim();

    if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.OPENROUTER_API_KEY) {
      return window.APP_CONFIG.OPENROUTER_API_KEY.trim();
    }
    return '';
  }

  function setApiKey(key) {
    if (key) {
      storageSet(STORAGE_KEY_API, key.trim());
    } else {
      storageRemove(STORAGE_KEY_API);
    }
  }

  function getModel() {
    return storageGet(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
  }

  function setModel(model) {
    storageSet(STORAGE_KEY_MODEL, model || DEFAULT_MODEL);
  }

  function hasApiKey() {
    const key = getApiKey();
    return !!(key && key.trim().length > 10);
  }

  /**
   * Generates a study plan using OpenRouter AI
   */
  async function generateWithAI(options) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('NO_API_KEY');
    }

    const {
      topicName,
      minutes,
      goal,
      level
    } = options;

    const totalMinutes = parseInt(minutes, 10) || 120;
    const model = getModel();

    const systemPrompt = `You are the intelligence engine of "I Have 2 Hours", an elite study and work session planner for students and high performers.
Your mission: Turn available time into a realistic, concrete, time-boxed plan.
CRITICAL RULES:
1. Remove decision fatigue. Give specific tasks instead of vague advice (e.g. "Write y = wx + b and calculate MSE loss" NOT "study math").
2. The total sum of duration of ALL blocks MUST EXACTLY equal ${totalMinutes} minutes.
3. If totalMinutes > 45, you MUST include at least one short break (5 to 10 min) titled "Cognitive Reset" or "Recharge" (type: "break", icon: "☕").
4. The final block MUST be a 5-10 minute review/recap (type: "recap", icon: "🎯") with retention verification.
5. Every block must have a concrete "outcome" (e.g. "Outcome: You should be able to explain linear regression without notes").
6. Output MUST BE STRICT VALID JSON ONLY. No markdown wrappers, no backticks, no explanatory text.

JSON Schema format:
{
  "headline": "Your ${totalMinutes}-Minute ${topicName} Plan",
  "blocks": [
    {
      "title": "Concept Refresh",
      "icon": "📖",
      "type": "focus",
      "duration": 15,
      "tasks": [
        "Task 1 description",
        "Task 2 description",
        "Task 3 description"
      ],
      "outcome": "Clear, measurable result of this block"
    }
  ]
}`;

    const userPrompt = `Generate a realistic time-boxed session plan for:
- Subject / Domain: ${topicName}
- Total Available Time: ${totalMinutes} minutes
- Exact Goal: ${goal || 'Master core concepts and practical application'}
- Student Difficulty Level: ${level || 'Beginner'}

Ensure the sum of block durations equals exactly ${totalMinutes} minutes. Output pure JSON.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        'X-Title': 'I Have 2 Hours'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      let msg = `OpenRouter Error (${response.status})`;
      try {
        const json = JSON.parse(errBody);
        if (json.error && json.error.message) msg = json.error.message;
      } catch (e) {}
      throw new Error(msg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from OpenRouter AI.');
    }

    // Parse JSON safely (stripping any accidental markdown backticks)
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    }

    const parsed = JSON.parse(cleaned);

    // Calculate timestamps and format into our app's block structure
    let currentStart = 0;
    let focusCount = 0;
    let breakCount = 0;

    const formattedBlocks = parsed.blocks.map((b, idx) => {
      const startMin = currentStart;
      const endMin = currentStart + b.duration;
      currentStart = endMin;

      const isBreak = b.type === 'break';
      const isRecap = b.type === 'recap';

      if (isBreak) breakCount++;
      else focusCount++;

      return {
        id: `ai-block-${idx + 1}`,
        blockIndex: idx + 1,
        startMin,
        endMin,
        duration: b.duration,
        timeSpanLabel: `${startMin}–${endMin} min`,
        title: b.title,
        icon: b.icon || (isBreak ? '☕' : (isRecap ? '🎯' : '💻')),
        type: b.type || 'focus',
        tasks: b.tasks || [],
        outcome: b.outcome || '',
        isBreak,
        isRecap
      };
    });

    return {
      id: `ai-plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topicId: options.topicId,
      topicName: topicName,
      topicIcon: options.topicIcon || '🧠',
      goal: goal || options.defaultGoal || 'Master the session topic',
      level: level || 'Beginner',
      totalMinutes: totalMinutes,
      durationLabel: `${totalMinutes} minutes`,
      headline: parsed.headline || `Your ${totalMinutes}-Minute ${topicName} Plan`,
      blocks: formattedBlocks,
      isAiGenerated: true,
      aiModel: model,
      stats: {
        totalBlocks: formattedBlocks.length,
        focusBlocks: focusCount,
        breakBlocks: breakCount,
        totalTasks: formattedBlocks.reduce((acc, b) => acc + (b.tasks ? b.tasks.length : 0), 0)
      }
    };
  }

  return {
    getApiKey,
    setApiKey,
    getModel,
    setModel,
    hasApiKey,
    generateWithAI
  };
})();

if (typeof window !== 'undefined') {
  window.AIService = AIService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIService;
}
