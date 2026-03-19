(function () {
  "use strict";

  // ── Configuration ─────────────────────────────────────────────────────────
  // These values are replaced at build time by generate.js reading .env.
  // They are safe to expose in browser code because Row Level Security
  // controls what the anon key can access.
  var SUPABASE_URL      = window.__SUPABASE_URL__      || "";
  var SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || "";

  var _client = null;

  function getClient() {
    if (_client) return _client;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn("Altair Auth: Supabase config missing. Auth features disabled.");
      return null;
    }
    if (typeof supabase === "undefined" || typeof supabase.createClient !== "function") {
      console.warn("Altair Auth: Supabase CDN script not yet loaded.");
      return null;
    }
    _client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    return _client;
  }

  // ── Internal state ─────────────────────────────────────────────────────────
  var _session  = null;
  var _profile  = null;
  var _listeners = [];

  function notify() {
    _listeners.forEach(function (fn) { try { fn(_session, _profile); } catch (e) {} });
  }

  // ── Profile fetch ──────────────────────────────────────────────────────────
  function fetchProfile(userId) {
    var client = getClient();
    if (!client || !userId) return Promise.resolve(null);
    return client
      .from("profiles")
      .select("id, email, display_name, role, account_status")
      .eq("id", userId)
      .single()
      .then(function (res) {
        if (res.error) {
          console.warn("Altair Auth: profile fetch error", res.error.message);
          return null;
        }
        return res.data;
      });
  }

  // ── Session initialisation ─────────────────────────────────────────────────
  function init() {
    var client = getClient();
    if (!client) return;

    client.auth.getSession().then(function (res) {
      _session = res.data && res.data.session ? res.data.session : null;
      if (_session) {
        fetchProfile(_session.user.id).then(function (profile) {
          _profile = profile;
          notify();
          renderAuthUI();
        });
      } else {
        renderAuthUI();
      }
    });

    client.auth.onAuthStateChange(function (event, session) {
      _session = session;
      if (session) {
        fetchProfile(session.user.id).then(function (profile) {
          _profile = profile;
          notify();
          renderAuthUI();
        });
      } else {
        _profile = null;
        notify();
        renderAuthUI();
      }
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  function signUp(email, password, displayName) {
    var client = getClient();
    if (!client) return Promise.reject(new Error("Auth not configured."));
    return client.auth.signUp({
      email: email,
      password: password,
      options: { data: { display_name: displayName || "" } },
    }).then(function (res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  function signIn(email, password) {
    var client = getClient();
    if (!client) return Promise.reject(new Error("Auth not configured."));
    return client.auth.signInWithPassword({ email: email, password: password })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
  }

  function signOut() {
    var client = getClient();
    if (!client) return Promise.resolve();
    return client.auth.signOut();
  }

  function getSession()  { return _session; }
  function getProfile()  { return _profile; }
  function getRole()     { return _profile ? _profile.role : null; }
  function isLoggedIn()  { return !!_session; }

  function hasRole(role) {
    var LEVELS = { student: 0, teacher: 1, school_admin: 2, moderator: 3, superadmin: 4 };
    var current = getRole();
    if (!current) return false;
    return (LEVELS[current] || 0) >= (LEVELS[role] || 0);
  }

  function onChange(fn) { _listeners.push(fn); }

  // ── Moderation queue helpers ───────────────────────────────────────────────
  function submitToQueue(type, payload, schoolId) {
    var client = getClient();
    if (!client || !_session) return Promise.reject(new Error("Must be logged in."));
    var entry = {
      submission_type: type,
      submitted_by: _session.user.id,
      payload: payload || {},
      status: "pending",
    };
    if (schoolId) entry.school_id = schoolId;
    return client.from("moderation_queue").insert(entry).then(function (res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  function claimSchool(schoolId, evidenceUrl, evidenceNotes) {
    var client = getClient();
    if (!client || !_session) return Promise.reject(new Error("Must be logged in."));
    var claim = {
      school_id: schoolId,
      claimant_id: _session.user.id,
      evidence_url: evidenceUrl || null,
      evidence_notes: evidenceNotes || null,
      status: "pending",
    };
    return client.from("ownership_claims").insert(claim).then(function (res) {
      if (res.error) throw res.error;
      return submitToQueue("ownership_claim", { school_id: schoolId, evidence_url: evidenceUrl, notes: evidenceNotes }, schoolId);
    });
  }

  function loadQueue(filters) {
    var client = getClient();
    if (!client || !hasRole("moderator")) return Promise.reject(new Error("Insufficient role."));
    var query = client
      .from("moderation_queue")
      .select("*, profiles!submitted_by(email, display_name, role)")
      .order("created_at", { ascending: false });
    if (filters && filters.status)          query = query.eq("status", filters.status);
    if (filters && filters.submission_type) query = query.eq("submission_type", filters.submission_type);
    return query.then(function (res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  function reviewQueueItem(itemId, newStatus, note) {
    var client = getClient();
    if (!client || !hasRole("moderator")) return Promise.reject(new Error("Insufficient role."));
    return client.from("moderation_queue").update({
      status: newStatus,
      moderator_id: _session.user.id,
      moderator_note: note || null,
      reviewed_at: new Date().toISOString(),
    }).eq("id", itemId).then(function (res) {
      if (res.error) throw res.error;
      return client.rpc("log_action", {
        p_actor_id: _session.user.id,
        p_action: "queue_review_" + newStatus,
        p_target_type: "moderation_queue",
        p_target_id: itemId,
        p_metadata: { status: newStatus, note: note || null },
      });
    });
  }

  function loadSchools(filters) {
    var client = getClient();
    if (!client) return Promise.reject(new Error("Auth not configured."));
    var query = client
      .from("schools")
      .select("id, name, country, type, curriculum_usage, description, website, featured, badge, verification_status")
      .eq("verification_status", "verified")
      .order("name", { ascending: true });
    return query.then(function (res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  function submitNewSchool(schoolData) {
    if (!_session) return Promise.reject(new Error("Must be logged in."));
    return submitToQueue("new_school", schoolData, null);
  }

  // ── Auth modal UI ──────────────────────────────────────────────────────────
  function renderAuthUI() {
    var btn = document.getElementById("auth-btn");
    var userMenu = document.getElementById("auth-user-menu");
    if (!btn && !userMenu) return;

    if (_session && _profile) {
      if (btn) {
        btn.textContent = _profile.display_name || _profile.email || "Account";
        btn.setAttribute("aria-label", "Account menu");
        btn.classList.add("auth-logged-in");
      }
      if (userMenu) {
        userMenu.innerHTML =
          '<div class="auth-menu-name">' + esc(_profile.display_name || _profile.email) + "</div>" +
          '<div class="auth-menu-role">' + esc(_profile.role || "student") + "</div>" +
          (hasRole("moderator") ? '<a class="auth-menu-link" href="' + ROOT + 'moderation/index.html">Moderation queue</a>' : "") +
          '<button class="auth-menu-signout" id="auth-signout-btn">Sign out</button>';
        document.getElementById("auth-signout-btn") &&
          document.getElementById("auth-signout-btn").addEventListener("click", function () {
            signOut().then(function () { window.location.reload(); });
          });
      }
    } else {
      if (btn) {
        btn.textContent = "Sign in";
        btn.setAttribute("aria-label", "Sign in or create account");
        btn.classList.remove("auth-logged-in");
      }
      if (userMenu) userMenu.innerHTML = "";
    }
  }

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var ROOT = window.__RELATIVE_ROOT__ || "./";

  // ── Modal open/close ───────────────────────────────────────────────────────
  function openAuthModal(tab) {
    var modal = document.getElementById("auth-modal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (tab === "signup") showTab("signup");
    else showTab("signin");
    var firstInput = modal.querySelector("input");
    if (firstInput) requestAnimationFrame(function () { firstInput.focus(); });
  }

  function closeAuthModal() {
    var modal = document.getElementById("auth-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    clearFormMessages();
  }

  function showTab(tab) {
    var signin = document.getElementById("auth-tab-signin");
    var signup = document.getElementById("auth-tab-signup");
    var btnSignin = document.getElementById("auth-tabBtn-signin");
    var btnSignup = document.getElementById("auth-tabBtn-signup");
    if (!signin || !signup) return;
    if (tab === "signup") {
      signin.hidden = true; signup.hidden = false;
      if (btnSignin) { btnSignin.classList.remove("active"); btnSignin.setAttribute("aria-selected", "false"); }
      if (btnSignup) { btnSignup.classList.add("active"); btnSignup.setAttribute("aria-selected", "true"); }
    } else {
      signin.hidden = false; signup.hidden = true;
      if (btnSignin) { btnSignin.classList.add("active"); btnSignin.setAttribute("aria-selected", "true"); }
      if (btnSignup) { btnSignup.classList.remove("active"); btnSignup.setAttribute("aria-selected", "false"); }
    }
  }

  function setFormMessage(formId, msg, isError) {
    var el = document.getElementById(formId + "-msg");
    if (!el) return;
    el.textContent = msg;
    el.className = "auth-msg " + (isError ? "auth-msg-error" : "auth-msg-success");
    el.hidden = !msg;
  }

  function clearFormMessages() {
    ["signin", "signup"].forEach(function (id) { setFormMessage(id, "", false); });
  }

  function setLoading(formId, loading) {
    var btn = document.querySelector("#auth-tab-" + formId + " .auth-submit-btn");
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Please wait..." : (formId === "signup" ? "Create account" : "Sign in");
  }

  // ── Form handlers ──────────────────────────────────────────────────────────
  function bindForms() {
    var signinForm = document.getElementById("auth-signin-form");
    var signupForm = document.getElementById("auth-signup-form");

    if (signinForm) {
      signinForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email    = signinForm.querySelector("[name=email]").value.trim();
        var password = signinForm.querySelector("[name=password]").value;
        if (!email || !password) { setFormMessage("signin", "Please fill in all fields.", true); return; }
        setLoading("signin", true);
        signIn(email, password)
          .then(function () { closeAuthModal(); })
          .catch(function (err) { setFormMessage("signin", err.message || "Sign in failed.", true); })
          .finally(function () { setLoading("signin", false); });
      });
    }

    if (signupForm) {
      signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var name     = signupForm.querySelector("[name=display_name]").value.trim();
        var email    = signupForm.querySelector("[name=email]").value.trim();
        var password = signupForm.querySelector("[name=password]").value;
        var confirm  = signupForm.querySelector("[name=confirm_password]").value;
        if (!email || !password) { setFormMessage("signup", "Email and password are required.", true); return; }
        if (password.length < 8)  { setFormMessage("signup", "Password must be at least 8 characters.", true); return; }
        if (password !== confirm)  { setFormMessage("signup", "Passwords do not match.", true); return; }
        setLoading("signup", true);
        signUp(email, password, name)
          .then(function () {
            setFormMessage("signup", "Account created. Check your email to confirm before signing in.", false);
          })
          .catch(function (err) { setFormMessage("signup", err.message || "Sign up failed.", true); })
          .finally(function () { setLoading("signup", false); });
      });
    }

    var tabBtns = document.querySelectorAll(".auth-tab-btn");
    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () { showTab(btn.dataset.tab); });
    });

    var backdrop = document.querySelector(".auth-modal-backdrop");
    if (backdrop) backdrop.addEventListener("click", closeAuthModal);

    var closeBtn = document.getElementById("auth-modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeAuthModal);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAuthModal();
    });

    var authBtn = document.getElementById("auth-btn");
    if (authBtn) {
      authBtn.addEventListener("click", function () {
        if (_session) {
          var menu = document.getElementById("auth-user-menu");
          if (menu) menu.classList.toggle("is-open");
        } else {
          openAuthModal("signin");
        }
      });
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    bindForms();
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      init();
    } else {
      renderAuthUI();
    }
  });

  // ── Public namespace ───────────────────────────────────────────────────────
  window.__ALTAIR_AUTH__ = {
    signUp:           signUp,
    signIn:           signIn,
    signOut:          signOut,
    getSession:       getSession,
    getProfile:       getProfile,
    getRole:          getRole,
    isLoggedIn:       isLoggedIn,
    hasRole:          hasRole,
    onChange:         onChange,
    openAuthModal:    openAuthModal,
    closeAuthModal:   closeAuthModal,
    submitToQueue:    submitToQueue,
    claimSchool:      claimSchool,
    loadQueue:        loadQueue,
    reviewQueueItem:  reviewQueueItem,
    loadSchools:      loadSchools,
    submitNewSchool:  submitNewSchool,
  };
})();
