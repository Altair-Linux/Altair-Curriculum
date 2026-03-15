(function () {
  const STORAGE_KEY = "altair-gamification-v1";

  const XP_PER_LESSON = 50;
  const XP_PER_PROJECT = 100;
  const XP_PER_EXERCISE = 30;

  const LEVELS = [
    { threshold: 0,    label: "Curious",    icon: "🌱" },
    { threshold: 100,  label: "Explorer",   icon: "🔭" },
    { threshold: 300,  label: "Builder",    icon: "🛠" },
    { threshold: 600,  label: "Coder",      icon: "💻" },
    { threshold: 1000, label: "Engineer",   icon: "⚙️" },
    { threshold: 1500, label: "Architect",  icon: "🏗" },
    { threshold: 2200, label: "Innovator",  icon: "🚀" },
    { threshold: 3000, label: "Master",     icon: "🎓" },
  ];

  const BADGES = [
    { id: "first-lesson",   label: "First Step",     icon: "👣", desc: "Complete your first lesson",          condition: (s) => s.completedCount >= 1 },
    { id: "five-lessons",   label: "Getting Started", icon: "⭐", desc: "Complete 5 lessons",                condition: (s) => s.completedCount >= 5 },
    { id: "ten-lessons",    label: "On a Roll",       icon: "🔥", desc: "Complete 10 lessons",               condition: (s) => s.completedCount >= 10 },
    { id: "twenty-five",    label: "Dedicated",       icon: "💪", desc: "Complete 25 lessons",               condition: (s) => s.completedCount >= 25 },
    { id: "fifty-lessons",  label: "Century",         icon: "🏆", desc: "Complete 50 lessons",               condition: (s) => s.completedCount >= 50 },
    { id: "first-project",  label: "Builder",         icon: "🛠", desc: "Complete your first project",       condition: (s) => s.completedProjects >= 1 },
    { id: "five-projects",  label: "Maker",           icon: "🔨", desc: "Complete 5 projects",               condition: (s) => s.completedProjects >= 5 },
    { id: "level-3",        label: "Builder Rank",    icon: "🏗", desc: "Reach Builder level",               condition: (s) => s.level >= 3 },
    { id: "level-5",        label: "Engineer Rank",   icon: "⚙️", desc: "Reach Engineer level",             condition: (s) => s.level >= 5 },
    { id: "level-max",      label: "Master",          icon: "🎓", desc: "Reach the highest level",           condition: (s) => s.level >= LEVELS.length - 1 },
    { id: "streak-3",       label: "3-Day Streak",    icon: "📅", desc: "Learn for 3 days in a row",         condition: (s) => s.streak >= 3 },
    { id: "streak-7",       label: "Week Warrior",    icon: "🗓", desc: "Learn for 7 days in a row",         condition: (s) => s.streak >= 7 },
  ];

  function defaultState() {
    return {
      xp: 0,
      level: 0,
      completedUrls: [],
      completedCount: 0,
      completedProjects: 0,
      earnedBadgeIds: [],
      streak: 0,
      lastActiveDate: null,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
    } catch {
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function levelForXP(xp) {
    let lvl = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].threshold) { lvl = i; break; }
    }
    return lvl;
  }

  function progressInLevel(xp, level) {
    const current = LEVELS[level].threshold;
    const next = LEVELS[level + 1]?.threshold;
    if (!next) return 100;
    return Math.min(100, ((xp - current) / (next - current)) * 100);
  }

  function xpForType(type) {
    if (type === "project") return XP_PER_PROJECT;
    if (type === "exercise") return XP_PER_EXERCISE;
    return XP_PER_LESSON;
  }

  function updateStreak(state) {
    const today = new Date().toISOString().slice(0, 10);
    if (!state.lastActiveDate) {
      state.streak = 1;
      state.lastActiveDate = today;
      return;
    }

    const last = new Date(state.lastActiveDate);
    const now = new Date(today);
    const diffDays = Math.round((now - last) / 86400000);

    if (diffDays === 0) return;
    if (diffDays === 1) { state.streak += 1; }
    else { state.streak = 1; }
    state.lastActiveDate = today;
  }

  function checkBadges(state) {
    const newBadges = [];
    for (const badge of BADGES) {
      if (!state.earnedBadgeIds.includes(badge.id) && badge.condition(state)) {
        state.earnedBadgeIds.push(badge.id);
        newBadges.push(badge);
      }
    }
    return newBadges;
  }

  function showBadgePopup(badge) {
    const existing = document.querySelector(".badge-popup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.className = "badge-popup";
    popup.setAttribute("role", "status");
    popup.setAttribute("aria-live", "polite");
    popup.innerHTML = `
      <span class="badge-emoji" aria-hidden="true">${badge.icon}</span>
      <div class="badge-name">Badge Unlocked: ${badge.label}</div>
      <div class="badge-desc">${badge.desc}</div>
    `;
    document.body.appendChild(popup);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => popup.classList.add("is-visible"));
    });

    setTimeout(() => {
      popup.classList.remove("is-visible");
      popup.addEventListener("transitionend", () => popup.remove(), { once: true });
    }, 4000);
  }

  function complete(url) {
    const state = load();

    if (state.completedUrls.includes(url)) return 0;

    const type = inferType(url);
    const xpGain = xpForType(type);

    state.completedUrls.push(url);
    state.completedCount += 1;
    if (type === "project") state.completedProjects += 1;
    state.xp += xpGain;

    const oldLevel = state.level;
    state.level = levelForXP(state.xp);

    updateStreak(state);

    const newBadges = checkBadges(state);
    save(state);

    if (state.level > oldLevel) {
      const lvl = LEVELS[state.level];
      window.showToast?.("Level up! " + lvl.icon + " " + lvl.label, "xp");
    }

    if (newBadges.length > 0) {
      let delay = state.level > oldLevel ? 2500 : 0;
      newBadges.forEach((badge) => {
        setTimeout(() => showBadgePopup(badge), delay);
        delay += 4500;
      });
    }

    return xpGain;
  }

  function uncomplete(url) {
    const state = load();
    const idx = state.completedUrls.indexOf(url);
    if (idx === -1) return;

    const type = inferType(url);
    const xpLoss = xpForType(type);

    state.completedUrls.splice(idx, 1);
    state.completedCount = Math.max(0, state.completedCount - 1);
    if (type === "project") state.completedProjects = Math.max(0, state.completedProjects - 1);
    state.xp = Math.max(0, state.xp - xpLoss);
    state.level = levelForXP(state.xp);

    save(state);
  }

  function isComplete(url) {
    return load().completedUrls.includes(url);
  }

  function getState() {
    const state = load();
    return {
      xp: state.xp,
      level: state.level,
      levelLabel: LEVELS[state.level]?.label || "",
      levelIcon: LEVELS[state.level]?.icon || "",
      nextLevelThreshold: LEVELS[state.level + 1]?.threshold || null,
      progress: progressInLevel(state.xp, state.level),
      completedCount: state.completedCount,
      earnedBadges: BADGES.filter((b) => state.earnedBadgeIds.includes(b.id)),
      streak: state.streak,
    };
  }

  function inferType(url) {
    const u = url.toLowerCase();
    if (u.includes("/project")) return "project";
    if (u.includes("/exercise")) return "exercise";
    return "lesson";
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function renderProfileWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const state = getState();
    const lvl = LEVELS[state.level];

    container.innerHTML = `
      <div class="profile-widget">
        <div class="profile-level-icon" aria-hidden="true">${lvl.icon}</div>
        <div class="profile-info">
          <div class="profile-level-label">${lvl.label}</div>
          <div class="profile-xp">${state.xp} XP</div>
          <div class="progress-bar-inline" role="progressbar" aria-valuenow="${Math.round(state.progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Level progress">
            <div class="progress-bar-fill" style="width:${state.progress.toFixed(1)}%"></div>
          </div>
        </div>
        <div class="profile-stats">
          <div class="profile-stat"><strong>${state.completedCount}</strong><span>Lessons</span></div>
          <div class="profile-stat"><strong>${state.streak}</strong><span>Streak</span></div>
          <div class="profile-stat"><strong>${state.earnedBadges.length}</strong><span>Badges</span></div>
        </div>
      </div>
    `;
  }

  window.__GAMIFICATION__ = { complete, uncomplete, isComplete, getState, reset, renderProfileWidget, BADGES, LEVELS };
})();
