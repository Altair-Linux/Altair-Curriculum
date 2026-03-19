(function () {
  "use strict";

  // ── Constants ──────────────────────────────────────────────────────────────
  var XP_PER_LESSON   = 50;
  var XP_PER_PROJECT  = 100;
  var XP_PER_EXERCISE = 30;

  var LEVELS = [
    { threshold: 0,    label: "Curious",   icon: "🌱" },
    { threshold: 100,  label: "Explorer",  icon: "🔭" },
    { threshold: 300,  label: "Builder",   icon: "🛠"  },
    { threshold: 600,  label: "Coder",     icon: "💻" },
    { threshold: 1000, label: "Engineer",  icon: "⚙️" },
    { threshold: 1500, label: "Architect", icon: "🏗"  },
    { threshold: 2200, label: "Innovator", icon: "🚀" },
    { threshold: 3000, label: "Master",    icon: "🎓" },
  ];

  var BADGES = [
    { id: "first-lesson",  label: "First Step",     icon: "👣", desc: "Complete your first lesson",    condition: function(s){ return s.completed_count >= 1; } },
    { id: "five-lessons",  label: "Getting Started", icon: "⭐", desc: "Complete 5 lessons",            condition: function(s){ return s.completed_count >= 5; } },
    { id: "ten-lessons",   label: "On a Roll",       icon: "🔥", desc: "Complete 10 lessons",           condition: function(s){ return s.completed_count >= 10; } },
    { id: "twenty-five",   label: "Dedicated",       icon: "💪", desc: "Complete 25 lessons",           condition: function(s){ return s.completed_count >= 25; } },
    { id: "fifty-lessons", label: "Century",         icon: "🏆", desc: "Complete 50 lessons",           condition: function(s){ return s.completed_count >= 50; } },
    { id: "first-project", label: "Builder",         icon: "🛠",  desc: "Complete your first project",  condition: function(s){ return s.completed_projects >= 1; } },
    { id: "level-3",       label: "Builder Rank",    icon: "🏗",  desc: "Reach Builder level",          condition: function(s){ return s.level >= 3; } },
    { id: "level-5",       label: "Engineer Rank",   icon: "⚙️", desc: "Reach Engineer level",         condition: function(s){ return s.level >= 5; } },
    { id: "level-max",     label: "Master",          icon: "🎓", desc: "Reach the highest level",      condition: function(s){ return s.level >= LEVELS.length - 1; } },
    { id: "streak-3",      label: "3-Day Streak",    icon: "📅", desc: "Learn for 3 days in a row",    condition: function(s){ return s.streak >= 3; } },
    { id: "streak-7",      label: "Week Warrior",    icon: "🗓",  desc: "Learn for 7 days in a row",   condition: function(s){ return s.streak >= 7; } },
    { id: "streak-30",     label: "Monthly",         icon: "🌟", desc: "Learn for 30 days in a row",   condition: function(s){ return s.streak >= 30; } },
  ];

  // Unlockable content catalogue
  var UNLOCKABLE_CONTENT = [
    { key: "bonus-binary-game",   type: "challenge",    label: "Binary Number Game",      desc: "A fun quiz on binary conversion.",    condition: function(s){ return s.completed_count >= 5; } },
    { key: "mini-scratch-art",    type: "mini_project", label: "Scratch Art Studio",      desc: "Create generative art in Scratch.",   condition: function(s){ return s.level >= 2; } },
    { key: "debug-master-pack",   type: "bonus_lesson", label: "Debug Master Pack",       desc: "Extra debugging challenges.",         condition: function(s){ return s.completed_count >= 10; } },
    { key: "easter-egg-history",  type: "easter_egg",   label: "CS History Trivia",       desc: "Hidden facts about computing history.", condition: function(s){ return s.streak >= 7; } },
    { key: "data-structures-pro", type: "bonus_lesson", label: "Data Structures Deep Dive", desc: "Advanced sorting and searching.",   condition: function(s){ return s.level >= 4; } },
  ];

  // Skill tree definition — mirrors curriculum sections
  var SKILL_TREE = [
    { key: "k-2",    label: "Kindergarten to Year 2", icon: "🌱", requires: [],      lessons_needed: 8  },
    { key: "3-5",    label: "Years 3 to 5",           icon: "🌿", requires: ["k-2"], lessons_needed: 8  },
    { key: "6-8",    label: "Years 6 to 8",           icon: "🔬", requires: ["3-5"], lessons_needed: 6  },
    { key: "9-12",   label: "Years 9 to 12",          icon: "🚀", requires: ["6-8"], lessons_needed: 4  },
    { key: "projects",label: "Projects",              icon: "🛠",  requires: ["3-5"], lessons_needed: 1  },
  ];

  // ── Local cache (mirrors Supabase, updated on every sync) ─────────────────
  var _cache = null;
  var _completedUrls = [];
  var _earnedBadgeIds = [];
  var _skillStatus = {};
  var _unlockedContent = [];
  var _syncPending = false;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getClient() {
    var auth = window.__ALTAIR_AUTH__;
    if (!auth || !auth.isLoggedIn()) return null;
    var url = window.__SUPABASE_URL__;
    var key = window.__SUPABASE_ANON_KEY__;
    if (!url || !key) return null;
    if (typeof supabase === "undefined") return null;
    return supabase.createClient(url, key, { auth: { persistSession: true } });
  }

  function levelForXP(xp) {
    var lvl = 0;
    for (var i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].threshold) { lvl = i; break; }
    }
    return lvl;
  }

  function progressInLevel(xp, level) {
    var current = LEVELS[level].threshold;
    var next = LEVELS[level + 1] ? LEVELS[level + 1].threshold : null;
    if (!next) return 100;
    return Math.min(100, ((xp - current) / (next - current)) * 100);
  }

  function xpForType(type) {
    if (type === "project")  return XP_PER_PROJECT;
    if (type === "exercise") return XP_PER_EXERCISE;
    return XP_PER_LESSON;
  }

  function inferType(url) {
    var u = (url || "").toLowerCase();
    if (u.includes("/project"))  return "project";
    if (u.includes("/exercise")) return "exercise";
    return "lesson";
  }

  function inferLessonId(url) {
    var nav = window.__NAV_JSON__ || {};
    for (var section in nav) {
      var pages = nav[section] || [];
      for (var i = 0; i < pages.length; i++) {
        if (pages[i].url === url) return pages[i].id || null;
      }
    }
    return null;
  }

  function esc(str) {
    return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  // ── Supabase sync ──────────────────────────────────────────────────────────
  function syncFromSupabase() {
    var client = getClient();
    var auth   = window.__ALTAIR_AUTH__;
    if (!client || !auth) return Promise.resolve();

    var uid = auth.getSession() && auth.getSession().user && auth.getSession().user.id;
    if (!uid) return Promise.resolve();

    return Promise.all([
      client.from("user_progress").select("*").eq("user_id", uid).single(),
      client.from("completed_lessons").select("lesson_url").eq("user_id", uid),
      client.from("earned_badges").select("badge_id").eq("user_id", uid),
      client.from("skill_progress").select("skill_key, status").eq("user_id", uid),
      client.from("unlocked_content").select("content_key").eq("user_id", uid),
    ]).then(function(results) {
      var progress  = results[0].data;
      var completed = results[1].data || [];
      var badges    = results[2].data || [];
      var skills    = results[3].data || [];
      var unlocks   = results[4].data || [];

      _cache = progress || { xp: 0, level: 0, completed_count: 0, completed_projects: 0, streak: 0, best_streak: 0 };
      _completedUrls  = completed.map(function(r){ return r.lesson_url; });
      _earnedBadgeIds = badges.map(function(r){ return r.badge_id; });
      _skillStatus    = {};
      skills.forEach(function(r){ _skillStatus[r.skill_key] = r.status; });
      _unlockedContent = unlocks.map(function(r){ return r.content_key; });
    }).catch(function(e) {
      console.warn("Gamification sync failed:", e.message);
    });
  }

  // ── Unlock checks (run after every completion) ─────────────────────────────
  function checkUnlocks() {
    if (!_cache) return Promise.resolve();
    var client = getClient();
    var auth   = window.__ALTAIR_AUTH__;
    if (!client || !auth) return Promise.resolve();
    var uid = auth.getSession() && auth.getSession().user && auth.getSession().user.id;
    if (!uid) return Promise.resolve();

    var state = _cache;
    var toUnlock = [];

    UNLOCKABLE_CONTENT.forEach(function(c) {
      if (!_unlockedContent.includes(c.key) && c.condition(state)) {
        toUnlock.push({ user_id: uid, content_key: c.key, content_type: c.type });
      }
    });

    if (toUnlock.length === 0) return Promise.resolve();

    return client.from("unlocked_content").insert(toUnlock).then(function() {
      toUnlock.forEach(function(r) {
        _unlockedContent.push(r.content_key);
        var content = UNLOCKABLE_CONTENT.find(function(c){ return c.key === r.content_key; });
        if (content) {
          showBadgePopup({ icon: "🔓", label: "Unlocked: " + content.label, desc: content.desc });
        }
      });
    }).catch(function(){});
  }

  function checkSkillUnlocks() {
    if (!_cache) return Promise.resolve();
    var client = getClient();
    var auth   = window.__ALTAIR_AUTH__;
    if (!client || !auth) return Promise.resolve();
    var uid = auth.getSession() && auth.getSession().user && auth.getSession().user.id;
    if (!uid) return Promise.resolve();

    var nav = window.__NAV_JSON__ || {};
    var promises = [];

    SKILL_TREE.forEach(function(skill) {
      var current = _skillStatus[skill.key] || "locked";
      if (current === "locked") {
        // Check prerequisites
        var prereqsMet = skill.requires.every(function(req) {
          return (_skillStatus[req] || "locked") === "completed";
        });
        // For k-2 (first node), always unlock
        if (skill.requires.length === 0 || prereqsMet) {
          var p = client.from("skill_progress").upsert({
            user_id: uid, skill_key: skill.key, status: "unlocked", unlocked_at: new Date().toISOString()
          }, { onConflict: "user_id,skill_key" }).then(function() {
            _skillStatus[skill.key] = "unlocked";
          }).catch(function(){});
          promises.push(p);
        }
      }
      if (current !== "completed") {
        // Check if skill is completed (enough lessons done in this section)
        var sectionLessons = (nav[skill.key] || []).filter(function(p){ return p.type === "lesson" || !p.type; });
        var completed = sectionLessons.filter(function(p){ return _completedUrls.includes(p.url); });
        if (completed.length >= skill.lessons_needed) {
          var p2 = client.from("skill_progress").upsert({
            user_id: uid, skill_key: skill.key, status: "completed", completed_at: new Date().toISOString()
          }, { onConflict: "user_id,skill_key" }).then(function() {
            _skillStatus[skill.key] = "completed";
            showBadgePopup({ icon: skill.icon, label: skill.label + " completed!", desc: "Skill tree node unlocked." });
          }).catch(function(){});
          promises.push(p2);
        }
      }
    });

    return Promise.all(promises);
  }

  // ── Badge sync ─────────────────────────────────────────────────────────────
  function checkAndSyncBadges() {
    if (!_cache) return Promise.resolve();
    var client = getClient();
    var auth   = window.__ALTAIR_AUTH__;
    if (!client || !auth) return Promise.resolve();
    var uid = auth.getSession() && auth.getSession().user && auth.getSession().user.id;
    if (!uid) return Promise.resolve();

    var newBadges = [];
    BADGES.forEach(function(badge) {
      if (!_earnedBadgeIds.includes(badge.id) && badge.condition(_cache)) {
        newBadges.push({ user_id: uid, badge_id: badge.id });
        _earnedBadgeIds.push(badge.id);
      }
    });

    if (newBadges.length === 0) return Promise.resolve();
    return client.from("earned_badges").insert(newBadges).then(function() {
      var delay = 0;
      newBadges.forEach(function(b) {
        var badge = BADGES.find(function(bd){ return bd.id === b.badge_id; });
        if (badge) { setTimeout(function(){ showBadgePopup(badge); }, delay); delay += 4500; }
      });
    }).catch(function(){});
  }

  // ── Core: complete a lesson ────────────────────────────────────────────────
  function complete(url) {
    if (_completedUrls.includes(url)) return 0;

    var type    = inferType(url);
    var xpGain  = xpForType(type);
    var lessonId = inferLessonId(url);
    var client  = getClient();
    var auth    = window.__ALTAIR_AUTH__;

    // Optimistic local update
    _completedUrls.push(url);
    if (_cache) {
      _cache.xp               = (_cache.xp || 0) + xpGain;
      _cache.completed_count  = (_cache.completed_count || 0) + 1;
      if (type === "project") _cache.completed_projects = (_cache.completed_projects || 0) + 1;
      _cache.level = levelForXP(_cache.xp);
    }

    // Persist to Supabase
    if (client && auth && auth.isLoggedIn()) {
      var uid = auth.getSession().user.id;
      client.rpc("record_lesson_completion", {
        p_user_id:    uid,
        p_lesson_url: url,
        p_lesson_id:  lessonId,
        p_xp:         xpGain,
      }).then(function(res) {
        var data = res.data;
        if (data) {
          if (data.leveled_up) {
            var lvl = LEVELS[_cache.level];
            window.showToast && window.showToast("Level up! " + lvl.icon + " " + lvl.label, "xp");
          }
          if (data.new_streak > 1) {
            window.showToast && window.showToast("🔥 " + data.new_streak + " day streak!", "xp");
          }
        }
        // Re-sync canonical state then run unlock checks
        return syncFromSupabase();
      }).then(function() {
        return checkAndSyncBadges();
      }).then(function() {
        return checkSkillUnlocks();
      }).then(function() {
        return checkUnlocks();
      }).catch(function(e) {
        console.warn("Completion sync error:", e.message);
      });
    }

    return xpGain;
  }

  function uncomplete(url) {
    var idx = _completedUrls.indexOf(url);
    if (idx === -1) return;
    _completedUrls.splice(idx, 1);
    if (_cache) {
      var xpLoss = xpForType(inferType(url));
      _cache.xp = Math.max(0, (_cache.xp || 0) - xpLoss);
      _cache.completed_count = Math.max(0, (_cache.completed_count || 0) - 1);
      _cache.level = levelForXP(_cache.xp);
    }
    // Note: we do not delete from Supabase on uncomplete — this prevents XP farming.
    // The uncomplete is local/visual only. A page reload will restore the completed state.
  }

  function isComplete(url) { return _completedUrls.includes(url); }

  // ── Lesson unlock logic ────────────────────────────────────────────────────
  function isLessonUnlocked(lesson) {
    if (!lesson) return false;
    var nav = window.__NAV_JSON__ || {};
    // Find the section this lesson belongs to
    var section = null;
    for (var k in nav) {
      if ((nav[k] || []).find(function(p){ return p.url === lesson.url; })) { section = k; break; }
    }
    if (!section) return true;

    // Skill must be unlocked
    var skillSt = _skillStatus[section] || "locked";
    if (skillSt === "locked") return false;

    // Sequential unlock: the previous lesson in the section must be complete
    var sectionPages = (nav[section] || [])
      .filter(function(p){ return p.type === "lesson" || !p.type; })
      .sort(function(a,b){ return (a.sequence_position||999)-(b.sequence_position||999); });

    var idx = sectionPages.findIndex(function(p){ return p.url === lesson.url; });
    if (idx <= 0) return true; // First lesson always unlocked if skill is unlocked
    var prev = sectionPages[idx - 1];
    return _completedUrls.includes(prev.url);
  }

  // ── State getter ───────────────────────────────────────────────────────────
  function getState() {
    var s = _cache || { xp: 0, level: 0, completed_count: 0, completed_projects: 0, streak: 0, best_streak: 0 };
    return {
      xp:                 s.xp || 0,
      level:              s.level || 0,
      levelLabel:         LEVELS[s.level] ? LEVELS[s.level].label : "Curious",
      levelIcon:          LEVELS[s.level] ? LEVELS[s.level].icon  : "🌱",
      nextLevelThreshold: LEVELS[(s.level||0) + 1] ? LEVELS[(s.level||0) + 1].threshold : null,
      progress:           progressInLevel(s.xp || 0, s.level || 0),
      completedCount:     s.completed_count || 0,
      completed_count:    s.completed_count || 0,
      completed_projects: s.completed_projects || 0,
      streak:             s.streak || 0,
      best_streak:        s.best_streak || 0,
      earnedBadges:       BADGES.filter(function(b){ return _earnedBadgeIds.includes(b.id); }),
      skillStatus:        _skillStatus,
      unlockedContent:    _unlockedContent,
    };
  }

  // ── Leaderboard ────────────────────────────────────────────────────────────
  function loadLeaderboard(limit) {
    var client = getClient();
    if (!client) return Promise.reject(new Error("Not authenticated"));
    limit = limit || 20;
    return client
      .from("leaderboard")
      .select("user_id, display_name, xp, level, completed_count, streak, xp_rank")
      .order("xp_rank", { ascending: true })
      .limit(limit)
      .then(function(res) {
        if (res.error) throw res.error;
        return res.data || [];
      });
  }

  // ── Badge popup ────────────────────────────────────────────────────────────
  function showBadgePopup(badge) {
    var existing = document.querySelector(".badge-popup");
    if (existing) existing.remove();
    var popup = document.createElement("div");
    popup.className = "badge-popup";
    popup.setAttribute("role", "status");
    popup.setAttribute("aria-live", "polite");
    popup.innerHTML =
      '<span class="badge-emoji" aria-hidden="true">' + esc(badge.icon) + "</span>" +
      '<div class="badge-name">Badge Unlocked: ' + esc(badge.label) + "</div>" +
      '<div class="badge-desc">' + esc(badge.desc) + "</div>";
    document.body.appendChild(popup);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { popup.classList.add("is-visible"); });
    });
    setTimeout(function() {
      popup.classList.remove("is-visible");
      popup.addEventListener("transitionend", function(){ popup.remove(); }, { once: true });
    }, 4000);
  }

  // ── Streak display ─────────────────────────────────────────────────────────
  function renderStreakWidget(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var s = getState();
    el.innerHTML =
      '<div class="streak-widget" aria-label="Learning streak">' +
        '<div class="streak-fire" aria-hidden="true">🔥</div>' +
        '<div class="streak-info">' +
          '<div class="streak-count">' + s.streak + '</div>' +
          '<div class="streak-label">day streak</div>' +
        '</div>' +
        '<div class="streak-best">Best: ' + s.best_streak + '</div>' +
      '</div>';
  }

  // ── Skill tree render ──────────────────────────────────────────────────────
  function renderSkillTree(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var html = '<div class="skill-tree" role="list" aria-label="Skill tree">';
    SKILL_TREE.forEach(function(skill) {
      var status = _skillStatus[skill.key] || "locked";
      var cls = "skill-node skill-" + status;
      var label = status === "locked" ? "Locked" : status === "completed" ? "Completed" : "In progress";
      var nav = window.__NAV_JSON__ || {};
      var total = (nav[skill.key] || []).filter(function(p){ return p.type==="lesson"||!p.type; }).length;
      var done  = (nav[skill.key] || []).filter(function(p){ return _completedUrls.includes(p.url); }).length;
      html +=
        '<div class="' + cls + '" role="listitem" aria-label="' + esc(skill.label) + ': ' + label + '">' +
          '<div class="skill-icon" aria-hidden="true">' + esc(skill.icon) + "</div>" +
          '<div class="skill-name">' + esc(skill.label) + "</div>" +
          '<div class="skill-progress-label">' + done + " / " + total + " lessons</div>" +
          '<div class="skill-status-label">' + label + "</div>" +
          (status !== "locked"
            ? '<div class="skill-bar"><div class="skill-bar-fill" style="width:' + (total ? Math.round((done/total)*100) : 0) + '%"></div></div>'
            : '<div class="skill-lock-icon" aria-hidden="true">🔒</div>') +
        "</div>";
      // connector arrow (except after last)
      if (skill !== SKILL_TREE[SKILL_TREE.length - 1]) {
        html += '<div class="skill-connector" aria-hidden="true">↓</div>';
      }
    });
    html += "</div>";
    el.innerHTML = html;
  }

  // ── Profile widget (updated to include streak) ─────────────────────────────
  function renderProfileWidget(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var s   = getState();
    var lvl = LEVELS[s.level] || LEVELS[0];
    container.innerHTML =
      '<div class="profile-widget">' +
        '<div class="profile-level-icon" aria-hidden="true">' + esc(lvl.icon) + "</div>" +
        '<div class="profile-info">' +
          '<div class="profile-level-label">' + esc(lvl.label) + "</div>" +
          '<div class="profile-xp">' + s.xp + " XP</div>" +
          '<div class="progress-bar-inline" role="progressbar" aria-valuenow="' + Math.round(s.progress) + '" aria-valuemin="0" aria-valuemax="100" aria-label="Level progress">' +
            '<div class="progress-bar-fill" style="width:' + s.progress.toFixed(1) + '%;"></div>' +
          "</div>" +
        "</div>" +
        '<div class="profile-stats">' +
          '<div class="profile-stat"><strong>' + s.completedCount + "</strong><span>Lessons</span></div>" +
          '<div class="profile-stat"><strong>🔥 ' + s.streak + "</strong><span>Streak</span></div>" +
          '<div class="profile-stat"><strong>' + s.earnedBadges.length + "</strong><span>Badges</span></div>" +
        "</div>" +
      "</div>";
  }

  // ── Lesson lock overlay (inject into lesson pages) ──────────────────────────
  function applyLessonLocks() {
    var nav = window.__NAV_JSON__ || {};
    var currentUrl = window.__CURRENT_URL__ || "";
    var lesson = null;
    for (var k in nav) {
      var found = (nav[k]||[]).find(function(p){ return p.url === currentUrl; });
      if (found) { lesson = found; break; }
    }
    if (!lesson) return;

    var unlocked = isLessonUnlocked(lesson);
    var article  = document.querySelector(".lesson-article");
    if (!article) return;

    if (!unlocked) {
      var overlay = document.createElement("div");
      overlay.className = "lesson-locked-overlay";
      overlay.setAttribute("role", "alert");
      overlay.setAttribute("aria-live", "polite");
      overlay.innerHTML =
        '<div class="lesson-locked-inner">' +
          '<div class="lesson-locked-icon" aria-hidden="true">🔒</div>' +
          '<h2 class="lesson-locked-title">Lesson Locked</h2>' +
          '<p class="lesson-locked-msg">Complete the previous lesson to unlock this one.</p>' +
        "</div>";
      article.style.position = "relative";
      article.appendChild(overlay);

      var completeBtn = document.querySelector(".mark-complete-btn");
      if (completeBtn) { completeBtn.disabled = true; completeBtn.setAttribute("aria-disabled", "true"); }
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  function boot() {
    var auth = window.__ALTAIR_AUTH__;
    if (!auth) { setTimeout(boot, 200); return; }

    if (auth.isLoggedIn()) {
      syncFromSupabase().then(function() {
        checkSkillUnlocks().then(function() {
          applyLessonLocks();
          renderProfileWidget("profile-widget-container");
          renderStreakWidget("streak-widget-container");
        });
      });
    } else {
      applyLessonLocks();
    }

    auth.onChange(function() {
      if (auth.isLoggedIn()) {
        syncFromSupabase().then(function() {
          checkSkillUnlocks().then(function() {
            applyLessonLocks();
            renderProfileWidget("profile-widget-container");
            renderStreakWidget("streak-widget-container");
          });
        });
      } else {
        _cache = null;
        _completedUrls = [];
        _earnedBadgeIds = [];
        _skillStatus = {};
        _unlockedContent = [];
      }
    });
  }

  document.addEventListener("DOMContentLoaded", boot);

  // ── Public API (backward-compatible with existing lesson.js calls) ──────────
  window.__GAMIFICATION__ = {
    complete:            complete,
    uncomplete:          uncomplete,
    isComplete:          isComplete,
    getState:            getState,
    isLessonUnlocked:    isLessonUnlocked,
    loadLeaderboard:     loadLeaderboard,
    renderProfileWidget: renderProfileWidget,
    renderStreakWidget:  renderStreakWidget,
    renderSkillTree:     renderSkillTree,
    BADGES:              BADGES,
    LEVELS:              LEVELS,
    SKILL_TREE:          SKILL_TREE,
    UNLOCKABLE_CONTENT:  UNLOCKABLE_CONTENT,
    reset: function() { _cache = null; _completedUrls = []; _earnedBadgeIds = []; _skillStatus = {}; _unlockedContent = []; },
  };
})();
