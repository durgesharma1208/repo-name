// ============================================
// ZENFLOW v2.0 — Complete Application Script
// All 12 changes incorporated
// ============================================

(function ZENFLOW() {
  'use strict';

  // ========== STORAGE KEYS ==========
  const KEYS = {
    TASKS: 'zf_tasks',
    PROJECTS: 'zf_projects',
    HABITS: 'zf_habits',
    USER: 'zf_user',
    SETTINGS: 'zf_settings',
    ACHIEVEMENTS: 'zf_achievements',
    FOCUS: 'zf_focus',
    ONBOARDING: 'zf_onboarding',
    STREAK: 'zf_streak',
    STATS: 'zf_stats',
    CUSTOM_REWARDS: 'zf_custom_rewards',
    TAGS: 'zf_tags',
    BACKGROUND: 'zf_background',
    LAST_OPEN: 'zf_last_open',
    FILTERS: 'zf_filters',
    COMPLETION_HISTORY: 'zf_completion_history'
  };

  // ========== DEFAULTS ==========
  const DEF_USER = {
    name: 'Adventurer', avatar: '', class: 'warrior',
    level: 1, xp: 0, xpToNext: 100,
    hp: 100, maxHp: 100, gold: 0,
    totalGold: 0, totalXp: 0, pet: null, petName: ''
  };
  const DEF_SETTINGS = { theme: 'dark', soundEnabled: true, sidebarCollapsed: false };
  const DEF_STREAK = { current: 0, longest: 0, lastActiveDate: null };
  const DEF_STATS = {
    tasksCompletedToday: 0, tasksCompletedThisWeek: 0,
    totalTasksCompleted: 0, focusTimeToday: 0, totalFocusTime: 0,
    lastResetDate: null, dailyCompletions: {}, dailyFocus: {}
  };
  const DEF_FOCUS = { workDuration: 25, breakDuration: 5, sessionsToday: 0, totalSessions: 0, lastSessionDate: null };
  const DEF_ACHIEVEMENTS = {
    'tasks-1': false, 'tasks-10': false, 'tasks-50': false, 'tasks-100': false,
    'streak-3': false, 'streak-7': false, 'streak-30': false,
    'focus-1h': false, 'focus-10h': false,
    'pet-level5': false, 'pet-level10': false, 'pet-level20': false
  };
  // Change 5: completed filter enabled by default
  const DEF_FILTERS = {
    status: ['pending', 'completed', 'overdue'],
    priority: ['p1', 'p2', 'p3', 'p4'],
    project: 'all', tag: 'all'
  };

  const PETS = { 5: { icon: '🐣', name: 'Chick' }, 10: { icon: '🐉', name: 'Dragon' }, 20: { icon: '🦊', name: 'Fox' } };
  const XP_MAP = { easy: 5, medium: 10, hard: 20 };
  const GOLD_MAP = { easy: 2, medium: 5, hard: 10 };
  // Change 1: undo penalty map
  const UNDO_PENALTY = { easy: 3, medium: 5, hard: 10 };

  const QUOTES = [
    { t: 'The secret of getting ahead is getting started.', a: 'Mark Twain' },
    { t: 'Focus on being productive instead of busy.', a: 'Tim Ferriss' },
    { t: 'The way to get started is to quit talking and begin doing.', a: 'Walt Disney' },
    { t: 'Start where you are. Use what you have. Do what you can.', a: 'Arthur Ashe' },
    { t: 'Your future is created by what you do today, not tomorrow.', a: 'Robert Kiyosaki' },
    { t: 'Small daily improvements over time lead to stunning results.', a: 'Robin Sharma' },
    { t: 'Done is better than perfect.', a: 'Sheryl Sandberg' },
    { t: 'Discipline is the bridge between goals and accomplishment.', a: 'Jim Rohn' },
    { t: "Don't watch the clock; do what it does. Keep going.", a: 'Sam Levenson' },
    { t: 'What you do today can improve all your tomorrows.', a: 'Ralph Marston' },
    { t: 'Success is the sum of small efforts, repeated day in and day out.', a: 'Robert Collier' },
    { t: 'Action is the foundational key to all success.', a: 'Pablo Picasso' },
    { t: 'Productivity is never an accident.', a: 'Paul J. Meyer' },
    { t: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", a: 'Stephen King' }
  ];

  // Change 6: background presets
  const BG_PRESETS = {
    none: '',
    'gradient-1': 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    'gradient-2': 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
    'gradient-3': 'linear-gradient(135deg,#0d1117,#161b22,#21262d)',
    'gradient-4': 'linear-gradient(135deg,#1b1b2f,#162447,#1f4068)',
    'gradient-5': 'linear-gradient(135deg,#2d1b69,#11998e)',
    'gradient-6': 'linear-gradient(135deg,#0f0f1a,#2d132c,#801336)'
  };

  // Change 9: default rewards
  const DEFAULT_REWARDS = [
    { id: 'r1', emoji: '☕', name: 'Coffee Break', desc: 'Take a guilt-free 15-min break', cost: 10 },
    { id: 'r2', emoji: '🍫', name: 'Snack Time', desc: 'Enjoy your favorite snack', cost: 20 },
    { id: 'r3', emoji: '🎮', name: 'Game Time', desc: '30 min of guilt-free gaming', cost: 50 },
    { id: 'r4', emoji: '🎬', name: 'Movie Night', desc: 'Watch a movie or TV episode', cost: 75 },
    { id: 'r5', emoji: '🏖️', name: 'Day Off', desc: 'A full day of rest', cost: 200 }
  ];

  // ========== STATE ==========
  const S = {
    tasks: [], projects: [], habits: [], tags: [],
    user: { ...DEF_USER }, settings: { ...DEF_SETTINGS },
    achievements: { ...DEF_ACHIEVEMENTS }, focus: { ...DEF_FOCUS },
    streak: { ...DEF_STREAK }, stats: { ...DEF_STATS },
    customRewards: [], completionHistory: {},
    filters: { ...DEF_FILTERS },
    onboarded: false,
    currentView: 'inbox', currentProjectId: null,
    editingTaskId: null, editingProjectId: null, editingHabitId: null, editingTagId: null,
    selectedCalendarDate: null,
    calMonth: new Date().getMonth(), calYear: new Date().getFullYear(),
    habitCalMonth: new Date().getMonth(), habitCalYear: new Date().getFullYear(),
    selectedHabitId: null,
    timerInterval: null, timerRunning: false,
    timerSeconds: 25 * 60, timerMode: 'work',
    currentSort: 'default', searchQuery: '',
    background: 'none', bgCustomUrl: '',
    draggedTaskId: null
  };

  // ========== HELPERS ==========
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  const today = () => new Date().toISOString().split('T')[0];
  const sod = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const sameDay = (a, b) => a && b && new Date(a).toDateString() === new Date(b).toDateString();
  const isToday = d => d && sameDay(d, new Date());
  const isTomorrow = d => { if (!d) return false; const t = new Date(); t.setDate(t.getDate() + 1); return sameDay(d, t); };
  const isOverdue = d => d && sod(d) < sod(new Date());
  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

  function fmtDate(d, o) {
    if (!d) return '';
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', ...o });
  }
  function fmtTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  function fmtMinutes(m) {
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
  }
  function setText(id, v) { const e = $(id); if (e) e.textContent = v; }
  function toggleEl(id, show) { const e = $(id); if (e) e.hidden = !show; }

  // ========== DATA I/O ==========
  function save(k, d) { try { localStorage.setItem(k, JSON.stringify(d)); } catch (e) { /* noop */ } }
  function load(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }

  function loadAll() {
    S.tasks = load(KEYS.TASKS) || [];
    S.projects = load(KEYS.PROJECTS) || [];
    S.habits = load(KEYS.HABITS) || [];
    S.tags = load(KEYS.TAGS) || [];
    S.user = { ...DEF_USER, ...(load(KEYS.USER) || {}) };
    S.settings = { ...DEF_SETTINGS, ...(load(KEYS.SETTINGS) || {}) };
    S.achievements = { ...DEF_ACHIEVEMENTS, ...(load(KEYS.ACHIEVEMENTS) || {}) };
    S.focus = { ...DEF_FOCUS, ...(load(KEYS.FOCUS) || {}) };
    S.streak = { ...DEF_STREAK, ...(load(KEYS.STREAK) || {}) };
    S.stats = { ...DEF_STATS, ...(load(KEYS.STATS) || {}) };
    S.customRewards = load(KEYS.CUSTOM_REWARDS) || [];
    S.completionHistory = load(KEYS.COMPLETION_HISTORY) || {};
    S.filters = { ...DEF_FILTERS, ...(load(KEYS.FILTERS) || {}) };
    S.onboarded = localStorage.getItem(KEYS.ONBOARDING) === 'true';
    S.background = load(KEYS.BACKGROUND) || 'none';
    S.timerSeconds = S.focus.workDuration * 60;
  }

  function saveAll() {
    save(KEYS.TASKS, S.tasks); save(KEYS.PROJECTS, S.projects);
    save(KEYS.HABITS, S.habits); save(KEYS.TAGS, S.tags);
    save(KEYS.USER, S.user); save(KEYS.SETTINGS, S.settings);
    save(KEYS.ACHIEVEMENTS, S.achievements); save(KEYS.FOCUS, S.focus);
    save(KEYS.STREAK, S.streak); save(KEYS.STATS, S.stats);
    save(KEYS.CUSTOM_REWARDS, S.customRewards);
    save(KEYS.COMPLETION_HISTORY, S.completionHistory);
    save(KEYS.FILTERS, S.filters);
  }

  // ========== DAILY RESET ==========
  function dailyReset() {
    const t = today();
    if (S.stats.lastResetDate !== t) {
      S.stats.tasksCompletedToday = 0;
      S.stats.focusTimeToday = 0;
      S.stats.lastResetDate = t;
      save(KEYS.STATS, S.stats);
    }
    if (S.focus.lastSessionDate !== t) {
      S.focus.sessionsToday = 0;
      S.focus.lastSessionDate = t;
      save(KEYS.FOCUS, S.focus);
    }
    // Weekly reset on Monday
    if (new Date().getDay() === 1) {
      if (!S.stats._weekReset || S.stats._weekReset !== t) {
        S.stats.tasksCompletedThisWeek = 0;
        S.stats._weekReset = t;
        save(KEYS.STATS, S.stats);
      }
    }
    overdueHPPenalty();
    // Change 10: generate recurring tasks
    generateRecurringTasks();
  }

  function overdueHPPenalty() {
    const t = today();
    if (S.user._lastODCheck === t) return;
    const od = S.tasks.filter(x => !x.completed && x.dueDate && isOverdue(x.dueDate));
    if (od.length) {
      const pen = Math.min(od.length * 5, 50);
      S.user.hp = Math.max(0, S.user.hp - pen);
      notify(`⚠️ Lost ${pen} HP from ${od.length} overdue task${od.length > 1 ? 's' : ''}!`, 'warning');
    }
    S.user._lastODCheck = t;
    save(KEYS.USER, S.user);
  }

  // Change 10: Recurring task generation
  function generateRecurringTasks() {
    const t = today();
    S.tasks.forEach(task => {
      if (!task.frequency || task.frequency === 'none' || !task.completed) return;
      if (task._lastRecur === t) return;
      let nextDate = null;
      const completedDate = task.completedAt ? task.completedAt.split('T')[0] : t;
      if (task.frequency === 'daily') {
        nextDate = addDays(completedDate, 1);
      } else if (task.frequency === 'weekly') {
        nextDate = addDays(completedDate, 7);
      } else if (task.frequency === 'custom' && task.customFreqDays) {
        nextDate = addDays(completedDate, task.customFreqDays);
      }
      if (nextDate && nextDate <= t) {
        // Create a new instance
        const newTask = {
          ...task, id: uid(), completed: false, completedAt: null,
          dueDate: nextDate, createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(), _lastRecur: null
        };
        S.tasks.push(newTask);
        task._lastRecur = t;
      }
    });
    save(KEYS.TASKS, S.tasks);
  }

  function addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  }

  // ========== STREAK ==========
  function updateStreak() {
    const t = today();
    if (S.streak.lastActiveDate === t) return;
    const y = addDays(t, -1);
    S.streak.current = S.streak.lastActiveDate === y ? S.streak.current + 1 : 1;
    if (S.streak.current > S.streak.longest) S.streak.longest = S.streak.current;
    S.streak.lastActiveDate = t;
    save(KEYS.STREAK, S.streak);
    checkStreakAch();
    renderProfile();
    renderFooter();
  }

  // ========== SOUND ==========
  let audioCtx = null;
  function getAC() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
  function playSound(type) {
    if (!S.settings.soundEnabled) return;
    try {
      const c = getAC(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      const t = c.currentTime;
      switch (type) {
        case 'complete':
          o.frequency.setValueAtTime(523, t); o.frequency.setValueAtTime(659, t + .1); o.frequency.setValueAtTime(784, t + .2);
          g.gain.setValueAtTime(.15, t); g.gain.exponentialRampToValueAtTime(.01, t + .4);
          o.start(t); o.stop(t + .4); break;
        case 'add':
          o.frequency.setValueAtTime(440, t); o.frequency.setValueAtTime(554, t + .05);
          g.gain.setValueAtTime(.1, t); g.gain.exponentialRampToValueAtTime(.01, t + .15);
          o.start(t); o.stop(t + .15); break;
        case 'delete':
          o.frequency.setValueAtTime(330, t); o.frequency.setValueAtTime(220, t + .1);
          g.gain.setValueAtTime(.1, t); g.gain.exponentialRampToValueAtTime(.01, t + .2);
          o.start(t); o.stop(t + .2); break;
        case 'levelUp':
          o.type = 'triangle';
          [523, 659, 784, 1047].forEach((f, i) => o.frequency.setValueAtTime(f, t + i * .15));
          g.gain.setValueAtTime(.15, t); g.gain.exponentialRampToValueAtTime(.01, t + .7);
          o.start(t); o.stop(t + .7); break;
        case 'timerEnd':
          o.type = 'sine';
          for (let i = 0; i < 3; i++) { o.frequency.setValueAtTime(880, t + i * .3); g.gain.setValueAtTime(.15, t + i * .3); g.gain.exponentialRampToValueAtTime(.01, t + i * .3 + .2); }
          o.start(t); o.stop(t + 1); break;
        default:
          o.frequency.setValueAtTime(440, t); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.01, t + .1);
          o.start(t); o.stop(t + .1);
      }
    } catch (e) { /* noop */ }
  }

  // ========== CONFETTI ==========
  function confetti() {
    const cv = $('confetti-canvas'); if (!cv) return;
    const ctx = cv.getContext('2d');
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    const colors = ['#6C63FF', '#00D2FF', '#FF6B6B', '#00C851', '#FFB300', '#FF44CC'];
    const ps = [];
    for (let i = 0; i < 80; i++) ps.push({
      x: cv.width / 2 + (Math.random() - .5) * 200, y: cv.height / 2,
      vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 5,
      c: colors[Math.floor(Math.random() * colors.length)],
      s: Math.random() * 6 + 3, r: Math.random() * 360,
      rs: (Math.random() - .5) * 10, g: .3, o: 1
    });
    let f = 0;
    (function draw() {
      if (f >= 120) { ctx.clearRect(0, 0, cv.width, cv.height); return; }
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => {
        p.x += p.vx; p.vy += p.g; p.y += p.vy; p.r += p.rs; p.o = Math.max(0, 1 - f / 120);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r * Math.PI / 180);
        ctx.globalAlpha = p.o; ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6);
        ctx.restore();
      });
      f++; requestAnimationFrame(draw);
    })();
  }

  // ========== NOTIFICATIONS ==========
  function notify(msg, type = 'info') {
    const t = $('notification-toast'), m = $('notification-toast-message'), ic = $('notification-toast-icon');
    if (!t || !m) return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    if (ic) ic.textContent = icons[type] || 'ℹ️';
    m.textContent = msg; t.hidden = false;
    clearTimeout(t._to); t._to = setTimeout(() => t.hidden = true, 4000);
  }

  // Change 1: penalty toast
  function showPenalty(msg) {
    const t = $('penalty-toast'), m = $('penalty-toast-message');
    if (!t || !m) return;
    m.textContent = msg; t.hidden = false;
    clearTimeout(t._to); t._to = setTimeout(() => t.hidden = true, 4000);
  }

  // Change 4: reward toast
  function showRewardToast(msg) {
    const t = $('reward-toast'), m = $('reward-toast-message');
    if (!t || !m) return;
    m.textContent = msg; t.hidden = false;
    clearTimeout(t._to); t._to = setTimeout(() => t.hidden = true, 4000);
  }

  function announce(msg) { const e = $('sr-announcer'); if (e) { e.textContent = ''; setTimeout(() => e.textContent = msg, 100); } }

  // ========== NLP PARSING ==========
  function parseNLP(input) {
    const r = { title: input, dueDate: '', dueTime: '', tags: [], priority: 'p4' };
    let s = input;
    // Tags
    let m; const tr = /#(\w+)/g;
    while ((m = tr.exec(s)) !== null) r.tags.push(m[1]);
    s = s.replace(tr, '').trim();
    // Priority
    const pr = /\b(p[1-4])\b/i;
    if ((m = s.match(pr))) { r.priority = m[1].toLowerCase(); s = s.replace(pr, '').trim(); }
    // Time
    const tmr = /\b(\d{1,2})([:.](\d{2}))?\s*(am|pm)\b/i;
    if ((m = s.match(tmr))) {
      let h = parseInt(m[1]); const mn = m[3] ? parseInt(m[3]) : 0;
      if (m[4].toLowerCase() === 'pm' && h !== 12) h += 12;
      if (m[4].toLowerCase() === 'am' && h === 12) h = 0;
      r.dueTime = `${h.toString().padStart(2, '0')}:${mn.toString().padStart(2, '0')}`;
      s = s.replace(tmr, '').trim();
    }
    // Date keywords
    const now = new Date();
    const dk = { today: 0, tomorrow: 1, tmr: 1, tmrw: 1 };
    const dn = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const ds = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    let found = false;
    for (const [k, off] of Object.entries(dk)) {
      const re = new RegExp(`\\b${k}\\b`, 'i');
      if (re.test(s)) { const d = new Date(now); d.setDate(d.getDate() + off); r.dueDate = d.toISOString().split('T')[0]; s = s.replace(re, '').trim(); found = true; break; }
    }
    if (!found) {
      for (let i = 0; i < 7; i++) {
        for (const name of [dn[i], ds[i]]) {
          const re = new RegExp(`\\b${name}\\b`, 'i');
          if (re.test(s)) {
            let diff = i - now.getDay(); if (diff <= 0) diff += 7;
            const d = new Date(now); d.setDate(d.getDate() + diff);
            r.dueDate = d.toISOString().split('T')[0]; s = s.replace(re, '').trim(); found = true; break;
          }
        }
        if (found) break;
      }
    }
    if (!found) {
      const idr = /\bin\s+(\d+)\s+days?\b/i;
      if ((m = s.match(idr))) { const d = new Date(now); d.setDate(d.getDate() + parseInt(m[1])); r.dueDate = d.toISOString().split('T')[0]; s = s.replace(idr, '').trim(); }
    }
    s = s.replace(/\b(at|by|on|due|the)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
    r.title = s || input;
    return r;
  }

  // ========== TASK MANAGEMENT ==========
  function createTask(data) {
    const task = {
      id: uid(), title: data.title || 'Untitled', notes: data.notes || '',
      dueDate: data.dueDate || '', dueTime: data.dueTime || '',
      priority: data.priority || 'p4', project: data.project || '',
      tags: data.tags || [], subtasks: data.subtasks || [],
      difficulty: data.difficulty || 'easy', flagged: data.flagged || false,
      frequency: data.frequency || 'none', customFreqDays: data.customFreqDays || 0,
      completed: false, completedAt: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    S.tasks.unshift(task);
    save(KEYS.TASKS, S.tasks);
    updateBadges(); renderView();
    notify('Task created!', 'success'); playSound('add');
    return task;
  }

  function updateTask(id, u) {
    const i = S.tasks.findIndex(t => t.id === id);
    if (i < 0) return null;
    S.tasks[i] = { ...S.tasks[i], ...u, updatedAt: new Date().toISOString() };
    save(KEYS.TASKS, S.tasks); updateBadges(); renderView();
    return S.tasks[i];
  }

  function deleteTask(id) {
    S.tasks = S.tasks.filter(t => t.id !== id);
    save(KEYS.TASKS, S.tasks); updateBadges(); renderView();
    notify('Task deleted', 'info'); playSound('delete');
  }

  function completeTask(id) {
    const task = S.tasks.find(t => t.id === id);
    if (!task || task.completed) return;
    task.completed = true;
    task.completedAt = new Date().toISOString();
    const xp = XP_MAP[task.difficulty] || 5;
    const gold = GOLD_MAP[task.difficulty] || 2;
    addXP(xp); addGold(gold);
    S.stats.tasksCompletedToday++; S.stats.tasksCompletedThisWeek++;
    S.stats.totalTasksCompleted++;
    const t = today();
    S.stats.dailyCompletions[t] = (S.stats.dailyCompletions[t] || 0) + 1;
    // Change 10: completion history
    if (!S.completionHistory[t]) S.completionHistory[t] = [];
    S.completionHistory[t].push({ taskId: id, title: task.title, time: new Date().toISOString() });
    save(KEYS.TASKS, S.tasks); save(KEYS.STATS, S.stats); save(KEYS.COMPLETION_HISTORY, S.completionHistory);
    updateStreak(); checkTaskAch();
    playSound('complete'); confetti();
    // Change 3: instant re-render
    updateBadges(); renderView(); renderProfile(); renderFooter();
    notify(`+${xp} XP, +${gold} Gold! 🎉`, 'success');
  }

  // Change 1: Undo with penalty
  function uncompleteTask(id) {
    const task = S.tasks.find(t => t.id === id);
    if (!task || !task.completed) return;
    task.completed = false; task.completedAt = null;
    const penalty = UNDO_PENALTY[task.difficulty] || 3;
    S.user.gold = Math.max(0, S.user.gold - penalty);
    save(KEYS.USER, S.user);
    S.stats.tasksCompletedToday = Math.max(0, S.stats.tasksCompletedToday - 1);
    S.stats.tasksCompletedThisWeek = Math.max(0, S.stats.tasksCompletedThisWeek - 1);
    S.stats.totalTasksCompleted = Math.max(0, S.stats.totalTasksCompleted - 1);
    const t = today();
    if (S.stats.dailyCompletions[t]) S.stats.dailyCompletions[t] = Math.max(0, S.stats.dailyCompletions[t] - 1);
    save(KEYS.TASKS, S.tasks); save(KEYS.STATS, S.stats);
    updateBadges(); renderView(); renderProfile(); renderFooter();
    showPenalty(`-${penalty} Gold for undoing task`);
    // Animate gold counter
    const gc = $('sidebar-gold');
    if (gc) { gc.classList.add('gold-deduct'); setTimeout(() => gc.classList.remove('gold-deduct'), 600); }
  }

  function toggleSubtask(taskId, idx) {
    const task = S.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks[idx]) return;
    task.subtasks[idx].completed = !task.subtasks[idx].completed;
    save(KEYS.TASKS, S.tasks); renderView();
  }

  function taskState(t) { return t.completed ? 'completed' : (t.dueDate && isOverdue(t.dueDate) ? 'overdue' : 'pending'); }

  function filteredTasks(tasks) {
    let f = tasks || [...S.tasks];
    if (S.searchQuery) {
      const q = S.searchQuery.toLowerCase();
      f = f.filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)) || (t.tags && t.tags.some(tg => tg.toLowerCase().includes(q))));
    }
    f = f.filter(t => S.filters.status.includes(taskState(t)));
    f = f.filter(t => S.filters.priority.includes(t.priority));
    if (S.filters.project !== 'all') f = f.filter(t => t.project === S.filters.project);
    if (S.filters.tag !== 'all') f = f.filter(t => t.tags && t.tags.includes(S.filters.tag));
    return sortTasks(f);
  }

  function sortTasks(tasks) {
    const s = [...tasks];
    switch (S.currentSort) {
      case 'priority': s.sort((a, b) => parseInt(a.priority[1]) - parseInt(b.priority[1])); break;
      case 'due-date': s.sort((a, b) => { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate) - new Date(b.dueDate); }); break;
      case 'title': s.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'difficulty': { const o = { hard: 0, medium: 1, easy: 2 }; s.sort((a, b) => (o[a.difficulty] || 2) - (o[b.difficulty] || 2)); } break;
      default: s.sort((a, b) => { if (a.completed !== b.completed) return a.completed ? 1 : -1; return new Date(b.createdAt) - new Date(a.createdAt); });
    }
    return s;
  }

  function updateBadges() {
    const ic = S.tasks.filter(t => !t.completed && !t.project).length;
    const tc = S.tasks.filter(t => !t.completed && t.dueDate && isToday(t.dueDate)).length;
    const ib = $('nav-badge-inbox'), tb = $('nav-badge-today');
    if (ib) { ib.textContent = ic; ib.hidden = !ic; }
    if (tb) { tb.textContent = tc; tb.hidden = !tc; }
  }

  function renderTaskItem(t) {
    const st = taskState(t);
    const proj = t.project ? S.projects.find(p => p.id === t.project) : null;
    let cls = 'task-item'; if (t.completed) cls += ' completed'; if (st === 'overdue') cls += ' overdue'; if (t.flagged) cls += ' flagged';
    let meta = '';
    if (t.dueDate) {
      const dc = st === 'overdue' ? 'task-meta-item--overdue' : '';
      let dt = fmtDate(t.dueDate); if (t.dueTime) dt += ' ' + fmtTime(t.dueTime);
      meta += `<span class="task-meta-item ${dc}">${st === 'overdue' ? '⚠️' : '📅'} ${dt}</span>`;
    }
    if (proj) meta += `<span class="task-meta-item"><span class="task-project-dot" style="background:${proj.color}"></span>${proj.emoji || ''} ${proj.name}</span>`;
    if (t.tags && t.tags.length) t.tags.forEach(tg => meta += `<span class="task-tag">#${esc(tg)}</span>`);
    const sc = t.subtasks ? t.subtasks.filter(s => s.completed).length : 0;
    const st2 = t.subtasks ? t.subtasks.length : 0;
    if (st2) meta += `<span class="task-meta-item">☑ ${sc}/${st2}</span>`;
    if (t.frequency && t.frequency !== 'none') meta += `<span class="task-meta-item">🔁 ${t.frequency}</span>`;
    const di = { easy: '🟢', medium: '🟡', hard: '🔴' };
    meta += `<span class="task-meta-item">${di[t.difficulty] || '🟢'} ${t.difficulty}</span>`;
    return `<li class="${cls}" data-task-id="${t.id}" draggable="true">
      <button class="task-checkbox ${t.completed ? 'checked' : ''}" data-priority="${t.priority}" data-action="toggle-task" data-task-id="${t.id}" aria-label="${t.completed ? 'Uncomplete' : 'Complete'} task"></button>
      <div class="task-content" data-action="view-task" data-task-id="${t.id}">
        <span class="task-title">${esc(t.title)}</span>
        ${meta ? `<div class="task-meta">${meta}</div>` : ''}
      </div>
    </li>`;
  }

  // ========== VIEW SWITCHING ==========
  function switchView(v) {
    $$('.view').forEach(el => el.hidden = true);
    const tgt = $(`view-${v}`); if (tgt) tgt.hidden = false;
    $$('.nav-link').forEach(l => { l.classList.toggle('active', l.dataset.view === v); l.toggleAttribute('aria-current', l.dataset.view === v); });
    $$('.mobile-nav-btn[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    const icons = { inbox: '📥', today: '☀️', upcoming: '📅', projects: '📁', habits: '🔄', focus: '🎯', calendar: '🗓️', statistics: '📊', achievements: '🏆', rewards: '🎁', settings: '⚙️', 'project-detail': '📁' };
    const titles = { inbox: 'Inbox', today: 'Today', upcoming: 'Upcoming', projects: 'Projects', habits: 'Habit Tracker', focus: 'Focus Timer', calendar: 'Calendar', statistics: 'Statistics', achievements: 'Achievements', rewards: 'Rewards Shop', settings: 'Settings', 'project-detail': 'Project' };
    setText('topbar-icon', icons[v] || '📥'); setText('topbar-title', titles[v] || v);
    S.currentView = v;
    renderView();
    closeMobileSidebar();
    announce(`Navigated to ${titles[v] || v}`);
  }

  function renderView() {
    switch (S.currentView) {
      case 'inbox': renderInbox(); break;
      case 'today': renderToday(); break;
      case 'upcoming': renderUpcoming(); break;
      case 'projects': renderProjects(); break;
      case 'project-detail': renderProjectDetail(); break;
      case 'habits': renderHabits(); break;
      case 'focus': renderFocus(); break;
      case 'calendar': renderCalendar(); break;
      case 'statistics': renderStats(); break;
      case 'achievements': renderAchievements(); break;
      case 'rewards': renderRewards(); break;
      case 'settings': renderSettings(); break;
    }
  }

  // ========== INBOX ==========
  function renderInbox() {
    const pending = filteredTasks(S.tasks.filter(t => !t.completed));
    const completed = S.tasks.filter(t => t.completed);
    const tl = $('inbox-task-list'); if (tl) tl.innerHTML = pending.map(renderTaskItem).join('');
    setText('inbox-task-count', `${pending.length} task${pending.length !== 1 ? 's' : ''}`);
    toggleEl('inbox-empty', !pending.length);
    toggleEl('inbox-completed-section', completed.length > 0);
    setText('inbox-completed-count', completed.length);
    const cl = $('inbox-completed-list');
    if (cl && !cl.hidden) cl.innerHTML = completed.map(renderTaskItem).join('');
  }

  // ========== TODAY ==========
  function renderToday() {
    const h = new Date().getHours();
    setText('today-greeting', h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,');
    setText('today-greeting-name', S.user.name);
    setText('today-date', new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    setText('today-streak-count', S.streak.current);
    const all = S.tasks.filter(t => t.dueDate && isToday(t.dueDate));
    const pend = all.filter(t => !t.completed);
    const comp = all.filter(t => t.completed);
    const total = all.length, done = comp.length;
    // Progress ring
    const ring = $('today-progress-ring');
    if (ring) {
      const circ = 2 * Math.PI * 52;
      ring.style.strokeDasharray = circ;
      ring.style.strokeDashoffset = circ - (total > 0 ? done / total : 0) * circ;
    }
    setText('today-progress-value', done);
    // Quote
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
    const q = QUOTES[day % QUOTES.length];
    setText('quote-text', `"${q.t}"`); setText('quote-author', `— ${q.a}`);
    // Time groups
    const getPeriod = t => { if (!t.dueTime) return 'morning'; const hr = parseInt(t.dueTime.split(':')[0]); return hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening'; };
    const m = pend.filter(t => getPeriod(t) === 'morning');
    const a = pend.filter(t => getPeriod(t) === 'afternoon');
    const ev = pend.filter(t => getPeriod(t) === 'evening');
    rlInto('today-morning-list', m); rlInto('today-afternoon-list', a); rlInto('today-evening-list', ev);
    toggleEl('today-morning-empty', !m.length); toggleEl('today-afternoon-empty', !a.length); toggleEl('today-evening-empty', !ev.length);
    // Change 3: instant completed section
    toggleEl('today-completed-section', comp.length > 0);
    setText('today-completed-count', comp.length);
    const cl = $('today-completed-list');
    if (cl && !cl.hidden) cl.innerHTML = comp.map(renderTaskItem).join('');
  }

  function rlInto(id, tasks) { const e = $(id); if (e) e.innerHTML = tasks.map(renderTaskItem).join(''); }

  // ========== UPCOMING ==========
  function renderUpcoming() {
    const pend = S.tasks.filter(t => !t.completed);
    const od = pend.filter(t => t.dueDate && isOverdue(t.dueDate));
    toggleEl('upcoming-overdue-group', od.length > 0);
    rlInto('upcoming-overdue-list', od);
    const upcoming = pend.filter(t => t.dueDate && !isOverdue(t.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const groups = {};
    upcoming.forEach(t => { if (!groups[t.dueDate]) groups[t.dueDate] = []; groups[t.dueDate].push(t); });
    const c = $('upcoming-groups-container');
    if (c) c.innerHTML = Object.entries(groups).map(([d, ts]) => `<div class="upcoming-group"><h3 class="upcoming-group-title">${fmtDate(d, { weekday: 'long', month: 'long', day: 'numeric' })}</h3><ul class="task-list" role="list">${ts.map(renderTaskItem).join('')}</ul></div>`).join('');
    const nd = pend.filter(t => !t.dueDate);
    toggleEl('upcoming-no-date-group', nd.length > 0);
    rlInto('upcoming-no-date-list', nd);
    toggleEl('upcoming-empty', !od.length && !upcoming.length && !nd.length);
  }

  // ========== PROJECTS ==========
  function createProject(d) {
    const p = { id: uid(), name: d.name || 'Untitled', emoji: d.emoji || '📁', color: d.color || '#6C63FF', dueDate: d.dueDate || '', createdAt: new Date().toISOString() };
    S.projects.push(p); save(KEYS.PROJECTS, S.projects);
    renderSidebarProjects(); renderView(); notify('Project created!', 'success');
    return p;
  }
  function updateProject(id, u) {
    const i = S.projects.findIndex(p => p.id === id); if (i < 0) return;
    S.projects[i] = { ...S.projects[i], ...u }; save(KEYS.PROJECTS, S.projects);
    renderSidebarProjects(); renderView();
  }
  function deleteProject(id) {
    S.tasks.forEach(t => { if (t.project === id) t.project = ''; });
    S.projects = S.projects.filter(p => p.id !== id);
    save(KEYS.PROJECTS, S.projects); save(KEYS.TASKS, S.tasks);
    renderSidebarProjects();
    if (S.currentView === 'project-detail' && S.currentProjectId === id) switchView('projects');
    else renderView();
    notify('Project deleted', 'info');
  }
  function projProgress(id) { const ts = S.tasks.filter(t => t.project === id); const c = ts.filter(t => t.completed).length; return { total: ts.length, done: c, pct: ts.length ? Math.round(c / ts.length * 100) : 0 }; }
  function renderProjects() {
    const g = $('projects-grid'); if (!g) return;
    if (!S.projects.length) { g.innerHTML = ''; toggleEl('projects-empty', true); return; }
    toggleEl('projects-empty', false);
    g.innerHTML = S.projects.map(p => {
      const pr = projProgress(p.id);
      return `<div class="project-card" role="listitem" data-project-id="${p.id}" style="--project-color:${p.color}">
        <div class="project-card-header"><span class="project-card-emoji">${p.emoji}</span><h3 class="project-card-name">${esc(p.name)}</h3></div>
        <p class="project-card-meta">${pr.total} task${pr.total !== 1 ? 's' : ''} • ${pr.pct}%${p.dueDate ? ' • Due ' + fmtDate(p.dueDate) : ''}</p>
        <div class="project-card-progress"><div class="progress-bar"><div class="progress-bar-fill" style="width:${pr.pct}%"></div></div></div></div>`;
    }).join('');
  }
  function renderProjectDetail() {
    const p = S.projects.find(x => x.id === S.currentProjectId);
    if (!p) { switchView('projects'); return; }
    const pr = projProgress(p.id);
    setText('project-detail-emoji', p.emoji); setText('project-detail-title', p.name);
    setText('topbar-title', p.name);
    setText('project-detail-progress-text', `${pr.done} of ${pr.total} tasks completed`);
    const fill = $('project-detail-progress-fill'); if (fill) fill.style.width = `${pr.pct}%`;
    setText('project-detail-due-date', p.dueDate ? `Due ${fmtDate(p.dueDate)}` : '');
    const pt = S.tasks.filter(t => t.project === p.id);
    rlInto('project-detail-task-list', sortTasks(pt.filter(t => !t.completed)));
    toggleEl('project-detail-empty', !pt.length);
    const ct = pt.filter(t => t.completed);
    toggleEl('project-detail-completed-section', ct.length > 0);
    setText('project-detail-completed-count', ct.length);
    const cl = $('project-detail-completed-list');
    if (cl && !cl.hidden) cl.innerHTML = ct.map(renderTaskItem).join('');
  }
  function renderSidebarProjects() {
    const l = $('sidebar-projects-list');
    if (!l) return;
    toggleEl('sidebar-projects-empty', !S.projects.length);
    l.innerHTML = S.projects.map(p => `<li><button data-action="open-project" data-project-id="${p.id}"><span class="area-dot" style="--area-color:${p.color}"></span><span>${p.emoji} ${esc(p.name)}</span></button></li>`).join('');
  }

  // ========== TAGS (Change 7) ==========
  function createTag(d) {
    const t = { id: uid(), name: d.name, color: d.color || '#6C63FF', emoji: d.emoji || '🏷️' };
    S.tags.push(t); save(KEYS.TAGS, S.tags);
    renderSidebarTags(); notify('Tag created!', 'success');
    return t;
  }
  function updateTag(id, u) {
    const i = S.tags.findIndex(t => t.id === id); if (i < 0) return;
    const oldName = S.tags[i].name;
    S.tags[i] = { ...S.tags[i], ...u }; save(KEYS.TAGS, S.tags);
    // Update tasks that used old tag name
    if (u.name && u.name !== oldName) {
      S.tasks.forEach(t => { const idx = t.tags ? t.tags.indexOf(oldName) : -1; if (idx >= 0) t.tags[idx] = u.name; });
      save(KEYS.TASKS, S.tasks);
    }
    renderSidebarTags();
  }
  function deleteTag(id) {
    const tag = S.tags.find(t => t.id === id);
    if (tag) {
      S.tasks.forEach(t => { if (t.tags) t.tags = t.tags.filter(tg => tg !== tag.name); });
      save(KEYS.TASKS, S.tasks);
    }
    S.tags = S.tags.filter(t => t.id !== id); save(KEYS.TAGS, S.tags);
    renderSidebarTags(); notify('Tag deleted', 'info');
  }
  function renderSidebarTags() {
    const l = $('sidebar-tags-list');
    if (!l) return;
    toggleEl('sidebar-tags-empty', !S.tags.length);
    l.innerHTML = S.tags.map(t => `<li><button data-action="filter-tag" data-tag-name="${esc(t.name)}"><span class="tag-dot" style="background:${t.color}"></span><span>${t.emoji} ${esc(t.name)}</span></button></li>`).join('');
  }
  function renderTagModal() {
    const list = $('tag-manage-list');
    if (!list) return;
    toggleEl('tag-manage-empty', !S.tags.length);
    list.innerHTML = S.tags.map(t => `<div class="tag-manage-item" data-tag-id="${t.id}">
      <span class="tag-dot" style="background:${t.color}"></span>
      <span class="tag-manage-item-name">${t.emoji} ${esc(t.name)}</span>
      <div class="tag-manage-item-actions">
        <button class="btn btn--ghost btn--icon" data-action="edit-tag" data-tag-id="${t.id}" aria-label="Edit tag">✏️</button>
        <button class="btn btn--ghost btn--icon" data-action="delete-tag" data-tag-id="${t.id}" aria-label="Delete tag">🗑️</button>
      </div></div>`).join('');
  }

  // ========== HABITS ==========
  function createHabit(d) {
    const h = { id: uid(), name: d.name || 'New Habit', emoji: d.emoji || '✨', frequency: d.frequency || 'daily', customFreqDays: d.customFreqDays || 0, completions: {}, streak: 0, longestStreak: 0, createdAt: new Date().toISOString() };
    S.habits.push(h); save(KEYS.HABITS, S.habits); renderView(); notify('Habit created!', 'success');
  }
  function updateHabit(id, u) {
    const i = S.habits.findIndex(h => h.id === id); if (i < 0) return;
    S.habits[i] = { ...S.habits[i], ...u }; save(KEYS.HABITS, S.habits); renderView();
  }
  function deleteHabit(id) { S.habits = S.habits.filter(h => h.id !== id); save(KEYS.HABITS, S.habits); renderView(); notify('Habit deleted', 'info'); }
  function toggleHabit(id) {
    const h = S.habits.find(x => x.id === id); if (!h) return;
    const t = today();
    if (h.completions[t]) { delete h.completions[t]; }
    else { h.completions[t] = true; addXP(5); addGold(2); updateStreak(); playSound('complete'); notify('+5 XP for habit! 🔥', 'success'); }
    h.streak = calcHabitStreak(h);
    if (h.streak > h.longestStreak) h.longestStreak = h.streak;
    save(KEYS.HABITS, S.habits); renderView(); renderProfile();
  }
  function calcHabitStreak(h) {
    let s = 0; const d = new Date();
    if (!h.completions[d.toISOString().split('T')[0]]) d.setDate(d.getDate() - 1);
    while (h.completions[d.toISOString().split('T')[0]]) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }
  function renderHabits() {
    const l = $('habits-list'); if (!l) return;
    if (!S.habits.length) { l.innerHTML = ''; toggleEl('habits-empty', true); toggleEl('habit-calendar-section', false); return; }
    toggleEl('habits-empty', false);
    const t = today();
    l.innerHTML = S.habits.map(h => {
      const done = h.completions[t];
      return `<div class="habit-card ${done ? 'completed-today' : ''}" data-habit-id="${h.id}" role="listitem">
        <span class="habit-emoji">${h.emoji}</span>
        <div class="habit-info"><h3 class="habit-name">${esc(h.name)}</h3>
        <div class="habit-streak">🔥 ${h.streak} day streak</div>
        <div class="habit-frequency">🔁 ${h.frequency}${h.frequency === 'custom' ? ` (${h.customFreqDays}d)` : ''}</div></div>
        <div class="habit-actions"><button class="btn btn--ghost btn--icon" data-action="edit-habit" data-habit-id="${h.id}" aria-label="Edit habit">✏️</button></div>
        <button class="habit-check-btn ${done ? 'checked' : ''}" data-action="toggle-habit" data-habit-id="${h.id}" aria-label="${done ? 'Uncomplete' : 'Complete'}">${done ? '✓' : ''}</button></div>`;
    }).join('');
    toggleEl('habit-calendar-section', true);
    const sel = S.selectedHabitId ? S.habits.find(h => h.id === S.selectedHabitId) : S.habits[0];
    if (sel) { S.selectedHabitId = sel.id; renderHabitCal(sel); }
  }
  function renderHabitCal(h) {
    const me = $('habit-calendar-month'), g = $('habit-calendar-grid'); if (!g || !h) return;
    const y = S.habitCalYear, m = S.habitCalMonth;
    if (me) me.textContent = new Date(y, m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let sd = new Date(y, m, 1).getDay(); sd = sd === 0 ? 6 : sd - 1;
    const dim = new Date(y, m + 1, 0).getDate();
    const now = new Date();
    let html = '<div class="habit-calendar-day-header">Mo</div><div class="habit-calendar-day-header">Tu</div><div class="habit-calendar-day-header">We</div><div class="habit-calendar-day-header">Th</div><div class="habit-calendar-day-header">Fr</div><div class="habit-calendar-day-header">Sa</div><div class="habit-calendar-day-header">Su</div>';
    for (let i = 0; i < sd; i++) html += '<div class="habit-calendar-day empty"></div>';
    for (let d = 1; d <= dim; d++) {
      const dt = new Date(y, m, d), ds = dt.toISOString().split('T')[0];
      const done = h.completions[ds], cur = dt.toDateString() === now.toDateString();
      const past = dt < sod(now), missed = past && !done && dt >= new Date(h.createdAt);
      let cls = 'habit-calendar-day'; if (cur) cls += ' current'; if (done) cls += ' completed'; if (missed) cls += ' missed';
      html += `<div class="${cls}" data-date="${ds}">${d}</div>`;
    }
    g.innerHTML = html;
  }

  // ========== FOCUS TIMER ==========
  function renderFocus() {
    const wi = $('focus-work-duration'), bi = $('focus-break-duration');
    if (wi) wi.value = S.focus.workDuration; if (bi) bi.value = S.focus.breakDuration;
    setText('focus-sessions-count', S.focus.sessionsToday);
    setText('focus-total-time', fmtMinutes(S.focus.sessionsToday * S.focus.workDuration));
    const dc = $('focus-sessions-dots');
    if (dc) { let h = ''; for (let i = 0; i < Math.max(S.focus.sessionsToday, 8); i++) h += `<span class="focus-session-dot ${i < S.focus.sessionsToday ? 'completed' : ''}"></span>`; dc.innerHTML = h; }
    const sel = $('focus-task-select');
    if (sel) { const cv = sel.value; sel.innerHTML = '<option value="">— No task selected —</option>' + S.tasks.filter(t => !t.completed).map(t => `<option value="${t.id}" ${t.id === cv ? 'selected' : ''}>${esc(t.title)}</option>`).join(''); }
    updateTimerUI();
  }
  function updateTimerUI() {
    const m = Math.floor(S.timerSeconds / 60), s = S.timerSeconds % 60;
    setText('focus-timer-time', `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    setText('focus-timer-label', S.timerMode === 'work' ? 'Focus' : 'Break');
    const rf = $('focus-ring-fill');
    if (rf) {
      const total = S.timerMode === 'work' ? S.focus.workDuration * 60 : S.focus.breakDuration * 60;
      const p = 1 - S.timerSeconds / total, c = 2 * Math.PI * 120;
      rf.style.strokeDasharray = c; rf.style.strokeDashoffset = c * (1 - p);
      rf.classList.toggle('break', S.timerMode === 'break');
    }
    const sb = $('focus-start-btn');
    if (sb) {
      sb.classList.toggle('running', S.timerRunning);
      sb.querySelector('[aria-hidden]').textContent = S.timerRunning ? '⏸' : '▶';
    }
  }
  function toggleTimer() { S.timerRunning ? pauseTimer() : startTimer(); }
  function startTimer() {
    if (S.timerRunning) return; S.timerRunning = true; playSound('add');
    S.timerInterval = setInterval(() => { S.timerSeconds--; if (S.timerSeconds <= 0) timerDone(); updateTimerUI(); }, 1000);
    updateTimerUI();
  }
  function pauseTimer() { S.timerRunning = false; clearInterval(S.timerInterval); S.timerInterval = null; updateTimerUI(); }
  function resetTimer() { pauseTimer(); S.timerMode = 'work'; S.timerSeconds = S.focus.workDuration * 60; updateTimerUI(); }
  function skipTimer() {
    pauseTimer();
    if (S.timerMode === 'work') { S.timerMode = 'break'; S.timerSeconds = S.focus.breakDuration * 60; }
    else { S.timerMode = 'work'; S.timerSeconds = S.focus.workDuration * 60; }
    updateTimerUI();
  }
  function timerDone() {
    pauseTimer(); playSound('timerEnd');
    if (S.timerMode === 'work') {
      S.focus.sessionsToday++; S.focus.totalSessions++; S.focus.lastSessionDate = today();
      addXP(10); addGold(5);
      S.stats.focusTimeToday += S.focus.workDuration; S.stats.totalFocusTime += S.focus.workDuration;
      const t = today(); S.stats.dailyFocus = S.stats.dailyFocus || {};
      S.stats.dailyFocus[t] = (S.stats.dailyFocus[t] || 0) + S.focus.workDuration;
      save(KEYS.FOCUS, S.focus); save(KEYS.STATS, S.stats);
      checkFocusAch(); updateStreak();
      notify('Focus session complete! +10 XP 🎯', 'success'); confetti();
      S.timerMode = 'break'; S.timerSeconds = S.focus.breakDuration * 60;
    } else {
      notify('Break over! Ready to focus? 💪', 'info');
      S.timerMode = 'work'; S.timerSeconds = S.focus.workDuration * 60;
    }
    renderFocus(); renderProfile(); renderFooter();
  }

  // ========== CALENDAR (Change 10: merged habits + heatmap) ==========
  function renderCalendar() {
    const me = $('calendar-current-month'), g = $('calendar-grid'); if (!g) return;
    const y = S.calYear, m = S.calMonth, now = new Date();
    if (me) me.textContent = new Date(y, m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let sd = new Date(y, m, 1).getDay(); sd = sd === 0 ? 6 : sd - 1;
    const dim = new Date(y, m + 1, 0).getDate();
    const pdim = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = sd - 1; i >= 0; i--) cells.push({ day: pdim - i, date: new Date(y, m - 1, pdim - i), om: true });
    for (let d = 1; d <= dim; d++) cells.push({ day: d, date: new Date(y, m, d), om: false });
    const rem = 42 - cells.length;
    for (let i = 1; i <= rem; i++) cells.push({ day: i, date: new Date(y, m + 1, i), om: true });

    g.innerHTML = cells.map(c => {
      const ds = c.date.toISOString().split('T')[0];
      const isCur = c.date.toDateString() === now.toDateString();
      const isSel = S.selectedCalendarDate === ds;
      const tasks = S.tasks.filter(t => t.dueDate === ds);
      const pendTasks = tasks.filter(t => !t.completed);
      const compTasks = tasks.filter(t => t.completed);
      const hasOverdue = pendTasks.some(t => isOverdue(t.dueDate));
      // Change 10: habits for this date
      const habits = S.habits.filter(h => h.completions[ds]);
      // Heatmap: count completed tasks + habits
      const totalActivity = compTasks.length + habits.length;
      let hmClass = 'heatmap-0';
      if (totalActivity >= 5) hmClass = 'heatmap-5';
      else if (totalActivity >= 3) hmClass = 'heatmap-4';
      else if (totalActivity >= 2) hmClass = 'heatmap-3';
      else if (totalActivity >= 1) hmClass = 'heatmap-2';
      // Only apply heatmap to past dates
      const isPast = c.date <= sod(now);
      const hmApply = isPast && !c.om ? hmClass : '';

      let cls = 'calendar-cell';
      if (c.om) cls += ' other-month'; if (isCur) cls += ' today'; if (isSel) cls += ' selected';
      if (hmApply) cls += ` ${hmApply}`;

      let content = '';
      // Task pills
      if (pendTasks.length || compTasks.length) {
        content += '<div class="calendar-cell-tasks">';
        const visible = pendTasks.slice(0, 2);
        visible.forEach(t => content += `<div class="calendar-task-pill" data-priority="${t.priority}" title="${esc(t.title)}">${esc(t.title)}</div>`);
        // Show completed tasks on past dates
        if (isPast && compTasks.length) {
          compTasks.slice(0, 1).forEach(t => content += `<div class="calendar-task-pill completed-pill" data-priority="${t.priority}" title="${esc(t.title)}">${esc(t.title)}</div>`);
        }
        if (tasks.length > 2) content += `<span class="calendar-task-more">+${tasks.length - 2} more</span>`;
        content += '</div>';
        // Dots for mobile
        content += '<div class="calendar-task-dots">';
        tasks.slice(0, 4).forEach(t => content += `<span class="calendar-task-dot" data-priority="${t.priority}"></span>`);
        content += '</div>';
      }
      // Habit pills
      if (habits.length) {
        habits.slice(0, 1).forEach(h => content += `<div class="calendar-habit-pill habit-done" title="${esc(h.name)}">${h.emoji}</div>`);
      }

      return `<div class="${cls}" data-date="${ds}" data-action="calendar-select" role="gridcell">
        <span class="calendar-cell-date">${c.day}</span>
        ${hasOverdue ? '<span class="calendar-cell-overdue"></span>' : ''}
        ${content}</div>`;
    }).join('');
  }
  function navCalendar(dir) {
    S.calMonth += dir;
    if (S.calMonth > 11) { S.calMonth = 0; S.calYear++; }
    else if (S.calMonth < 0) { S.calMonth = 11; S.calYear--; }
    renderCalendar();
  }
  function showCalDayPanel(ds) {
    S.selectedCalendarDate = ds;
    const p = $('calendar-day-panel'), t = $('calendar-day-panel-title'), tl = $('calendar-day-panel-tasks'), em = $('calendar-day-panel-empty');
    if (!p) return; p.hidden = false;
    if (t) t.textContent = fmtDate(ds, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const tasks = S.tasks.filter(x => x.dueDate === ds);
    const habits = S.habits.filter(h => h.completions[ds]);
    let html = tasks.map(renderTaskItem).join('');
    if (habits.length) {
      html += '<li style="padding:8px;font-size:0.8rem;color:var(--text-tertiary);border-top:1px solid var(--border-default);margin-top:8px">Habits completed:</li>';
      habits.forEach(h => html += `<li class="task-item" style="opacity:0.7"><span class="habit-emoji" style="font-size:1.2rem">${h.emoji}</span><div class="task-content"><span class="task-title">${esc(h.name)}</span><div class="task-meta"><span class="task-meta-item">✅ Completed</span></div></div></li>`);
    }
    if (tl) tl.innerHTML = html;
    if (em) em.hidden = tasks.length > 0 || habits.length > 0;
    renderCalendar();
  }

  // ========== GAMIFICATION ==========
  function addXP(n) {
    S.user.xp += n; S.user.totalXp += n;
    while (S.user.xp >= S.user.xpToNext) {
      S.user.xp -= S.user.xpToNext; S.user.level++;
      S.user.xpToNext = Math.floor(100 * Math.pow(1.2, S.user.level - 1));
      triggerLevelUp(); checkPets();
    }
    save(KEYS.USER, S.user); renderProfile();
  }
  function addGold(n) {
    S.user.gold += n; S.user.totalGold += n; save(KEYS.USER, S.user); renderProfile();
    const gc = $('sidebar-gold');
    if (gc) { gc.classList.add('gold-gain'); setTimeout(() => gc.classList.remove('gold-gain'), 600); }
  }
  function spendGold(n) { if (S.user.gold < n) return false; S.user.gold -= n; save(KEYS.USER, S.user); renderProfile(); return true; }
  function triggerLevelUp() {
    setText('levelup-level-number', `Level ${S.user.level}`);
    let reward = '';
    if (PETS[S.user.level]) reward = `🐾 New pet: ${PETS[S.user.level].icon} ${PETS[S.user.level].name}!`;
    setText('levelup-reward-text', reward);
    toggleEl('levelup-overlay', true);
    playSound('levelUp'); confetti();
  }
  function checkPets() {
    const levels = Object.keys(PETS).map(Number).sort((a, b) => a - b);
    for (const lv of levels) {
      if (S.user.level >= lv) { S.user.pet = PETS[lv].icon; S.user.petName = PETS[lv].name; }
    }
    save(KEYS.USER, S.user); renderProfile();
  }
  function renderProfile() {
    const av = $('sidebar-avatar');
    if (av) { av.src = S.user.avatar || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" rx="24" fill="%236C63FF"/><text x="24" y="30" text-anchor="middle" fill="white" font-size="20">${(S.user.name || 'A')[0].toUpperCase()}</text></svg>`)}`; }
    setText('sidebar-username', S.user.name);
    const ci = { warrior: '⚔️', mage: '🔮', rogue: '🗡️', healer: '🌿' };
    setText('sidebar-class', `${ci[S.user.class] || ''} ${S.user.class}`);
    setText('sidebar-level-badge', S.user.level);
    setText('sidebar-xp-text', `${S.user.xp} / ${S.user.xpToNext}`);
    const xf = $('sidebar-xp-fill'); if (xf) xf.style.width = `${S.user.xp / S.user.xpToNext * 100}%`;
    setText('sidebar-hp-text', `${S.user.hp} / ${S.user.maxHp}`);
    const hf = $('sidebar-hp-fill'); if (hf) hf.style.width = `${S.user.hp / S.user.maxHp * 100}%`;
    setText('sidebar-gold', S.user.gold); setText('sidebar-streak', S.streak.current);
    const ps = $('sidebar-pet');
    if (ps) { ps.hidden = !S.user.pet; setText('sidebar-pet-icon', S.user.pet || ''); setText('sidebar-pet-name', S.user.petName || ''); }
  }
  function renderFooter() {
    setText('footer-tasks-completed', S.stats.tasksCompletedToday);
    setText('footer-streak', S.streak.current);
    setText('footer-focus-time', fmtMinutes(S.stats.focusTimeToday));
  }

  // ========== ACHIEVEMENTS ==========
  function checkTaskAch() { const n = S.stats.totalTasksCompleted; [1, 10, 50, 100].forEach(c => { if (n >= c && !S.achievements[`tasks-${c}`]) unlockAch(`tasks-${c}`); }); }
  function checkStreakAch() { const n = S.streak.current; [3, 7, 30].forEach(c => { if (n >= c && !S.achievements[`streak-${c}`]) unlockAch(`streak-${c}`); }); }
  function checkFocusAch() {
    const m = S.stats.totalFocusTime;
    if (m >= 60 && !S.achievements['focus-1h']) unlockAch('focus-1h');
    if (m >= 600 && !S.achievements['focus-10h']) unlockAch('focus-10h');
    [5, 10, 20].forEach(lv => { if (S.user.level >= lv && !S.achievements[`pet-level${lv}`]) unlockAch(`pet-level${lv}`); });
  }
  function unlockAch(k) {
    if (S.achievements[k]) return;
    S.achievements[k] = true; save(KEYS.ACHIEVEMENTS, S.achievements);
    const card = document.querySelector(`[data-achievement="${k}"]`);
    let name = k; if (card) { const ne = card.querySelector('.achievement-name'); if (ne) name = ne.textContent; }
    const t = $('achievement-toast'), m = $('achievement-toast-message');
    if (t && m) { m.textContent = name; t.hidden = false; clearTimeout(t._to); t._to = setTimeout(() => t.hidden = true, 5000); }
    playSound('levelUp'); addGold(10);
    if (S.currentView === 'achievements') renderAchievements();
  }
  function renderAchievements() {
    Object.entries(S.achievements).forEach(([k, v]) => {
      const c = document.querySelector(`[data-achievement="${k}"]`); if (!c) return;
      c.classList.toggle('locked', !v); c.classList.toggle('unlocked', v);
      const st = c.querySelector('.achievement-status');
      if (st) { st.textContent = v ? '✅' : '🔒'; st.setAttribute('aria-label', v ? 'Unlocked' : 'Locked'); }
    });
  }

  // ========== STATISTICS ==========
  function renderStats() {
    setText('stat-tasks-today', S.stats.tasksCompletedToday);
    setText('stat-tasks-week', S.stats.tasksCompletedThisWeek);
    setText('stat-current-streak', S.streak.current);
    setText('stat-focus-time', fmtMinutes(S.stats.focusTimeToday));
    setText('stat-total-xp', S.user.totalXp);
    setText('stat-total-gold', S.user.totalGold);
    renderBarChart(); renderDonut(); renderFocusChart();
  }
  function renderBarChart() {
    const bc = $('stats-bar-chart-bars'), bl = $('stats-bar-chart-labels'); if (!bc || !bl) return;
    const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().split('T')[0]; days.push({ k, l: d.toLocaleDateString('en-US', { weekday: 'short' }), c: S.stats.dailyCompletions[k] || 0 }); }
    const mx = Math.max(...days.map(d => d.c), 1);
    bc.innerHTML = days.map(d => `<div class="bar-chart-bar" style="height:${Math.max(d.c / mx * 100, 4)}%" data-value="${d.c}"></div>`).join('');
    bl.innerHTML = days.map(d => `<div class="bar-chart-label">${d.l}</div>`).join('');
  }
  function renderDonut() {
    const comp = S.tasks.filter(t => t.completed).length;
    const pend = S.tasks.filter(t => !t.completed).length;
    const od = S.tasks.filter(t => !t.completed && t.dueDate && isOverdue(t.dueDate)).length;
    const total = S.tasks.length || 1;
    setText('donut-completed-count', comp); setText('donut-pending-count', pend); setText('donut-overdue-count', od);
    const c = 2 * Math.PI * 60;
    const pe = $('donut-pending'), ce = $('donut-completed');
    if (pe) { pe.style.strokeDasharray = c; pe.style.strokeDashoffset = '0'; }
    if (ce) { ce.style.strokeDasharray = `${comp / total * c} ${c}`; ce.style.strokeDashoffset = '0'; }
  }
  function renderFocusChart() {
    const bc = $('stats-focus-chart-bars'), bl = $('stats-focus-chart-labels'); if (!bc || !bl) return;
    const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().split('T')[0]; const m = (S.stats.dailyFocus && S.stats.dailyFocus[k]) || 0; days.push({ l: d.toLocaleDateString('en-US', { weekday: 'short' }), m }); }
    const mx = Math.max(...days.map(d => d.m), 1);
    bc.innerHTML = days.map(d => `<div class="bar-chart-bar" style="height:${Math.max(d.m / mx * 100, 4)}%;background:linear-gradient(180deg,var(--secondary),var(--primary))" data-value="${d.m}m"></div>`).join('');
    bl.innerHTML = days.map(d => `<div class="bar-chart-label">${d.l}</div>`).join('');
  }

  // ========== REWARDS (Change 9) ==========
  function renderRewards() {
    setText('rewards-gold-balance', S.user.gold);
    const g = $('rewards-grid'); if (!g) return;
    const all = [...DEFAULT_REWARDS, ...S.customRewards];
    g.innerHTML = all.map(r => `<div class="reward-card glass-card" role="listitem" data-reward-id="${r.id}">
      ${r.id.startsWith('r') ? '' : `<button class="reward-delete-btn" data-action="delete-reward" data-reward-id="${r.id}" aria-label="Delete reward">✕</button>`}
      <span class="reward-icon" aria-hidden="true">${r.emoji || '🎁'}</span>
      <h4 class="reward-name">${esc(r.name)}</h4>
      <p class="reward-desc">${esc(r.desc || 'Custom reward')}</p>
      <div class="reward-footer">
        <span class="reward-cost">🪙 ${r.cost}</span>
        <button class="btn btn--primary btn--sm reward-buy-btn" data-cost="${r.cost}" ${S.user.gold < r.cost ? 'disabled' : ''}>Redeem</button>
      </div></div>`).join('');
  }

  // ========== SETTINGS (Changes 6, 7, 8) ==========
  function renderSettings() {
    const ni = $('settings-name'), ai = $('settings-avatar');
    if (ni) ni.value = S.user.name; if (ai) ai.value = S.user.avatar;
    // Change 8: class selector
    $$('.settings-class-option').forEach(btn => {
      const active = btn.dataset.class === S.user.class;
      btn.classList.toggle('active', active); btn.setAttribute('aria-checked', String(active));
    });
    // Theme
    const tt = $('settings-theme-toggle');
    if (tt) { tt.setAttribute('aria-checked', String(S.settings.theme === 'dark')); tt.classList.toggle('active', S.settings.theme === 'dark'); }
    // Sound
    const st = $('settings-sound-toggle');
    if (st) { st.setAttribute('aria-checked', String(S.settings.soundEnabled)); st.classList.toggle('active', S.settings.soundEnabled); }
    // Change 6: background
    $$('.bg-preset').forEach(b => b.classList.toggle('active', b.dataset.bg === S.background));
    toggleEl('bg-remove-btn', S.background === 'custom');
  }
  function toggleTheme() {
    S.settings.theme = S.settings.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', S.settings.theme);
    save(KEYS.SETTINGS, S.settings); renderSettings();
  }
  function toggleSound() { S.settings.soundEnabled = !S.settings.soundEnabled; save(KEYS.SETTINGS, S.settings); renderSettings(); }

  // Change 6: Background
  function applyBackground(type, url) {
    S.background = type; save(KEYS.BACKGROUND, type);
    if (type === 'none') {
      document.body.style.background = ''; document.body.classList.remove('has-custom-bg');
    } else if (type === 'custom' && url) {
      document.body.style.background = `url("${url}") center/cover fixed`; document.body.classList.add('has-custom-bg');
    } else if (BG_PRESETS[type]) {
      document.body.style.background = BG_PRESETS[type]; document.body.classList.add('has-custom-bg');
    }
    renderSettings();
  }

  function exportData() {
    const d = { tasks: S.tasks, projects: S.projects, habits: S.habits, tags: S.tags, user: S.user, settings: S.settings, achievements: S.achievements, focus: S.focus, streak: S.streak, stats: S.stats, customRewards: S.customRewards, completionHistory: S.completionHistory, exportedAt: new Date().toISOString() };
    const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `zenflow-${today()}.json`; a.click(); URL.revokeObjectURL(a.href);
    notify('Data exported!', 'success');
  }
  function importData(file) {
    const r = new FileReader();
    r.onload = e => {
      try {
        const d = JSON.parse(e.target.result);
        if (d.tasks) S.tasks = d.tasks; if (d.projects) S.projects = d.projects;
        if (d.habits) S.habits = d.habits; if (d.tags) S.tags = d.tags;
        if (d.user) S.user = { ...DEF_USER, ...d.user };
        if (d.settings) S.settings = { ...DEF_SETTINGS, ...d.settings };
        if (d.achievements) S.achievements = { ...DEF_ACHIEVEMENTS, ...d.achievements };
        if (d.focus) S.focus = { ...DEF_FOCUS, ...d.focus };
        if (d.streak) S.streak = { ...DEF_STREAK, ...d.streak };
        if (d.stats) S.stats = { ...DEF_STATS, ...d.stats };
        if (d.customRewards) S.customRewards = d.customRewards;
        if (d.completionHistory) S.completionHistory = d.completionHistory;
        saveAll(); document.documentElement.setAttribute('data-theme', S.settings.theme);
        renderAll(); notify('Data imported!', 'success');
      } catch (err) { notify('Invalid file', 'error'); }
    };
    r.readAsText(file);
  }
  function resetAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    Object.assign(S, { tasks: [], projects: [], habits: [], tags: [], user: { ...DEF_USER }, settings: { ...DEF_SETTINGS }, achievements: { ...DEF_ACHIEVEMENTS }, focus: { ...DEF_FOCUS }, streak: { ...DEF_STREAK }, stats: { ...DEF_STATS }, customRewards: [], completionHistory: {}, onboarded: false, background: 'none' });
    document.documentElement.setAttribute('data-theme', 'dark'); applyBackground('none');
    renderAll(); const o = $('onboarding-overlay'); if (o) o.hidden = false;
    notify('All data reset', 'info');
  }

  // ========== SEARCH (Change 11: fixed) ==========
  function handleSearch(q) {
    S.searchQuery = q;
    const re = $('search-results'), rl = $('search-results-list'), rc = $('search-results-count'), em = $('search-results-empty'), cb = $('search-clear-btn'), sk = document.querySelector('.search-shortcut');
    if (!q || !q.trim()) { if (re) re.hidden = true; if (cb) cb.hidden = true; if (sk) sk.hidden = false; S.searchQuery = ''; return; }
    if (cb) cb.hidden = false; if (sk) sk.hidden = true;
    const ql = q.toLowerCase().trim();
    const results = S.tasks.filter(t => t.title.toLowerCase().includes(ql) || (t.notes && t.notes.toLowerCase().includes(ql)) || (t.tags && t.tags.some(tg => tg.toLowerCase().includes(ql))));
    if (re) re.hidden = false;
    if (rc) rc.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
    if (!results.length) { if (rl) rl.innerHTML = ''; if (em) em.hidden = false; }
    else {
      if (em) em.hidden = true;
      if (rl) rl.innerHTML = results.map(t => `<li class="search-result-item" role="option" data-task-id="${t.id}" data-action="view-task">
        <span class="task-checkbox ${t.completed ? 'checked' : ''}" data-priority="${t.priority}"></span>
        <div class="task-content"><span class="task-title">${esc(t.title)}</span>${t.dueDate ? `<span class="task-meta-item">${fmtDate(t.dueDate)}</span>` : ''}</div></li>`).join('');
    }
  }

  // ========== MODALS ==========
  function openTaskModal(id) {
    const ov = $('task-modal-overlay'); if (!ov) return;
    const fp = $('task-form-project');
    if (fp) fp.innerHTML = '<option value="">— None —</option>' + S.projects.map(p => `<option value="${p.id}">${p.emoji} ${esc(p.name)}</option>`).join('');

    if (id) {
      const t = S.tasks.find(x => x.id === id); if (!t) return;
      S.editingTaskId = id;
      setText('task-modal-title', 'Edit Task'); setText('task-form-submit-btn', 'Save Changes');
      toggleEl('task-form-delete-btn', true);
      $('task-form-id').value = t.id;
      $('task-form-title').value = t.title;
      $('task-form-notes').value = t.notes || '';
      $('task-form-date').value = t.dueDate || '';
      $('task-form-time').value = t.dueTime || '';
      if (fp) fp.value = t.project || '';
      $('task-form-tags').value = '';
      $('task-form-flagged').checked = t.flagged;
      const freq = $('task-form-frequency'); if (freq) freq.value = t.frequency || 'none';
      toggleEl('task-form-custom-freq-group', t.frequency === 'custom');
      const cf = $('task-form-custom-freq'); if (cf) cf.value = t.customFreqDays || '';
      $$('.priority-btn').forEach(b => { const a = b.dataset.priority === t.priority; b.classList.toggle('active', a); b.setAttribute('aria-checked', String(a)); });
      $$('.difficulty-btn').forEach(b => { const a = b.dataset.difficulty === t.difficulty; b.classList.toggle('active', a); b.setAttribute('aria-checked', String(a)); });
      renderFormTags(t.tags || []);
      const sl = $('task-form-subtasks');
      if (sl) sl.innerHTML = (t.subtasks || []).map((s, i) => `<li class="subtask-item ${s.completed ? 'completed' : ''}"><button type="button" class="subtask-checkbox ${s.completed ? 'checked' : ''}" data-index="${i}" data-action="toggle-form-subtask"></button><span class="subtask-text">${esc(s.text)}</span><button type="button" class="subtask-remove" data-index="${i}" data-action="remove-form-subtask">✕</button></li>`).join('');
    } else {
      S.editingTaskId = null;
      setText('task-modal-title', 'Add Task'); setText('task-form-submit-btn', 'Add Task');
      toggleEl('task-form-delete-btn', false);
      $('task-form-id').value = '';
      $('task-form-title').value = ''; $('task-form-notes').value = '';
      $('task-form-date').value = S.selectedCalendarDate || '';
      $('task-form-time').value = '';
      if (fp) fp.value = S.currentView === 'project-detail' ? (S.currentProjectId || '') : '';
      $('task-form-tags').value = ''; $('task-form-flagged').checked = false;
      const freq = $('task-form-frequency'); if (freq) freq.value = 'none';
      toggleEl('task-form-custom-freq-group', false);
      const cf = $('task-form-custom-freq'); if (cf) cf.value = '';
      $$('.priority-btn').forEach(b => { const p4 = b.dataset.priority === 'p4'; b.classList.toggle('active', p4); b.setAttribute('aria-checked', String(p4)); });
      $$('.difficulty-btn').forEach(b => { const ez = b.dataset.difficulty === 'easy'; b.classList.toggle('active', ez); b.setAttribute('aria-checked', String(ez)); });
      renderFormTags([]); const sl = $('task-form-subtasks'); if (sl) sl.innerHTML = '';
    }
    ov.hidden = false;
    $('task-form-title').focus();
  }
  function closeTaskModal() { const o = $('task-modal-overlay'); if (o) o.hidden = true; S.editingTaskId = null; }
  function renderFormTags(tags) { const d = $('task-form-tags-display'); if (d) d.innerHTML = tags.map((t, i) => `<span class="tag-chip">#${esc(t)}<span class="tag-chip-remove" data-index="${i}" data-action="remove-form-tag" role="button" tabindex="0">✕</span></span>`).join(''); }
  function getTaskFormData() {
    const ap = document.querySelector('.priority-btn.active');
    const ad = document.querySelector('.difficulty-btn.active');
    const chips = $$('#task-form-tags-display .tag-chip');
    const ct = Array.from(chips).map(c => c.textContent.replace('✕', '').trim().replace('#', ''));
    const it = ($('task-form-tags') ? $('task-form-tags').value : '').split(',').map(t => t.trim().replace('#', '')).filter(t => t);
    const tags = [...new Set([...ct, ...it])];
    const subtasks = [];
    $$('#task-form-subtasks .subtask-item').forEach(item => {
      const te = item.querySelector('.subtask-text'), ch = item.querySelector('.subtask-checkbox');
      if (te) subtasks.push({ text: te.textContent, completed: ch ? ch.classList.contains('checked') : false });
    });
    const freq = $('task-form-frequency') ? $('task-form-frequency').value : 'none';
    const cfd = $('task-form-custom-freq') ? parseInt($('task-form-custom-freq').value) || 0 : 0;
    return {
      title: $('task-form-title') ? $('task-form-title').value.trim() : '',
      notes: $('task-form-notes') ? $('task-form-notes').value.trim() : '',
      dueDate: $('task-form-date') ? $('task-form-date').value : '',
      dueTime: $('task-form-time') ? $('task-form-time').value : '',
      priority: ap ? ap.dataset.priority : 'p4',
      difficulty: ad ? ad.dataset.difficulty : 'easy',
      project: $('task-form-project') ? $('task-form-project').value : '',
      tags, flagged: $('task-form-flagged') ? $('task-form-flagged').checked : false,
      subtasks, frequency: freq, customFreqDays: cfd
    };
  }
  function submitTaskForm(e) {
    if (e) e.preventDefault();
    const d = getTaskFormData();
    if (!d.title) { const ti = $('task-form-title'); if (ti) { ti.classList.add('shake'); setTimeout(() => ti.classList.remove('shake'), 300); ti.focus(); } return; }
    // Apply NLP if not editing
    if (!S.editingTaskId) {
      const parsed = parseNLP(d.title);
      if (parsed.dueDate && !d.dueDate) d.dueDate = parsed.dueDate;
      if (parsed.dueTime && !d.dueTime) d.dueTime = parsed.dueTime;
      if (parsed.priority !== 'p4' && d.priority === 'p4') d.priority = parsed.priority;
      if (parsed.tags.length) d.tags = [...new Set([...d.tags, ...parsed.tags])];
      d.title = parsed.title;
    }
    if (S.editingTaskId) { updateTask(S.editingTaskId, d); notify('Task updated!', 'success'); }
    else createTask(d);
    closeTaskModal();
  }
  function addFormSubtask() {
    const inp = $('task-form-subtask-input'), list = $('task-form-subtasks');
    if (!inp || !list || !inp.value.trim()) return;
    const li = document.createElement('li'); li.className = 'subtask-item';
    li.innerHTML = `<button type="button" class="subtask-checkbox" data-action="toggle-form-subtask"></button><span class="subtask-text">${esc(inp.value.trim())}</span><button type="button" class="subtask-remove" data-action="remove-form-subtask">✕</button>`;
    list.appendChild(li); inp.value = ''; inp.focus();
  }

  // Project Modal
  function openProjectModal(id) {
    const ov = $('project-modal-overlay'); if (!ov) return;
    if (id) {
      const p = S.projects.find(x => x.id === id); if (!p) return;
      S.editingProjectId = id; setText('project-modal-title', 'Edit Project'); setText('project-form-submit-btn', 'Save Changes');
      $('project-form-id').value = p.id; $('project-form-name').value = p.name;
      $('project-form-emoji').value = p.emoji; $('project-form-color').value = p.color;
      $('project-form-due').value = p.dueDate || '';
    } else {
      S.editingProjectId = null; setText('project-modal-title', 'New Project'); setText('project-form-submit-btn', 'Create Project');
      $('project-form-id').value = ''; $('project-form-name').value = '';
      $('project-form-emoji').value = '📁'; $('project-form-color').value = '#6C63FF'; $('project-form-due').value = '';
    }
    ov.hidden = false; $('project-form-name').focus();
  }
  function closeProjectModal() { const o = $('project-modal-overlay'); if (o) o.hidden = true; S.editingProjectId = null; }
  function submitProjectForm(e) {
    if (e) e.preventDefault();
    const n = $('project-form-name') ? $('project-form-name').value.trim() : '';
    if (!n) { const ni = $('project-form-name'); if (ni) { ni.classList.add('shake'); setTimeout(() => ni.classList.remove('shake'), 300); ni.focus(); } return; }
    const d = { name: n, emoji: $('project-form-emoji') ? $('project-form-emoji').value.trim() || '📁' : '📁', color: $('project-form-color') ? $('project-form-color').value : '#6C63FF', dueDate: $('project-form-due') ? $('project-form-due').value : '' };
    if (S.editingProjectId) { updateProject(S.editingProjectId, d); notify('Project updated!', 'success'); }
    else createProject(d);
    closeProjectModal();
  }

  // Habit Modal (Change 10: frequency)
  function openHabitModal(id) {
    const ov = $('habit-modal-overlay'); if (!ov) return;
    if (id) {
      const h = S.habits.find(x => x.id === id); if (!h) return;
      S.editingHabitId = id; setText('habit-modal-title', 'Edit Habit'); setText('habit-form-submit-btn', 'Save Changes');
      toggleEl('habit-form-delete-btn', true);
      $('habit-form-id').value = h.id; $('habit-form-name').value = h.name; $('habit-form-emoji').value = h.emoji;
      const freq = $('habit-form-frequency'); if (freq) freq.value = h.frequency || 'daily';
      toggleEl('habit-form-custom-freq-group', h.frequency === 'custom');
      const cf = $('habit-form-custom-freq'); if (cf) cf.value = h.customFreqDays || '';
    } else {
      S.editingHabitId = null; setText('habit-modal-title', 'New Habit'); setText('habit-form-submit-btn', 'Create Habit');
      toggleEl('habit-form-delete-btn', false);
      $('habit-form-id').value = ''; $('habit-form-name').value = ''; $('habit-form-emoji').value = '✨';
      const freq = $('habit-form-frequency'); if (freq) freq.value = 'daily';
      toggleEl('habit-form-custom-freq-group', false);
    }
    ov.hidden = false; $('habit-form-name').focus();
  }
  function closeHabitModal() { const o = $('habit-modal-overlay'); if (o) o.hidden = true; S.editingHabitId = null; }
  function submitHabitForm(e) {
    if (e) e.preventDefault();
    const n = $('habit-form-name') ? $('habit-form-name').value.trim() : '';
    if (!n) return;
    const freq = $('habit-form-frequency') ? $('habit-form-frequency').value : 'daily';
    const cfd = $('habit-form-custom-freq') ? parseInt($('habit-form-custom-freq').value) || 0 : 0;
    const d = { name: n, emoji: $('habit-form-emoji') ? $('habit-form-emoji').value.trim() || '✨' : '✨', frequency: freq, customFreqDays: cfd };
    if (S.editingHabitId) { updateHabit(S.editingHabitId, d); notify('Habit updated!', 'success'); }
    else createHabit(d);
    closeHabitModal();
  }

  // Task Detail
  function openDetail(id) {
    const t = S.tasks.find(x => x.id === id); if (!t) return;
    const p = $('task-detail-panel'); if (!p) return;
    const proj = t.project ? S.projects.find(x => x.id === t.project) : null;
    const st = taskState(t);
    setText('task-detail-title', t.title);
    setText('task-detail-status', { pending: '⏳ Pending', completed: '✅ Completed', overdue: '⚠️ Overdue' }[st] || st);
    setText('task-detail-priority', { p1: '🔴 P1', p2: '🟠 P2', p3: '🟡 P3', p4: '⚪ P4' }[t.priority]);
    setText('task-detail-difficulty', { easy: '🟢 Easy (+5 XP)', medium: '🟡 Medium (+10 XP)', hard: '🔴 Hard (+20 XP)' }[t.difficulty]);
    setText('task-detail-due', t.dueDate ? fmtDate(t.dueDate) + (t.dueTime ? ' at ' + fmtTime(t.dueTime) : '') : 'No due date');
    // Change 10: frequency
    const fr = $('task-detail-frequency-row'), fv = $('task-detail-frequency');
    if (fr && fv) { fr.hidden = !t.frequency || t.frequency === 'none'; fv.textContent = t.frequency === 'custom' ? `Every ${t.customFreqDays} days` : t.frequency; }
    const pr = $('task-detail-project-row'), pv = $('task-detail-project');
    if (pr && pv) { pr.hidden = !proj; pv.textContent = proj ? `${proj.emoji} ${proj.name}` : ''; }
    const tr = $('task-detail-tags-row'), tv = $('task-detail-tags');
    if (tr && tv) { tr.hidden = !(t.tags && t.tags.length); tv.innerHTML = (t.tags || []).map(tg => `<span class="task-tag">#${esc(tg)}</span>`).join(''); }
    const nr = $('task-detail-notes-row'), nv = $('task-detail-notes');
    if (nr && nv) { nr.hidden = !t.notes; nv.textContent = t.notes; }
    const sr = $('task-detail-subtasks-row'), sv = $('task-detail-subtasks');
    if (sr && sv) {
      sr.hidden = !(t.subtasks && t.subtasks.length);
      sv.innerHTML = (t.subtasks || []).map((s, i) => `<li class="subtask-item ${s.completed ? 'completed' : ''}"><button class="subtask-checkbox ${s.completed ? 'checked' : ''}" data-action="toggle-detail-subtask" data-task-id="${t.id}" data-index="${i}"></button><span class="subtask-text">${esc(s.text)}</span></li>`).join('');
    }
    toggleEl('task-detail-flag-row', t.flagged);
    setText('task-detail-xp', `+${XP_MAP[t.difficulty] || 5} XP, +${GOLD_MAP[t.difficulty] || 2} Gold`);
    const cb = $('task-detail-complete-btn');
    if (cb) { cb.innerHTML = t.completed ? '<span aria-hidden="true">↩</span> Undo Complete' : '<span aria-hidden="true">✓</span> Mark Complete'; cb.dataset.taskId = t.id; cb.dataset.action = t.completed ? 'uncomplete-task' : 'complete-task'; }
    const eb = $('task-detail-edit-btn'); if (eb) eb.dataset.taskId = t.id;
    p.hidden = false; p.classList.add('open');
  }
  function closeDetail() { const p = $('task-detail-panel'); if (p) { p.classList.remove('open'); setTimeout(() => p.hidden = true, 400); } }
  function showConfirm(title, msg, cb) {
    const ov = $('confirm-overlay'); if (!ov) return;
    setText('confirm-title', title); setText('confirm-message', msg);
    ov.hidden = false;
    const ok = $('confirm-ok-btn'), cn = $('confirm-cancel-btn');
    const nok = ok.cloneNode(true); ok.parentNode.replaceChild(nok, ok);
    const ncn = cn.cloneNode(true); cn.parentNode.replaceChild(ncn, cn);
    nok.addEventListener('click', () => { ov.hidden = true; if (cb) cb(); });
    ncn.addEventListener('click', () => ov.hidden = true);
  }

  // ========== SIDEBAR ==========
  function toggleSidebar() {
    const sb = $('sidebar'); if (!sb) return;
    sb.classList.toggle('collapsed');
    S.settings.sidebarCollapsed = sb.classList.contains('collapsed');
    save(KEYS.SETTINGS, S.settings);
  }
  function openMobileSidebar() { const sb = $('sidebar'), ov = $('sidebar-overlay'); if (sb) sb.classList.add('open'); if (ov) { ov.hidden = false; ov.classList.add('active'); } }
  function closeMobileSidebar() { const sb = $('sidebar'), ov = $('sidebar-overlay'); if (sb) sb.classList.remove('open'); if (ov) { ov.classList.remove('active'); setTimeout(() => ov.hidden = true, 300); } }
  function toggleSection(btn) {
    const exp = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!exp));
    const sec = btn.parentElement;
    if (sec) sec.querySelectorAll('ul').forEach(l => l.hidden = exp);
  }

  // ========== DRAG & DROP ==========
function setupDnD() {
  // DRAG START
  document.addEventListener("dragstart", (e) => {
    const taskItem = e.target.closest(".task-item");
    if (!taskItem) return;

    S.draggedTaskId = taskItem.dataset.taskId;
    e.dataTransfer.effectAllowed = "move";
    taskItem.style.opacity = "0.5";
  });

  // DRAG END
  document.addEventListener("dragend", (e) => {
    const taskItem = e.target.closest(".task-item");
    if (taskItem) taskItem.style.opacity = "1";

    document
      .querySelectorAll(".calendar-cell.selected")
      .forEach((c) => c.classList.remove("selected"));

    S.draggedTaskId = null;
  });

  // DRAG OVER
  document.addEventListener("dragover", (e) => {
    const cell = e.target.closest(".calendar-cell");
    if (!cell || !S.draggedTaskId) return;

    e.preventDefault(); // REQUIRED for drop to work
    e.dataTransfer.dropEffect = "move";

    cell.classList.add("selected");
  });

  // DRAG LEAVE
  document.addEventListener("dragleave", (e) => {
    const cell = e.target.closest(".calendar-cell");
    if (!cell) return;

    cell.classList.remove("selected");
  });

  // DROP
  document.addEventListener("drop", (e) => {
    const cell = e.target.closest(".calendar-cell");
    if (!cell || !S.draggedTaskId) return;

    e.preventDefault();
    cell.classList.remove("selected");

    const newDate = cell.dataset.date;
    if (!newDate) return;

    updateTask(S.draggedTaskId, { dueDate: newDate });
    notify(`Task moved to ${fmtDate(newDate)}`, "success");
    renderCalendar();

    S.draggedTaskId = null;
  });
}


  // ========== ONBOARDING ==========
  function setupOnboarding() {
    const ov = $('onboarding-overlay'); if (!ov) return;
    if (S.onboarded) { ov.hidden = true; return; }
    ov.hidden = false;
    const ni = $('onboarding-name'), nb = $('onboarding-next-btn'), bb = $('onboarding-back-btn'), sb = $('onboarding-start-btn');
    const s1 = $('onboarding-step-1'), s2 = $('onboarding-step-2');
    let selClass = '';
    if (ni) ni.addEventListener('input', () => { if (nb) nb.disabled = !ni.value.trim(); });
    if (nb) nb.addEventListener('click', () => {
      if (ni && ni.value.trim()) {
        S.user.name = ni.value.trim();
        const av = $('onboarding-avatar'); if (av && av.value.trim()) S.user.avatar = av.value.trim();
        if (s1) s1.hidden = true; if (s2) s2.hidden = false;
      }
    });
    if (bb) bb.addEventListener('click', () => { if (s1) s1.hidden = false; if (s2) s2.hidden = true; });
    $$('.class-card').forEach(c => c.addEventListener('click', () => {
      $$('.class-card').forEach(x => { x.classList.remove('selected'); x.setAttribute('aria-checked', 'false'); });
      c.classList.add('selected'); c.setAttribute('aria-checked', 'true');
      selClass = c.dataset.class; if (sb) sb.disabled = false;
    }));
    if (sb) sb.addEventListener('click', () => {
      if (!selClass) return;
      S.user.class = selClass; S.onboarded = true;
      save(KEYS.USER, S.user); localStorage.setItem(KEYS.ONBOARDING, 'true');
      ov.hidden = true; renderAll();
      notify(`Welcome, ${S.user.name}! Your journey begins! 🚀`, 'success'); confetti();
    });
  }

  // ========== CHANGE 4: OVERDUE ALERT + HOURLY REWARD ==========
  function checkOverdueAlert() {
    const od = S.tasks.filter(t => !t.completed && t.dueDate && isOverdue(t.dueDate));
    if (!od.length) return;
    const list = $('overdue-alert-list');
    if (list) list.innerHTML = od.slice(0, 10).map(t => `<div class="overdue-alert-item" role="listitem"><span>⚠️ ${esc(t.title)}</span><span style="font-size:0.75rem;color:var(--text-tertiary);margin-left:auto">${fmtDate(t.dueDate)}</span></div>`).join('');
    toggleEl('overdue-alert-overlay', true);
  }

  function checkHourlyReward() {
    const now = Date.now();
    const lastOpen = parseInt(localStorage.getItem(KEYS.LAST_OPEN) || '0');
    localStorage.setItem(KEYS.LAST_OPEN, String(now));
    if (lastOpen && now - lastOpen >= 3600000) {
      addGold(5);
      showRewardToast('+5 Gold for coming back! 🎉');
    }
  }

  // ========== CHANGE 5: FILTER STATE PERSISTENCE ==========
  function applyFilters() {
    const statusChecks = $$('#filter-dropdown .dropdown-section:nth-child(1) input[type="checkbox"]');
    const priorityChecks = $$('#filter-dropdown .dropdown-section:nth-child(2) input[type="checkbox"]');
    S.filters.status = []; statusChecks.forEach(cb => { if (cb.checked) S.filters.status.push(cb.value); });
    S.filters.priority = []; priorityChecks.forEach(cb => { if (cb.checked) S.filters.priority.push(cb.value); });
    save(KEYS.FILTERS, S.filters);
    renderView();
  }

  function restoreFilterUI() {
    const statusChecks = $$('#filter-dropdown .dropdown-section:nth-child(1) input[type="checkbox"]');
    statusChecks.forEach(cb => { cb.checked = S.filters.status.includes(cb.value); });
    const priorityChecks = $$('#filter-dropdown .dropdown-section:nth-child(2) input[type="checkbox"]');
    priorityChecks.forEach(cb => { cb.checked = S.filters.priority.includes(cb.value); });
  }

  // ========== KEYBOARD SHORTCUTS ==========
  function setupKeys() {
    document.addEventListener('keydown', e => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.contentEditable === 'true';
      const hasModal = document.querySelector('.modal-overlay:not([hidden])');
      if (e.key === 'Escape') {
        if (hasModal) { const ms = $$('.modal-overlay:not([hidden])'); if (ms.length) ms[ms.length - 1].hidden = true; closeDetail(); return; }
        const sr = $('search-results'); if (sr && !sr.hidden) { sr.hidden = true; const si = $('global-search'); if (si) si.value = ''; S.searchQuery = ''; return; }
        closeDetail();
        const sd = $('sort-dropdown'), fd = $('filter-dropdown');
        if (sd) sd.hidden = true; if (fd) fd.hidden = true;
        return;
      }
      if (isInput || hasModal) return;
      switch (e.key.toLowerCase()) {
        case 'n': case 'q': e.preventDefault(); openTaskModal(); break;
        case '/': e.preventDefault(); { const si = $('global-search'); if (si) si.focus(); } break;
        case '1': e.preventDefault(); switchView('inbox'); break;
        case '2': case 't': e.preventDefault(); switchView('today'); break;
        case '3': e.preventDefault(); switchView('upcoming'); break;
        case 'h': e.preventDefault(); switchView('habits'); break;
        case 'f': e.preventDefault(); switchView('focus'); break;
        case 'c': e.preventDefault(); switchView('calendar'); break;
        case 'd': e.preventDefault(); switchView('statistics'); break;
        case '?': e.preventDefault(); { const so = $('shortcuts-overlay'); if (so) so.hidden = !so.hidden; } break;
      }
    });
  }

  // ========== COMPLETED TOGGLES ==========
  function setupCompletedToggles() {
    document.addEventListener('click', e => {
      const toggle = e.target.closest('.completed-toggle');
      if (!toggle) return;
      const tid = toggle.dataset.toggle; if (!tid) return;
      const list = $(tid); if (!list) return;
      const exp = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!exp));
      list.hidden = exp;
      if (!exp && !list.innerHTML.trim()) {
        const completed = S.tasks.filter(t => t.completed);
        list.innerHTML = completed.map(renderTaskItem).join('');
      }
    });
  }

  // ========== RENDER ALL ==========
  function renderAll() {
    renderProfile(); renderSidebarProjects(); renderSidebarTags();
    renderFooter(); updateBadges(); renderView();
    document.documentElement.setAttribute('data-theme', S.settings.theme);
    const sb = $('sidebar');
    if (sb && S.settings.sidebarCollapsed) sb.classList.add('collapsed');
    applyBackground(S.background);
    restoreFilterUI();
  }

  // ========== EVENT DELEGATION ==========
  function setupEvents() {
    // Global click delegation
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      const action = el ? el.dataset.action : null;

      // Task actions
      if (action === 'toggle-task') {
        const id = el.dataset.taskId;
        const task = S.tasks.find(t => t.id === id);
        if (task) {
          if (task.completed) { uncompleteTask(id); }
          else {
            const ti = el.closest('.task-item');
            if (ti) { ti.classList.add('completing'); setTimeout(() => completeTask(id), 500); }
            else completeTask(id);
          }
        }
        return;
      }
      if (action === 'view-task') { openDetail(el.dataset.taskId); return; }
      if (action === 'complete-task') { completeTask(el.dataset.taskId); closeDetail(); return; }
      if (action === 'uncomplete-task') { uncompleteTask(el.dataset.taskId); closeDetail(); return; }
      if (action === 'toggle-habit') { toggleHabit(el.dataset.habitId); return; }
      if (action === 'edit-habit') { openHabitModal(el.dataset.habitId); return; }
      if (action === 'calendar-select') { const ds = el.dataset.date; if (ds) showCalDayPanel(ds); return; }
      if (action === 'toggle-detail-subtask') { toggleSubtask(el.dataset.taskId, parseInt(el.dataset.index)); openDetail(el.dataset.taskId); return; }
      if (action === 'toggle-form-subtask') { el.classList.toggle('checked'); const item = el.closest('.subtask-item'); if (item) item.classList.toggle('completed'); return; }
      if (action === 'remove-form-subtask') { const item = el.closest('.subtask-item'); if (item) item.remove(); return; }
      if (action === 'remove-form-tag') { const chip = el.closest('.tag-chip'); if (chip) chip.remove(); return; }
      if (action === 'open-project') { S.currentProjectId = el.dataset.projectId; switchView('project-detail'); return; }
      if (action === 'quick-add') { openTaskModal(); return; }
      // Change 7: tag actions
      if (action === 'filter-tag') {
        S.filters.tag = el.dataset.tagName; save(KEYS.FILTERS, S.filters);
        switchView('inbox'); handleSearch(el.dataset.tagName);
        const si = $('global-search'); if (si) si.value = el.dataset.tagName;
        return;
      }
      if (action === 'edit-tag') {
        const tag = S.tags.find(t => t.id === el.dataset.tagId); if (!tag) return;
        S.editingTagId = tag.id;
        $('tag-form-name').value = tag.name; $('tag-form-color').value = tag.color;
        $('tag-form-emoji').value = tag.emoji; $('tag-form-id').value = tag.id;
        setText('tag-form-save-btn', 'Update Tag');
        return;
      }
      if (action === 'delete-tag') {
        showConfirm('Delete Tag', 'Tasks will lose this tag. Continue?', () => {
          deleteTag(el.dataset.tagId); renderTagModal();
        });
        return;
      }
      // Change 9: delete reward
      if (action === 'delete-reward') {
        const rid = el.dataset.rewardId;
        showConfirm('Delete Reward', 'Remove this custom reward?', () => {
          S.customRewards = S.customRewards.filter(r => r.id !== rid);
          save(KEYS.CUSTOM_REWARDS, S.customRewards); renderRewards();
          notify('Reward deleted', 'info');
        });
        return;
      }

      // Nav links
      const nav = e.target.closest('.nav-link');
      if (nav && nav.dataset.view) { switchView(nav.dataset.view); return; }
      const mnav = e.target.closest('.mobile-nav-btn[data-view]');
      if (mnav) { switchView(mnav.dataset.view); return; }
      // Project card
      const pc = e.target.closest('.project-card');
      if (pc && pc.dataset.projectId) { S.currentProjectId = pc.dataset.projectId; switchView('project-detail'); return; }
      // Habit card click for calendar
      const hc = e.target.closest('.habit-card');
      if (hc && !e.target.closest('button')) {
        S.selectedHabitId = hc.dataset.habitId;
        const h = S.habits.find(x => x.id === S.selectedHabitId);
        if (h) renderHabitCal(h); return;
      }
      // Search result
      const sri = e.target.closest('.search-result-item');
      if (sri) { const sr = $('search-results'); if (sr) sr.hidden = true; openDetail(sri.dataset.taskId); return; }
    });

    // Sidebar collapse
    const cb = $('sidebar-collapse-btn'); if (cb) cb.addEventListener('click', toggleSidebar);
    // Mobile menu
    const mm = $('mobile-menu-btn'); if (mm) mm.addEventListener('click', openMobileSidebar);
    const so = $('sidebar-overlay'); if (so) so.addEventListener('click', closeMobileSidebar);
    // Quick add
    const qa = $('quick-add-btn'); if (qa) qa.addEventListener('click', () => openTaskModal());
    const mqa = $('mobile-quick-add-btn'); if (mqa) mqa.addEventListener('click', () => openTaskModal());
    // Sidebar section toggles
    $$('.sidebar-section-toggle').forEach(t => t.addEventListener('click', e => { if (e.target.closest('.sidebar-section-add')) return; toggleSection(t); }));
    // Sidebar add project
    const sap = $('sidebar-add-project-btn'); if (sap) sap.addEventListener('click', e => { e.stopPropagation(); openProjectModal(); });
    // Change 7: Sidebar add tag
    const sat = $('sidebar-add-tag-btn');
    if (sat) sat.addEventListener('click', e => { e.stopPropagation(); S.editingTagId = null; $('tag-form-id').value = ''; $('tag-form-name').value = ''; $('tag-form-color').value = '#6C63FF'; $('tag-form-emoji').value = '🏷️'; setText('tag-form-save-btn', 'Add Tag'); renderTagModal(); toggleEl('tag-modal-overlay', true); });
    // Theme toggle
    const ttb = $('theme-toggle-btn'); if (ttb) ttb.addEventListener('click', toggleTheme);

    // Search
    const si = $('global-search');
    if (si) {
      let sd; si.addEventListener('input', () => { clearTimeout(sd); sd = setTimeout(() => handleSearch(si.value), 200); });
      si.addEventListener('focus', () => { if (si.value.trim()) handleSearch(si.value); });
    }
    const scb = $('search-clear-btn');
    if (scb) scb.addEventListener('click', () => { const inp = $('global-search'); if (inp) inp.value = ''; handleSearch(''); });
    // Close search on outside click
    document.addEventListener('click', e => {
      const sr = $('search-results'), sc = e.target.closest('.search-container'), sri = e.target.closest('.search-result-item');
      if (sr && !sr.hidden && !sc && !sri) sr.hidden = true;
    });

    // Change 11: Sort button fix
    const sortBtn = $('sort-btn');
    if (sortBtn) sortBtn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = $('sort-dropdown'), fd = $('filter-dropdown');
      if (fd) fd.hidden = true;
      if (dd) dd.hidden = !dd.hidden;
      sortBtn.setAttribute('aria-expanded', String(!dd.hidden));
    });
    $$('[data-sort]').forEach(item => item.addEventListener('click', () => {
      S.currentSort = item.dataset.sort;
      $$('[data-sort]').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const dd = $('sort-dropdown'); if (dd) dd.hidden = true;
      $('sort-btn').setAttribute('aria-expanded', 'false');
      renderView();
    }));

    // Change 11: Filter button fix
    const filterBtn = $('filter-btn');
    if (filterBtn) filterBtn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = $('filter-dropdown'), sd = $('sort-dropdown');
      if (sd) sd.hidden = true;
      if (dd) dd.hidden = !dd.hidden;
      filterBtn.setAttribute('aria-expanded', String(!dd.hidden));
    });
    const fab = $('filter-apply-btn');
    if (fab) fab.addEventListener('click', () => { applyFilters(); const dd = $('filter-dropdown'); if (dd) dd.hidden = true; $('filter-btn').setAttribute('aria-expanded', 'false'); });
    const frb = $('filter-reset-btn');
    if (frb) frb.addEventListener('click', () => {
      $$('#filter-dropdown input[type="checkbox"]').forEach(cb => cb.checked = true);
      S.filters = { ...DEF_FILTERS }; save(KEYS.FILTERS, S.filters); renderView();
    });

    // Change 11: View switcher fix
    $$('.view-switch-btn').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      $$('.view-switch-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
    }));

    // Task form
    const tf = $('task-form'); if (tf) tf.addEventListener('submit', submitTaskForm);
    const tfi = $('task-form-title');
    if (tfi) {
      let nd; tfi.addEventListener('input', () => {
        clearTimeout(nd); nd = setTimeout(() => {
          const hint = $('task-form-nlp-hint');
          if (!hint || !tfi.value || tfi.value.length < 3) { if (hint) hint.hidden = true; return; }
          const p = parseNLP(tfi.value), parts = [];
          if (p.dueDate) parts.push(`📅 ${fmtDate(p.dueDate)}`);
          if (p.dueTime) parts.push(`⏰ ${fmtTime(p.dueTime)}`);
          if (p.priority !== 'p4') parts.push(`🔴 ${p.priority.toUpperCase()}`);
          if (p.tags.length) parts.push(`🏷️ ${p.tags.map(t => '#' + t).join(' ')}`);
          if (parts.length) { hint.textContent = `Detected: ${parts.join(' • ')}`; hint.hidden = false; }
          else hint.hidden = true;
        }, 300);
      });
    }
    const tmc = $('task-modal-close'); if (tmc) tmc.addEventListener('click', closeTaskModal);
    const tfca = $('task-form-cancel-btn'); if (tfca) tfca.addEventListener('click', closeTaskModal);
    const tfd = $('task-form-delete-btn');
    if (tfd) tfd.addEventListener('click', () => { if (S.editingTaskId) showConfirm('Delete Task', 'Delete this task?', () => { deleteTask(S.editingTaskId); closeTaskModal(); }); });
    // Priority & Difficulty buttons
    $$('.priority-btn').forEach(b => b.addEventListener('click', () => { $$('.priority-btn').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-checked', 'false'); }); b.classList.add('active'); b.setAttribute('aria-checked', 'true'); }));
    $$('.difficulty-btn').forEach(b => b.addEventListener('click', () => { $$('.difficulty-btn').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-checked', 'false'); }); b.classList.add('active'); b.setAttribute('aria-checked', 'true'); }));
    // Subtask
    const sab = $('task-form-subtask-add-btn'); if (sab) sab.addEventListener('click', addFormSubtask);
    const sai = $('task-form-subtask-input'); if (sai) sai.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addFormSubtask(); } });
    // Tags input
    const tgi = $('task-form-tags');
    if (tgi) tgi.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const v = tgi.value.replace(',', '').trim().replace('#', '');
        if (v) {
          const d = $('task-form-tags-display'), existing = [];
          if (d) d.querySelectorAll('.tag-chip').forEach(c => existing.push(c.textContent.replace('✕', '').trim().replace('#', '')));
          if (!existing.includes(v)) { existing.push(v); renderFormTags(existing); }
          tgi.value = '';
        }
      }
    });
    // Task frequency toggle
    const tfr = $('task-form-frequency');
    if (tfr) tfr.addEventListener('change', () => toggleEl('task-form-custom-freq-group', tfr.value === 'custom'));

    // Project form
    const pf = $('project-form'); if (pf) pf.addEventListener('submit', submitProjectForm);
    const pmc = $('project-modal-close'); if (pmc) pmc.addEventListener('click', closeProjectModal);
    const pfca = $('project-form-cancel-btn'); if (pfca) pfca.addEventListener('click', closeProjectModal);
    const apb = $('add-project-btn'); if (apb) apb.addEventListener('click', () => openProjectModal());
    const peab = $('projects-empty-add-btn'); if (peab) peab.addEventListener('click', () => openProjectModal());
    const pbb = $('project-back-btn'); if (pbb) pbb.addEventListener('click', () => switchView('projects'));
    const peb = $('project-edit-btn'); if (peb) peb.addEventListener('click', () => { if (S.currentProjectId) openProjectModal(S.currentProjectId); });
    const pdb = $('project-delete-btn');
    if (pdb) pdb.addEventListener('click', () => { if (S.currentProjectId) showConfirm('Delete Project', 'Tasks will be unassigned. Continue?', () => deleteProject(S.currentProjectId)); });
    const pdab = $('project-detail-add-task-btn'); if (pdab) pdab.addEventListener('click', () => openTaskModal());

    // Habit form
    const hf = $('habit-form'); if (hf) hf.addEventListener('submit', submitHabitForm);
    const hmc = $('habit-modal-close'); if (hmc) hmc.addEventListener('click', closeHabitModal);
    const hfca = $('habit-form-cancel-btn'); if (hfca) hfca.addEventListener('click', closeHabitModal);
    const hfdb = $('habit-form-delete-btn');
    if (hfdb) hfdb.addEventListener('click', () => { if (S.editingHabitId) showConfirm('Delete Habit', 'Delete this habit?', () => { deleteHabit(S.editingHabitId); closeHabitModal(); }); });
    const ahb = $('add-habit-btn'); if (ahb) ahb.addEventListener('click', () => openHabitModal());
    const heab = $('habits-empty-add-btn'); if (heab) heab.addEventListener('click', () => openHabitModal());
    // Habit frequency toggle
    const hfr = $('habit-form-frequency');
    if (hfr) hfr.addEventListener('change', () => toggleEl('habit-form-custom-freq-group', hfr.value === 'custom'));
    // Habit calendar nav
    const hcp = $('habit-cal-prev');
    if (hcp) hcp.addEventListener('click', () => { S.habitCalMonth--; if (S.habitCalMonth < 0) { S.habitCalMonth = 11; S.habitCalYear--; } const h = S.habits.find(x => x.id === S.selectedHabitId); if (h) renderHabitCal(h); });
    const hcn = $('habit-cal-next');
    if (hcn) hcn.addEventListener('click', () => { S.habitCalMonth++; if (S.habitCalMonth > 11) { S.habitCalMonth = 0; S.habitCalYear++; } const h = S.habits.find(x => x.id === S.selectedHabitId); if (h) renderHabitCal(h); });

    // Focus timer
    const fsb = $('focus-start-btn'); if (fsb) fsb.addEventListener('click', toggleTimer);
    const frb2 = $('focus-reset-btn'); if (frb2) frb2.addEventListener('click', resetTimer);
    const fskb = $('focus-skip-btn'); if (fskb) fskb.addEventListener('click', skipTimer);
    $$('[data-adjust]').forEach(btn => btn.addEventListener('click', () => {
      const tgt = btn.dataset.adjust, dir = parseInt(btn.dataset.dir);
      if (tgt === 'focus-work') {
        const inp = $('focus-work-duration'); if (inp) { let v = Math.max(1, Math.min(120, parseInt(inp.value) + dir * 5)); inp.value = v; S.focus.workDuration = v; if (!S.timerRunning && S.timerMode === 'work') { S.timerSeconds = v * 60; updateTimerUI(); } save(KEYS.FOCUS, S.focus); }
      } else if (tgt === 'focus-break') {
        const inp = $('focus-break-duration'); if (inp) { let v = Math.max(1, Math.min(30, parseInt(inp.value) + dir)); inp.value = v; S.focus.breakDuration = v; if (!S.timerRunning && S.timerMode === 'break') { S.timerSeconds = v * 60; updateTimerUI(); } save(KEYS.FOCUS, S.focus); }
      }
    }));
    const fwi = $('focus-work-duration');
    if (fwi) fwi.addEventListener('change', () => { let v = Math.max(1, Math.min(120, parseInt(fwi.value) || 25)); fwi.value = v; S.focus.workDuration = v; if (!S.timerRunning && S.timerMode === 'work') { S.timerSeconds = v * 60; updateTimerUI(); } save(KEYS.FOCUS, S.focus); });
    const fbi = $('focus-break-duration');
    if (fbi) fbi.addEventListener('change', () => { let v = Math.max(1, Math.min(30, parseInt(fbi.value) || 5)); fbi.value = v; S.focus.breakDuration = v; if (!S.timerRunning && S.timerMode === 'break') { S.timerSeconds = v * 60; updateTimerUI(); } save(KEYS.FOCUS, S.focus); });

    // Calendar
    const cpb = $('calendar-prev-month'); if (cpb) cpb.addEventListener('click', () => navCalendar(-1));
    const cnb = $('calendar-next-month'); if (cnb) cnb.addEventListener('click', () => navCalendar(1));
    const ctb = $('calendar-today-btn');
    if (ctb) ctb.addEventListener('click', () => { const n = new Date(); S.calMonth = n.getMonth(); S.calYear = n.getFullYear(); renderCalendar(); });
    $$('.calendar-view-btn').forEach(btn => btn.addEventListener('click', () => {
      $$('.calendar-view-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
      const cv = btn.dataset.calview;
      const cg = $('calendar-grid'), gh = document.querySelector('.calendar-grid--header'), wv = $('calendar-week-view'), dv = $('calendar-day-view');
      if (cg) cg.hidden = cv !== 'month'; if (gh) gh.hidden = cv !== 'month';
      if (wv) wv.hidden = cv !== 'week'; if (dv) dv.hidden = cv !== 'day';
      toggleEl('calendar-heatmap-legend', cv === 'month');
    }));
    const cdpc = $('calendar-day-panel-close');
    if (cdpc) cdpc.addEventListener('click', () => { toggleEl('calendar-day-panel', false); S.selectedCalendarDate = null; renderCalendar(); });
    const cdpa = $('calendar-day-panel-add-btn'); if (cdpa) cdpa.addEventListener('click', () => openTaskModal());

    // Detail panel
    const dcc = $('task-detail-close-btn'); if (dcc) dcc.addEventListener('click', closeDetail);
    const deb = $('task-detail-edit-btn');
    if (deb) deb.addEventListener('click', () => { const tid = deb.dataset.taskId; closeDetail(); if (tid) openTaskModal(tid); });

    // Level up
    const luc = $('levelup-close-btn'); if (luc) luc.addEventListener('click', () => toggleEl('levelup-overlay', false));

    // Toast closes
    const atc = $('achievement-toast-close'); if (atc) atc.addEventListener('click', () => toggleEl('achievement-toast', false));
    const ntc = $('notification-toast-close'); if (ntc) ntc.addEventListener('click', () => toggleEl('notification-toast', false));
    const rtc = $('reward-toast-close'); if (rtc) rtc.addEventListener('click', () => toggleEl('reward-toast', false));
    const ptc = $('penalty-toast-close'); if (ptc) ptc.addEventListener('click', () => toggleEl('penalty-toast', false));

    // Shortcuts
    const skc = $('shortcuts-close'); if (skc) skc.addEventListener('click', () => toggleEl('shortcuts-overlay', false));

    // Change 4: Overdue alert buttons
    const oadb = $('overdue-alert-dismiss-btn'); if (oadb) oadb.addEventListener('click', () => toggleEl('overdue-alert-overlay', false));
    const oavb = $('overdue-alert-view-btn');
    if (oavb) oavb.addEventListener('click', () => { toggleEl('overdue-alert-overlay', false); switchView('upcoming'); });

    // Change 7: Tag modal
    const tmcl = $('tag-modal-close'); if (tmcl) tmcl.addEventListener('click', () => toggleEl('tag-modal-overlay', false));
    const tfcab = $('tag-form-cancel-btn'); if (tfcab) tfcab.addEventListener('click', () => { toggleEl('tag-modal-overlay', false); S.editingTagId = null; });
    const tfsb = $('tag-form-save-btn');
    if (tfsb) tfsb.addEventListener('click', () => {
      const name = $('tag-form-name') ? $('tag-form-name').value.trim() : '';
      if (!name) { notify('Tag name required', 'warning'); return; }
      const color = $('tag-form-color') ? $('tag-form-color').value : '#6C63FF';
      const emoji = $('tag-form-emoji') ? $('tag-form-emoji').value.trim() || '🏷️' : '🏷️';
      if (S.editingTagId) {
        updateTag(S.editingTagId, { name, color, emoji });
        notify('Tag updated!', 'success');
        S.editingTagId = null;
      } else {
        createTag({ name, color, emoji });
      }
      $('tag-form-name').value = ''; $('tag-form-emoji').value = '🏷️'; $('tag-form-id').value = '';
      setText('tag-form-save-btn', 'Add Tag');
      renderTagModal();
    });

    // Change 8: Settings class change
    $$('.settings-class-option').forEach(btn => btn.addEventListener('click', () => {
      $$('.settings-class-option').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-checked', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-checked', 'true');
      S.user.class = btn.dataset.class;
      save(KEYS.USER, S.user); renderProfile();
      notify(`Class changed to ${S.user.class}!`, 'success');
    }));

    // Settings
    const spb = $('settings-save-profile-btn');
    if (spb) spb.addEventListener('click', () => {
      const ni = $('settings-name'), ai = $('settings-avatar');
      if (ni && ni.value.trim()) S.user.name = ni.value.trim();
      if (ai) S.user.avatar = ai.value.trim();
      save(KEYS.USER, S.user); renderProfile(); notify('Profile saved!', 'success');
    });
    const stt = $('settings-theme-toggle'); if (stt) stt.addEventListener('click', toggleTheme);
    const sst = $('settings-sound-toggle'); if (sst) sst.addEventListener('click', toggleSound);
    const seb = $('settings-export-btn'); if (seb) seb.addEventListener('click', exportData);
    const sif = $('settings-import-file');
    if (sif) sif.addEventListener('change', e => { const f = e.target.files[0]; if (f) { importData(f); e.target.value = ''; } });
    const srb = $('settings-reset-btn');
    if (srb) srb.addEventListener('click', () => showConfirm('Reset All Data', 'Permanently delete everything? Cannot be undone!', resetAll));

    // Change 6: Background presets
    $$('.bg-preset').forEach(btn => btn.addEventListener('click', () => applyBackground(btn.dataset.bg)));
    const bui = $('bg-upload-input');
    if (bui) bui.addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const url = ev.target.result;
        try { localStorage.setItem('zf_bg_custom_url', url); } catch (err) { notify('Image too large for storage', 'error'); return; }
        applyBackground('custom', url);
        notify('Background updated!', 'success');
      };
      reader.readAsDataURL(file);
    });
    const brb = $('bg-remove-btn');
    if (brb) brb.addEventListener('click', () => { localStorage.removeItem('zf_bg_custom_url'); applyBackground('none'); notify('Background removed', 'info'); });

    // Change 9: Rewards
    document.addEventListener('click', e => {
      const buyBtn = e.target.closest('.reward-buy-btn');
      if (buyBtn) {
        const cost = parseInt(buyBtn.dataset.cost);
        if (spendGold(cost)) { playSound('complete'); confetti(); notify(`Reward redeemed! 🎉 (-${cost} Gold)`, 'success'); renderRewards(); }
        else notify('Not enough gold!', 'warning');
      }
    });
    const crab = $('custom-reward-add-btn');
    if (crab) crab.addEventListener('click', () => {
      const ni = $('custom-reward-name'), ci = $('custom-reward-cost'), ei = $('custom-reward-emoji');
      const name = ni ? ni.value.trim() : '', cost = ci ? parseInt(ci.value) : 0, emoji = ei ? ei.value.trim() || '🎁' : '🎁';
      if (!name || !cost || cost <= 0) { notify('Enter name and cost', 'warning'); return; }
      S.customRewards.push({ id: uid(), emoji, name, desc: 'Custom reward', cost });
      save(KEYS.CUSTOM_REWARDS, S.customRewards);
      if (ni) ni.value = ''; if (ci) ci.value = ''; if (ei) ei.value = '';
      renderRewards(); notify('Custom reward added!', 'success');
    });

    // Modal overlay click to close
    $$('.modal-overlay').forEach(ov => ov.addEventListener('click', e => {
      if (e.target === ov) { ov.hidden = true; S.editingTaskId = null; S.editingProjectId = null; S.editingHabitId = null; S.editingTagId = null; }
    }));

    // Empty state quick adds
    $$('.empty-state-action[data-action="quick-add"]').forEach(b => b.addEventListener('click', () => openTaskModal()));

    // Close dropdowns on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('#sort-btn') && !e.target.closest('#sort-dropdown')) {
        const dd = $('sort-dropdown'); if (dd) dd.hidden = true;
        const sb = $('sort-btn'); if (sb) sb.setAttribute('aria-expanded', 'false');
      }
      if (!e.target.closest('#filter-btn') && !e.target.closest('#filter-dropdown')) {
        const dd = $('filter-dropdown'); if (dd) dd.hidden = true;
        const fb = $('filter-btn'); if (fb) fb.setAttribute('aria-expanded', 'false');
      }
    });

    // Window resize
    let rsd; window.addEventListener('resize', () => { clearTimeout(rsd); rsd = setTimeout(() => { const cv = $('confetti-canvas'); if (cv) { cv.width = window.innerWidth; cv.height = window.innerHeight; } }, 250); });
    // Save on unload
    window.addEventListener('beforeunload', () => { saveAll(); if (S.timerRunning) pauseTimer(); });
  }

  // ========== INIT ==========
  function init() {
    loadAll();
    dailyReset();
    document.documentElement.setAttribute('data-theme', S.settings.theme);
    S.timerSeconds = S.focus.workDuration * 60;
    setupOnboarding();
    setupEvents();
    setupKeys();
    setupCompletedToggles();
    setupDnD();
    renderAll();

    // Change 6: restore custom background
    if (S.background === 'custom') {
      const url = localStorage.getItem('zf_bg_custom_url');
      if (url) applyBackground('custom', url);
    } else {
      applyBackground(S.background);
    }

    // Change 4: hourly reward + overdue alert
    checkHourlyReward();
    setTimeout(() => checkOverdueAlert(), 1000);

    if (S.onboarded) switchView('inbox');

    console.log('⚡ ZENFLOW v2.0 initialized');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();