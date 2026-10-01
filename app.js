/**
 * I HAVE 2 HOURS — Main Application Logic
 * Coordinates form controls, plan generation (Smart Algorithm + OpenRouter AI),
 * Study Mode Timer with Ambient Audio synthesizer, and Local History with delete controls.
 */

(function() {
  'use strict';

  // State Management
  const state = {
    selectedTopic: 'python',
    customTopicText: '',
    selectedMinutes: 120,
    isCustomTime: false,
    specificGoal: '',
    selectedLevel: 'Beginner',
    currentPlan: null,
    completedTasks: new Set(),
    savedPlans: [],
    
    // Study Mode Timer State
    timer: {
      activeBlockIndex: 0,
      secondsRemaining: 0,
      totalSecondsInBlock: 0,
      isRunning: false,
      intervalId: null
    },

    // Ambient Sound State
    ambient: {
      activeType: 'none',
      volume: 0.4,
      node: null
    }
  };

  // DOM Elements
  const elements = {
    // Nav & Modals
    brandLogo: document.getElementById('brandLogo'),
    aiSettingsBtn: document.getElementById('aiSettingsBtn'),
    aiStatusDot: document.getElementById('aiStatusDot'),
    aiStatusBtnText: document.getElementById('aiStatusBtnText'),
    historyBtn: document.getElementById('historyBtn'),
    historyCount: document.getElementById('historyCount'),
    historyModal: document.getElementById('historyModal'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),
    historyModalBody: document.getElementById('historyModalBody'),

    // AI Settings Modal
    aiSettingsModal: document.getElementById('aiSettingsModal'),
    closeAiSettingsBtn: document.getElementById('closeAiSettingsBtn'),
    openRouterKeyInput: document.getElementById('openRouterKeyInput'),
    aiModelSelect: document.getElementById('aiModelSelect'),
    statusIndicatorDot: document.getElementById('statusIndicatorDot'),
    aiStatusText: document.getElementById('aiStatusText'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    removeApiKeyBtn: document.getElementById('removeApiKeyBtn'),

    // Hero & Form
    heroSection: document.getElementById('heroSection'),
    builderForm: document.getElementById('builderForm'),
    goalGrid: document.getElementById('goalGrid'),
    customGoalContainer: document.getElementById('customGoalContainer'),
    customGoalInput: document.getElementById('customGoalInput'),
    
    timeGrid: document.getElementById('timeGrid'),
    timeSummaryPill: document.getElementById('timeSummaryPill'),
    timeSummaryText: document.getElementById('timeSummaryText'),
    customTimeContainer: document.getElementById('customTimeContainer'),
    customMinutesInput: document.getElementById('customMinutesInput'),
    customMinutesSlider: document.getElementById('customMinutesSlider'),

    specificGoalInput: document.getElementById('specificGoalInput'),
    clearGoalBtn: document.getElementById('clearGoalBtn'),
    suggestionsContainer: document.getElementById('suggestionsContainer'),
    suggestionsList: document.getElementById('suggestionsList'),
    levelPills: document.querySelectorAll('.level-pill'),
    generatePlanBtn: document.getElementById('generatePlanBtn'),

    // Plan Display
    planSection: document.getElementById('planSection'),
    editInputsBtn: document.getElementById('editInputsBtn'),
    copyPlanBtn: document.getElementById('copyPlanBtn'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    startLiveSessionBtn: document.getElementById('startLiveSessionBtn'),
    footerStartSessionBtn: document.getElementById('footerStartSessionBtn'),
    
    planHeroBadgeRow: document.querySelector('.plan-hero-badge-row'),
    planDurationTag: document.getElementById('planDurationTag'),
    planCategoryTag: document.getElementById('planCategoryTag'),
    planLevelTag: document.getElementById('planLevelTag'),
    planHeadline: document.getElementById('planHeadline'),
    planMetaGoal: document.getElementById('planMetaGoal'),
    planMetaDiff: document.getElementById('planMetaDiff'),
    planMetaTime: document.getElementById('planMetaTime'),
    planMetaStructure: document.getElementById('planMetaStructure'),
    timelineVisualBar: document.getElementById('timelineVisualBar'),
    timelineBlocksList: document.getElementById('timelineBlocksList'),
    completionStats: document.getElementById('completionStats'),
    statsText: document.getElementById('statsText'),

    // Study Mode Timer Modal
    focusModal: document.getElementById('focusModal'),
    studyModeContainer: document.getElementById('studyModeContainer'),
    studyFullscreenBtn: document.getElementById('studyFullscreenBtn'),
    closeFocusBtn: document.getElementById('closeFocusBtn'),
    timerPrevBtn: document.getElementById('timerPrevBtn'),
    timerNextBtnTop: document.getElementById('timerNextBtnTop'),
    focusBlockBadge: document.getElementById('focusBlockBadge'),
    focusBlockTitle: document.getElementById('focusBlockTitle'),
    focusBlockObjective: document.getElementById('focusBlockObjective'),
    timerDigits: document.getElementById('timerDigits'),
    timerRingProgress: document.getElementById('timerRingProgress'),
    timerStateLabel: document.getElementById('timerStateLabel'),
    timerToggleBtn: document.getElementById('timerToggleBtn'),
    timerToggleIcon: document.getElementById('timerToggleIcon'),
    timerToggleText: document.getElementById('timerToggleText'),
    timerResetBtn: document.getElementById('timerResetBtn'),
    timerNextBtn: document.getElementById('timerNextBtn'),
    ambientButtons: document.getElementById('ambientButtons'),
    ambientVolume: document.getElementById('ambientVolume'),
    focusTasksList: document.getElementById('focusTasksList'),
    focusOutcomeText: document.getElementById('focusOutcomeText'),

    // Toast
    toastNotification: document.getElementById('toastNotification'),
    toastMessage: document.getElementById('toastMessage')
  };

  /**
   * Audio Engine using Web Audio API: Chime + Ambient Focus Sound Synthesizer
   */
  const AudioEngine = {
    ctx: null,
    masterGain: null,
    ambientGain: null,
    ambientSource: null,

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(state.ambient.volume, this.ctx.currentTime);
        this.ambientGain.connect(this.masterGain);
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    playChime() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(261.63, now); // C4

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.9);
        osc2.stop(now + 0.9);
      } catch (e) {
        console.warn('Audio chime unsupported:', e);
      }
    },

    stopAmbient() {
      if (this.ambientSource) {
        try {
          if (this.ambientSource.stop) this.ambientSource.stop();
          if (this.ambientSource.disconnect) this.ambientSource.disconnect();
          clearInterval(this.ambientSource._interval);
        } catch (e) {}
        this.ambientSource = null;
      }
      state.ambient.activeType = 'none';
    },

    setAmbientVolume(val) {
      state.ambient.volume = Math.max(0, Math.min(1, val));
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setValueAtTime(state.ambient.volume, this.ctx.currentTime);
      }
    },

    playAmbient(type) {
      this.init();
      this.stopAmbient();
      state.ambient.activeType = type;

      if (type === 'none' || !this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'rain') {
        // Pink / filtered noise for gentle rain
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);

        whiteNoise.connect(filter);
        filter.connect(this.ambientGain);
        whiteNoise.start(now);
        this.ambientSource = whiteNoise;

      } else if (type === 'waves') {
        // Modulated brown noise for deep ocean waves
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 1.5;
        }

        const brownNoise = this.ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        // Wave amplitude LFO
        const waveGain = this.ctx.createGain();
        waveGain.gain.setValueAtTime(0.2, now);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, now); // ~8 second wave cycle
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.15, now);

        lfo.connect(lfoGain);
        lfoGain.connect(waveGain.gain);

        brownNoise.connect(waveGain);
        waveGain.connect(this.ambientGain);

        brownNoise.start(now);
        lfo.start(now);
        this.ambientSource = brownNoise;

      } else if (type === 'tick') {
        // Gentle mechanical clock tick (1 tick per second)
        const tickInterval = setInterval(() => {
          if (!this.ctx || state.ambient.activeType !== 'tick') return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.exponentialRampToValueAtTime(300, t + 0.02);

          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

          osc.connect(gain);
          gain.connect(this.ambientGain);
          osc.start(t);
          osc.stop(t + 0.035);
        }, 1000);

        this.ambientSource = { _interval: tickInterval };
      }
    }
  };

  /**
   * Toast Notification
   */
  function showToast(message, duration = 2600) {
    if (!elements.toastNotification) return;
    elements.toastMessage.textContent = message;
    elements.toastNotification.classList.add('show');
    clearTimeout(elements.toastNotification._timeout);
    elements.toastNotification._timeout = setTimeout(() => {
      elements.toastNotification.classList.remove('show');
    }, duration);
  }

  /**
   * LocalStorage Helpers for History
   */
  function loadHistory() {
    try {
      const data = localStorage.getItem('ihave2hours_history');
      if (data) {
        state.savedPlans = JSON.parse(data);
      }
    } catch (e) {
      state.savedPlans = [];
    }
    updateHistoryBadge();
  }

  function saveCurrentPlanToHistory(plan) {
    if (!plan) return;
    const existingIndex = state.savedPlans.findIndex(p => p.id === plan.id);
    if (existingIndex >= 0) {
      state.savedPlans.splice(existingIndex, 1);
    }
    state.savedPlans.unshift(plan);
    if (state.savedPlans.length > 15) {
      state.savedPlans = state.savedPlans.slice(0, 15);
    }
    try {
      localStorage.setItem('ihave2hours_history', JSON.stringify(state.savedPlans));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
    updateHistoryBadge();
  }

  function deleteHistoryItem(planId) {
    state.savedPlans = state.savedPlans.filter(p => p.id !== planId);
    try {
      localStorage.setItem('ihave2hours_history', JSON.stringify(state.savedPlans));
    } catch (e) {}
    updateHistoryBadge();
    renderHistoryModal();
    showToast('Plan deleted from history');
  }

  function clearAllHistory() {
    if (state.savedPlans.length === 0) return;
    if (confirm('Are you sure you want to delete all saved study plans?')) {
      state.savedPlans = [];
      try {
        localStorage.removeItem('ihave2hours_history');
      } catch (e) {}
      updateHistoryBadge();
      renderHistoryModal();
      showToast('All saved plans cleared');
    }
  }

  function updateHistoryBadge() {
    if (elements.historyCount) {
      elements.historyCount.textContent = state.savedPlans.length;
    }
  }

  /**
   * AI Status UI Synchronization
   */
  function updateAiStatusIndicator() {
    const hasKey = window.AIService.hasApiKey();
    const isUsingDefault = window.AIService.isUsingDefaultKey && window.AIService.isUsingDefaultKey();
    const currentModel = window.AIService.getModel();
    const shortModel = currentModel.split('/')[1] || currentModel;

    if (elements.aiStatusDot) {
      if (hasKey) {
        elements.aiStatusDot.classList.add('active');
        elements.aiStatusDot.title = `AI Active: ${currentModel}`;
      } else {
        elements.aiStatusDot.classList.remove('active');
        elements.aiStatusDot.title = 'AI Offline (Using Smart Algorithm)';
      }
    }

    if (elements.aiStatusBtnText) {
      if (hasKey) {
        elements.aiStatusBtnText.textContent = '✨ AI Active';
      } else {
        elements.aiStatusBtnText.textContent = '⚡ Connect AI';
      }
    }

    if (elements.statusIndicatorDot && elements.aiStatusText) {
      if (hasKey) {
        elements.statusIndicatorDot.classList.add('active');
        const keyNote = isUsingDefault ? '(Shared Cloud Key)' : '(Custom Key)';
        elements.aiStatusText.textContent = `Connected: ${shortModel} ${keyNote}`;
      } else {
        elements.statusIndicatorDot.classList.remove('active');
        elements.aiStatusText.textContent = 'Offline Mode: Using built-in smart algorithm';
      }
    }
  }

  /**
   * Suggestions UI updater based on selected topic
   */
  function updateSuggestions(topicKey) {
    const config = window.PlanGenerator.TOPIC_CONFIG[topicKey] || window.PlanGenerator.TOPIC_CONFIG.custom;
    elements.suggestionsList.innerHTML = '';

    if (!config.suggestions || config.suggestions.length === 0) {
      elements.suggestionsContainer.style.display = 'none';
      return;
    }

    elements.suggestionsContainer.style.display = 'flex';
    config.suggestions.forEach(suggestionText => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'suggestion-chip';
      chip.textContent = suggestionText;
      if (elements.specificGoalInput.value.trim() === suggestionText) {
        chip.classList.add('active');
      }

      chip.addEventListener('click', () => {
        elements.specificGoalInput.value = suggestionText;
        state.specificGoal = suggestionText;
        elements.clearGoalBtn.style.display = 'flex';
        
        document.querySelectorAll('.suggestion-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });

      elements.suggestionsList.appendChild(chip);
    });
  }

  /**
   * Format Minutes into human string
   */
  function formatDurationSummary(mins) {
    if (mins === 60) return '1 hour (60 min)';
    if (mins === 120) return '2 hours (120 min)';
    if (mins === 180) return '3 hours (180 min)';
    if (mins === 240) return '4 hours (240 min)';
    if (mins % 60 === 0) return `${mins / 60} hours (${mins} min)`;
    if (mins > 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m (${mins} min)`;
    }
    return `${mins} min`;
  }

  /**
   * Update Time Selection UI
   */
  function setDuration(minutes, isCustom = false) {
    state.selectedMinutes = parseInt(minutes, 10) || 120;
    state.isCustomTime = isCustom;

    const pills = elements.timeGrid.querySelectorAll('.time-pill');
    pills.forEach(pill => {
      const pMins = pill.getAttribute('data-minutes');
      if (isCustom && pMins === 'custom') {
        pill.classList.add('selected');
        pill.setAttribute('aria-checked', 'true');
      } else if (!isCustom && parseInt(pMins, 10) === state.selectedMinutes) {
        pill.classList.add('selected');
        pill.setAttribute('aria-checked', 'true');
      } else {
        pill.classList.remove('selected');
        pill.setAttribute('aria-checked', 'false');
      }
    });

    if (isCustom) {
      elements.customTimeContainer.style.display = 'block';
      elements.customMinutesInput.value = state.selectedMinutes;
      elements.customMinutesSlider.value = state.selectedMinutes;
    } else {
      elements.customTimeContainer.style.display = 'none';
    }

    elements.timeSummaryText.textContent = formatDurationSummary(state.selectedMinutes);
  }

  /**
   * Renders the Generated Plan into the UI
   */
  function renderPlan(plan) {
    state.currentPlan = plan;
    state.completedTasks.clear();

    // Fill Header
    elements.planHeadline.textContent = plan.headline;
    elements.planDurationTag.textContent = `${plan.totalMinutes} min`;
    elements.planCategoryTag.textContent = `${plan.topicIcon} ${plan.topicName}`;
    elements.planLevelTag.textContent = plan.level;

    // AI Badge vs Template Badge handling
    const existingAiBadge = document.getElementById('planAiBadge');
    if (existingAiBadge) existingAiBadge.remove();
    const existingTplBadge = document.getElementById('planTplBadge');
    if (existingTplBadge) existingTplBadge.remove();

    if (plan.isAiGenerated) {
      const aiBadge = document.createElement('span');
      aiBadge.className = 'plan-pill-tag ai-badge';
      aiBadge.id = 'planAiBadge';
      const shortModel = plan.aiModel ? plan.aiModel.split('/')[1] || plan.aiModel : 'AI';
      aiBadge.innerHTML = `✨ AI: ${shortModel}`;
      elements.planHeroBadgeRow.appendChild(aiBadge);
    } else {
      const tplBadge = document.createElement('span');
      tplBadge.className = 'plan-pill-tag template-badge';
      tplBadge.id = 'planTplBadge';
      tplBadge.innerHTML = `📋 Template Engine`;
      tplBadge.title = plan.fallbackReason ? `AI fallback: ${plan.fallbackReason}` : 'Offline template';
      elements.planHeroBadgeRow.appendChild(tplBadge);
    }

    elements.planMetaGoal.textContent = plan.goal;
    elements.planMetaDiff.textContent = plan.level;
    elements.planMetaTime.textContent = plan.durationLabel;
    elements.planMetaStructure.textContent = `${plan.stats.focusBlocks} Focus • ${plan.stats.breakBlocks} Break • 1 Recap`;

    // Render Timeline Visual Bar
    elements.timelineVisualBar.innerHTML = '';
    plan.blocks.forEach(block => {
      const seg = document.createElement('div');
      seg.className = `bar-segment ${block.type}`;
      const pct = (block.duration / plan.totalMinutes) * 100;
      seg.style.width = `${pct}%`;
      seg.title = `${block.title} (${block.duration} min)`;
      elements.timelineVisualBar.appendChild(seg);
    });

    // Render Blocks List
    elements.timelineBlocksList.innerHTML = '';
    plan.blocks.forEach((block, blockIdx) => {
      const card = document.createElement('div');
      card.className = `timeline-block-card ${block.isBreak ? 'is-break' : ''} ${block.isRecap ? 'is-recap' : ''}`;
      card.id = `timeline-block-${block.id}`;

      // Left Column (Timing)
      const leftCol = document.createElement('div');
      leftCol.className = 'block-left-col';
      leftCol.innerHTML = `
        <span class="block-time-range">${block.timeSpanLabel}</span>
        <span class="block-duration-badge">⏱ ${block.duration}m</span>
        <span class="block-type-label">${block.isBreak ? 'Rest Interval' : (block.isRecap ? 'Synthesis' : 'Deep Work')}</span>
      `;

      // Right Column (Content)
      const rightCol = document.createElement('div');
      rightCol.className = 'block-right-col';

      // Header row
      const titleRow = document.createElement('div');
      titleRow.className = 'block-title-row';
      titleRow.innerHTML = `
        <div class="block-title-group">
          <span class="block-icon">${block.icon}</span>
          <div>
            <h4 class="block-heading">${block.title}</h4>
          </div>
        </div>
      `;
      rightCol.appendChild(titleRow);

      // Tasks Checklist
      if (block.tasks && block.tasks.length > 0) {
        const tasksList = document.createElement('div');
        tasksList.className = 'block-tasks-list';

        block.tasks.forEach((taskText, taskIdx) => {
          const taskId = `${block.id}-task-${taskIdx}`;
          const item = document.createElement('label');
          item.className = 'task-item';
          item.htmlFor = taskId;

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'task-checkbox';
          checkbox.id = taskId;

          checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
              state.completedTasks.add(taskId);
              item.classList.add('completed');
            } else {
              state.completedTasks.delete(taskId);
              item.classList.remove('completed');
            }
            updateCompletionStats();
          });

          const span = document.createElement('span');
          span.className = 'task-text';
          span.textContent = taskText;

          item.appendChild(checkbox);
          item.appendChild(span);
          tasksList.appendChild(item);
        });

        rightCol.appendChild(tasksList);
      }

      // Outcome Box
      if (block.outcome) {
        const outcomeBox = document.createElement('div');
        outcomeBox.className = 'block-outcome-box';
        outcomeBox.innerHTML = `
          <span class="outcome-tag">Target Outcome</span>
          <p class="outcome-desc">${block.outcome}</p>
        `;
        rightCol.appendChild(outcomeBox);
      }

      card.appendChild(leftCol);
      card.appendChild(rightCol);
      elements.timelineBlocksList.appendChild(card);
    });

    updateCompletionStats();

    // Toggle View: hide form, show plan
    elements.heroSection.style.display = 'none';
    elements.builderForm.style.display = 'none';
    elements.planSection.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    saveCurrentPlanToHistory(plan);
  }

  /**
   * Update Progress / Completion Stats
   */
  function updateCompletionStats() {
    if (!state.currentPlan) return;
    const total = state.currentPlan.stats.totalTasks;
    const completed = state.completedTasks.size;
    elements.statsText.textContent = `${completed} of ${total} tasks completed`;

    if (completed === total && total > 0) {
      elements.statsText.textContent = `All ${total} tasks completed! Session Mastered 🏆`;
      AudioEngine.playChime();
    }
  }

  /**
   * Plan Generation Action Handler (AI with Fallback)
   */
  async function handleGeneratePlan() {
    const topicId = state.selectedTopic;
    const customTopic = elements.customGoalInput ? elements.customGoalInput.value.trim() : '';
    const minutes = state.selectedMinutes;
    const specificGoal = elements.specificGoalInput.value.trim();
    const level = state.selectedLevel;

    const topicConfig = window.PlanGenerator.TOPIC_CONFIG[topicId] || window.PlanGenerator.TOPIC_CONFIG.custom;
    const finalTopicName = topicId === 'custom' && customTopic ? customTopic : topicConfig.name;

    const hasAiKey = window.AIService.hasApiKey();

    elements.generatePlanBtn.classList.add('loading');
    if (hasAiKey) {
      elements.generatePlanBtn.querySelector('.cta-text').textContent = 'Consulting AI Model...';
      if (elements.aiStatusDot) elements.aiStatusDot.classList.add('loading');
    } else {
      elements.generatePlanBtn.querySelector('.cta-text').textContent = 'Optimizing Time Boxes...';
    }

    try {
      let plan;

      if (hasAiKey) {
        try {
          plan = await window.AIService.generateWithAI({
            topicId,
            topicName: finalTopicName,
            topicIcon: topicConfig.icon,
            minutes,
            goal: specificGoal,
            level
          });
          showToast(`Generated via OpenRouter (${window.AIService.getModel().split('/')[1] || 'AI'}) ✨`);
        } catch (aiErr) {
          console.warn('AI generation error, falling back to smart engine:', aiErr);
          showToast(`AI error: ${aiErr.message}. Switched to template mode.`, 4500);
          plan = window.PlanGenerator.generatePlan({
            topicId,
            customTopic,
            minutes,
            goal: specificGoal,
            level
          });
          plan.fallbackReason = aiErr.message;
        }
      } else {
        // Built-in smart algorithm
        await new Promise(r => setTimeout(r, 260));
        plan = window.PlanGenerator.generatePlan({
          topicId,
          customTopic,
          minutes,
          goal: specificGoal,
          level
        });
        showToast('Plan ready! Let’s focus.');
      }

      renderPlan(plan);
    } catch (err) {
      console.error(err);
      showToast('Error building plan. Please check inputs.');
    } finally {
      elements.generatePlanBtn.classList.remove('loading');
      elements.generatePlanBtn.querySelector('.cta-text').textContent = 'Build My Plan';
      if (elements.aiStatusDot) elements.aiStatusDot.classList.remove('loading');
    }
  }

  /**
   * Study Mode / Live Session Implementation
   */
  function openStudySession() {
    if (!state.currentPlan || !state.currentPlan.blocks.length) return;
    state.timer.activeBlockIndex = 0;
    setupFocusBlock(0);
    elements.focusModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeStudySession() {
    pauseTimer();
    AudioEngine.stopAmbient();
    updateAmbientButtonsUI('none');
    elements.focusModal.style.display = 'none';
    document.body.style.overflow = '';

    // Exit fullscreen if active
    if (elements.studyModeContainer.classList.contains('fullscreen')) {
      elements.studyModeContainer.classList.remove('fullscreen');
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function toggleStudyFullscreen() {
    elements.studyModeContainer.classList.toggle('fullscreen');
    if (!document.fullscreenElement) {
      if (elements.focusModal.requestFullscreen) {
        elements.focusModal.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function setupFocusBlock(index) {
    if (!state.currentPlan || !state.currentPlan.blocks[index]) return;
    const block = state.currentPlan.blocks[index];
    state.timer.activeBlockIndex = index;
    state.timer.totalSecondsInBlock = block.duration * 60;
    state.timer.secondsRemaining = state.timer.totalSecondsInBlock;

    elements.focusBlockBadge.textContent = `Block ${index + 1} of ${state.currentPlan.blocks.length} • ${block.isBreak ? '☕ Rest' : '⚡ Deep Focus'}`;
    elements.focusBlockTitle.textContent = `${block.icon} ${block.title}`;
    elements.focusBlockObjective.textContent = `${block.timeSpanLabel} (${block.duration} min)`;
    elements.focusOutcomeText.textContent = block.outcome || 'Maintain total presence and deep work.';

    // Nav buttons enable/disable
    elements.timerPrevBtn.disabled = (index === 0);
    elements.timerNextBtnTop.disabled = (index === state.currentPlan.blocks.length - 1);

    // Populate checklist for study mode
    elements.focusTasksList.innerHTML = '';
    if (block.tasks && block.tasks.length) {
      block.tasks.forEach((task, tIdx) => {
        const taskId = `${block.id}-task-${tIdx}`;
        const isChecked = state.completedTasks.has(taskId);

        const row = document.createElement('div');
        row.className = `task-item ${isChecked ? 'completed' : ''}`;
        row.innerHTML = `
          <input type="checkbox" class="task-checkbox" ${isChecked ? 'checked' : ''} id="focus-${taskId}">
          <span class="task-text">${task}</span>
        `;
        row.querySelector('input').addEventListener('change', (e) => {
          if (e.target.checked) {
            state.completedTasks.add(taskId);
            row.classList.add('completed');
          } else {
            state.completedTasks.delete(taskId);
            row.classList.remove('completed');
          }
          const mainCb = document.getElementById(taskId);
          if (mainCb) mainCb.checked = e.target.checked;
          updateCompletionStats();
        });
        elements.focusTasksList.appendChild(row);
      });
    }

    updateTimerDisplay();
    updateTimerProgressRing();
  }

  function startTimer() {
    if (state.timer.isRunning) return;
    AudioEngine.init();
    state.timer.isRunning = true;
    elements.timerToggleText.textContent = 'Pause';
    elements.timerToggleIcon.textContent = '⏸';
    elements.timerStateLabel.textContent = 'ACTIVE FOCUS';

    state.timer.intervalId = setInterval(() => {
      if (state.timer.secondsRemaining > 0) {
        state.timer.secondsRemaining--;
        updateTimerDisplay();
        updateTimerProgressRing();
      } else {
        clearInterval(state.timer.intervalId);
        state.timer.isRunning = false;
        AudioEngine.playChime();
        showToast('Block completed! Great work.');

        if (state.timer.activeBlockIndex < state.currentPlan.blocks.length - 1) {
          setupFocusBlock(state.timer.activeBlockIndex + 1);
          startTimer();
        } else {
          elements.timerStateLabel.textContent = 'SESSION COMPLETE!';
          elements.timerToggleText.textContent = 'Done';
          elements.timerToggleIcon.textContent = '✓';
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!state.timer.isRunning) return;
    clearInterval(state.timer.intervalId);
    state.timer.isRunning = false;
    elements.timerToggleText.textContent = 'Resume';
    elements.timerToggleIcon.textContent = '▶';
    elements.timerStateLabel.textContent = 'PAUSED';
  }

  function toggleTimer() {
    if (state.timer.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function resetCurrentTimer() {
    pauseTimer();
    state.timer.secondsRemaining = state.timer.totalSecondsInBlock;
    elements.timerToggleText.textContent = 'Start';
    elements.timerToggleIcon.textContent = '▶';
    elements.timerStateLabel.textContent = 'READY TO FOCUS';
    updateTimerDisplay();
    updateTimerProgressRing();
  }

  function skipToNextBlock() {
    pauseTimer();
    if (state.timer.activeBlockIndex < state.currentPlan.blocks.length - 1) {
      setupFocusBlock(state.timer.activeBlockIndex + 1);
    } else {
      showToast('You are on the final block!');
    }
  }

  function goToPrevBlock() {
    pauseTimer();
    if (state.timer.activeBlockIndex > 0) {
      setupFocusBlock(state.timer.activeBlockIndex - 1);
    }
  }

  function updateTimerDisplay() {
    const totalSecs = state.timer.secondsRemaining;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    elements.timerDigits.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateTimerProgressRing() {
    if (!elements.timerRingProgress) return;
    const circumference = 2 * Math.PI * 54;
    const ratio = state.timer.totalSecondsInBlock > 0
      ? (state.timer.secondsRemaining / state.timer.totalSecondsInBlock)
      : 0;
    const offset = circumference * (1 - ratio);
    elements.timerRingProgress.style.strokeDashoffset = offset;
  }

  function updateAmbientButtonsUI(soundType) {
    if (!elements.ambientButtons) return;
    elements.ambientButtons.querySelectorAll('.ambient-chip').forEach(btn => {
      if (btn.getAttribute('data-sound') === soundType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Copy Plan to Clipboard (Formatted Markdown)
   */
  function copyPlanToClipboard() {
    if (!state.currentPlan) return;
    const p = state.currentPlan;
    let md = `# ${p.headline}\n`;
    md += `**Goal:** ${p.goal}\n`;
    md += `**Difficulty:** ${p.level}\n`;
    md += `**Total Time:** ${p.durationLabel}\n`;
    if (p.isAiGenerated) {
      md += `*Engine: AI (${p.aiModel})*\n`;
    }
    md += `\n## Timeline Blueprint\n\n`;

    p.blocks.forEach(b => {
      md += `### ${b.timeSpanLabel} — ${b.icon} ${b.title}\n`;
      if (b.tasks && b.tasks.length) {
        b.tasks.forEach(t => {
          md += `* [ ] ${t}\n`;
        });
      }
      if (b.outcome) {
        md += `\n**Outcome:** ${b.outcome}\n`;
      }
      md += `\n---\n\n`;
    });

    md += `*Generated with "I Have 2 Hours" — Time-boxed session planner.*`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(() => {
        showToast('Plan copied to clipboard as Markdown!');
      }).catch(() => fallbackCopy(md));
    } else {
      fallbackCopy(md);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Plan copied to clipboard!');
    } catch (e) {
      showToast('Failed to copy. Please select manually.');
    }
    document.body.removeChild(textArea);
  }

  /**
   * Render History Modal with Individual Delete + Clear All
   */
  function renderHistoryModal() {
    elements.historyModalBody.innerHTML = '';
    if (!state.savedPlans || state.savedPlans.length === 0) {
      elements.historyModalBody.innerHTML = `
        <div class="history-empty-state">
          <p>No saved plans yet.</p>
          <span style="font-size:0.8rem; color:var(--text-muted); margin-top:6px; display:block;">
            Generate your first session plan and it will appear here.
          </span>
        </div>
      `;
      return;
    }

    state.savedPlans.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'history-item-card';
      const createdDate = new Date(plan.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      card.innerHTML = `
        <div class="history-item-info">
          <span class="history-item-title">${plan.headline}</span>
          <span class="history-item-meta">${plan.goal} • ${plan.level} • ${createdDate} ${plan.isAiGenerated ? '• ✨ AI' : ''}</span>
        </div>
        <div class="history-item-actions">
          <button type="button" class="btn-ghost" style="padding:6px 12px; font-size:0.82rem;" data-action="open">Open</button>
          <button type="button" class="history-item-delete-btn" title="Delete this plan" data-action="delete" aria-label="Delete plan">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      // Click to open plan
      card.querySelector('[data-action="open"]').addEventListener('click', (e) => {
        e.stopPropagation();
        renderPlan(plan);
        elements.historyModal.style.display = 'none';
        showToast('Loaded saved plan from history');
      });

      // Click card itself opens plan
      card.addEventListener('click', () => {
        renderPlan(plan);
        elements.historyModal.style.display = 'none';
        showToast('Loaded saved plan from history');
      });

      // Delete specific item
      card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(plan.id);
      });

      elements.historyModalBody.appendChild(card);
    });
  }

  /**
   * Event Listeners Initialization
   */
  function initEventListeners() {
    // Brand click
    elements.brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      elements.planSection.style.display = 'none';
      elements.heroSection.style.display = 'block';
      elements.builderForm.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Edit Inputs
    elements.editInputsBtn.addEventListener('click', () => {
      elements.planSection.style.display = 'none';
      elements.heroSection.style.display = 'block';
      elements.builderForm.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // History Modal Open/Close & Clear All
    elements.historyBtn.addEventListener('click', () => {
      renderHistoryModal();
      elements.historyModal.style.display = 'flex';
    });
    elements.closeHistoryBtn.addEventListener('click', () => {
      elements.historyModal.style.display = 'none';
    });
    elements.clearAllHistoryBtn.addEventListener('click', clearAllHistory);
    elements.historyModal.addEventListener('click', (e) => {
      if (e.target === elements.historyModal) {
        elements.historyModal.style.display = 'none';
      }
    });

    // AI Settings Modal Open/Close
    elements.aiSettingsBtn.addEventListener('click', () => {
      const isDefault = window.AIService.isUsingDefaultKey && window.AIService.isUsingDefaultKey();
      const currentKey = window.AIService.getApiKey();
      if (isDefault) {
        elements.openRouterKeyInput.value = '';
        elements.openRouterKeyInput.placeholder = 'Using shared cloud key (or enter custom key)...';
      } else {
        elements.openRouterKeyInput.value = currentKey;
        elements.openRouterKeyInput.placeholder = 'sk-or-v1-xxxxxxxxxxxxxxxxxxxx...';
      }
      elements.aiModelSelect.value = window.AIService.getModel();
      updateAiStatusIndicator();
      elements.aiSettingsModal.style.display = 'flex';
    });
    elements.closeAiSettingsBtn.addEventListener('click', () => {
      elements.aiSettingsModal.style.display = 'none';
    });
    elements.aiSettingsModal.addEventListener('click', (e) => {
      if (e.target === elements.aiSettingsModal) {
        elements.aiSettingsModal.style.display = 'none';
      }
    });

    // AI Save & Remove Actions
    elements.saveApiKeyBtn.addEventListener('click', () => {
      const key = elements.openRouterKeyInput.value.trim();
      const model = elements.aiModelSelect.value;
      if (!key) {
        showToast('Please enter a valid OpenRouter API key');
        return;
      }
      window.AIService.setApiKey(key);
      window.AIService.setModel(model);
      updateAiStatusIndicator();
      elements.aiSettingsModal.style.display = 'none';
      showToast('Custom OpenRouter key saved! Using your personal API key.');
    });

    elements.removeApiKeyBtn.addEventListener('click', () => {
      window.AIService.setApiKey('');
      elements.openRouterKeyInput.value = '';
      updateAiStatusIndicator();
      showToast('Custom key removed. Reset to default shared connection.');
    });

    // Topic Selection Cards
    const goalCards = elements.goalGrid.querySelectorAll('.goal-card');
    goalCards.forEach(card => {
      card.addEventListener('click', () => {
        goalCards.forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');

        const topicId = card.getAttribute('data-goal');
        state.selectedTopic = topicId;

        if (topicId === 'custom') {
          elements.customGoalContainer.style.display = 'block';
          elements.customGoalInput.focus();
        } else {
          elements.customGoalContainer.style.display = 'none';
        }

        updateSuggestions(topicId);
      });
    });

    // Time Selection Pills
    const timePills = elements.timeGrid.querySelectorAll('.time-pill');
    timePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const val = pill.getAttribute('data-minutes');
        if (val === 'custom') {
          setDuration(elements.customMinutesInput.value || 75, true);
        } else {
          setDuration(val, false);
        }
      });
    });

    // Custom Minutes Input & Slider
    elements.customMinutesInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val)) val = 15;
      val = Math.max(15, Math.min(360, val));
      state.selectedMinutes = val;
      elements.customMinutesSlider.value = val;
      elements.timeSummaryText.textContent = formatDurationSummary(val);
    });

    elements.customMinutesSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.selectedMinutes = val;
      elements.customMinutesInput.value = val;
      elements.timeSummaryText.textContent = formatDurationSummary(val);
    });

    // Specific Goal Input
    elements.specificGoalInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.specificGoal = val;
      elements.clearGoalBtn.style.display = val.length > 0 ? 'flex' : 'none';

      document.querySelectorAll('.suggestion-chip').forEach(c => {
        if (c.textContent.trim() === val.trim()) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    });

    elements.clearGoalBtn.addEventListener('click', () => {
      elements.specificGoalInput.value = '';
      state.specificGoal = '';
      elements.clearGoalBtn.style.display = 'none';
      document.querySelectorAll('.suggestion-chip').forEach(c => c.classList.remove('active'));
      elements.specificGoalInput.focus();
    });

    // Difficulty Level Selection
    elements.levelPills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.levelPills.forEach(p => {
          p.classList.remove('selected');
          p.setAttribute('aria-checked', 'false');
        });
        pill.classList.add('selected');
        pill.setAttribute('aria-checked', 'true');
        state.selectedLevel = pill.getAttribute('data-level');
      });
    });

    // Main Generate Button
    elements.generatePlanBtn.addEventListener('click', handleGeneratePlan);

    elements.specificGoalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGeneratePlan();
      }
    });

    // Plan Actions
    elements.copyPlanBtn.addEventListener('click', copyPlanToClipboard);
    elements.regenerateBtn.addEventListener('click', handleGeneratePlan);

    // Study Mode Triggers
    elements.startLiveSessionBtn.addEventListener('click', openStudySession);
    elements.footerStartSessionBtn.addEventListener('click', openStudySession);
    elements.closeFocusBtn.addEventListener('click', closeStudySession);
    elements.studyFullscreenBtn.addEventListener('click', toggleStudyFullscreen);

    // Timer Steppers & Controls
    elements.timerToggleBtn.addEventListener('click', toggleTimer);
    elements.timerResetBtn.addEventListener('click', resetCurrentTimer);
    elements.timerNextBtn.addEventListener('click', skipToNextBlock);
    elements.timerNextBtnTop.addEventListener('click', skipToNextBlock);
    elements.timerPrevBtn.addEventListener('click', goToPrevBlock);

    // Ambient Sound Controls
    if (elements.ambientButtons) {
      elements.ambientButtons.querySelectorAll('.ambient-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const soundType = chip.getAttribute('data-sound');
          AudioEngine.playAmbient(soundType);
          updateAmbientButtonsUI(soundType);
        });
      });
    }

    if (elements.ambientVolume) {
      elements.ambientVolume.addEventListener('input', (e) => {
        AudioEngine.setAmbientVolume(parseFloat(e.target.value));
      });
    }

    elements.focusModal.addEventListener('click', (e) => {
      if (e.target === elements.focusModal) {
        closeStudySession();
      }
    });

    // Global ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.focusModal.style.display === 'flex') {
          closeStudySession();
        } else if (elements.historyModal.style.display === 'flex') {
          elements.historyModal.style.display = 'none';
        } else if (elements.aiSettingsModal.style.display === 'flex') {
          elements.aiSettingsModal.style.display = 'none';
        }
      }
    });
  }

  /**
   * App Initialization
   */
  function init() {
    loadHistory();
    setDuration(120, false);
    updateSuggestions('python');
    updateAiStatusIndicator();
    initEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
