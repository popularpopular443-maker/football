// FIFA World Cup 2026 ArenaAssist & CrowdOps Command - Application Logic
document.addEventListener("DOMContentLoaded", () => {
  let sim = null;
  let activeView = "view-fan";

  // --- 1. INITIALIZE API KEY & CONFIG ---
  const apiKeyInput = document.getElementById("api-key-input");
  const saveApiKeyBtn = document.getElementById("save-api-key");

  // Load existing API Key if saved
  const savedKey = window.ArenaAIEngine.getApiKey();
  if (savedKey) {
    apiKeyInput.value = savedKey;
    saveApiKeyBtn.textContent = "Connected ✓";
    saveApiKeyBtn.style.background = "var(--accent-emerald)";
  }

  saveApiKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    window.ArenaAIEngine.setApiKey(key);
    if (key) {
      saveApiKeyBtn.textContent = "Connected ✓";
      saveApiKeyBtn.style.background = "var(--accent-emerald)";
      alert("Gemini API key configured successfully! Real-time GenAI active.");
    } else {
      saveApiKeyBtn.textContent = "Connect Key";
      saveApiKeyBtn.style.background = "var(--accent-cyan)";
      alert("Gemini API key cleared. Running on high-fidelity simulation engine.");
    }
  });

  // --- 2. VIEW SWITCHING ---
  const roleButtons = document.querySelectorAll(".role-btn");
  const views = document.querySelectorAll(".view-section");

  roleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-view");
      
      // Update navigation active states
      roleButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Switch view panels
      views.forEach(v => {
        if (v.id === targetView) {
          v.classList.add("active");
        } else {
          v.classList.remove("active");
        }
      });

      activeView = targetView;
      
      // Proactively initialize the crowd simulator map if organizer view is selected
      if (targetView === "view-organizer" && !sim) {
        initSimulation();
      }

      // Sync active tasks count when switching to Staff ops
      if (targetView === "view-staff") {
        updateStaffTasksUI();
      }
    });
  });

  // --- 3. CROWD SIMULATION INITIALIZER & CONTROLS ---
  const speedRange = document.getElementById("speed-range");
  const speedLbl = document.getElementById("speed-lbl");
  const densityRange = document.getElementById("density-range");
  const densityLbl = document.getElementById("density-lbl");
  const triggerIncidentBtn = document.getElementById("btn-trigger-incident-manually");
  const clearIncidentsBtn = document.getElementById("btn-clear-incidents");

  function initSimulation() {
    sim = new window.StadiumCrowdSimulation("heatmap-canvas");
    
    // Wire simulation controls
    speedRange.addEventListener("input", (e) => {
      const val = e.target.value;
      speedLbl.textContent = parseFloat(val).toFixed(1) + "x";
      if (sim) sim.setSpeed(val);
    });

    densityRange.addEventListener("input", (e) => {
      const val = e.target.value;
      densityLbl.textContent = val;
      if (sim) sim.setDensity(val);
    });

    triggerIncidentBtn.addEventListener("click", () => {
      if (sim) {
        sim.triggerIncident();
      }
    });

    clearIncidentsBtn.addEventListener("click", () => {
      if (sim) {
        sim.incidents = [];
        updateIncidentsUI();
        updateStaffTasksUI();
        updateStats();
      }
    });
  }

  // --- 4. INCIDENT HANDLING & DATA BINDING ---
  window.addEventListener("stadium-incident", (e) => {
    updateIncidentsUI();
    updateStaffTasksUI();
    updateStats();
    
    // Auto broadcast severe incident warning to the fan companion
    const incident = e.detail;
    if (incident.severity === "Critical" || incident.severity === "High") {
      showFanAlert(`Crowd operations update: ${incident.description} Alternatives recommended.`);
    }
  });

  window.addEventListener("stadium-incident-resolved", () => {
    updateIncidentsUI();
    updateStaffTasksUI();
    updateStats();
  });

  function updateIncidentsUI() {
    const container = document.getElementById("organizer-incidents-container");
    if (!container || !sim) return;

    if (sim.incidents.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
          ✅ Stadium operations running smoothly. No active hazards detected.
        </div>`;
      return;
    }

    container.innerHTML = sim.incidents.map(inc => `
      <div class="incident-card ${inc.severity.toLowerCase()}">
        <div class="incident-header">
          <span class="incident-title">${inc.title} (Section ${inc.section})</span>
          <span class="incident-badge ${inc.severity.toLowerCase()}">${inc.severity}</span>
        </div>
        <div class="incident-desc">${inc.description}</div>
        <div class="incident-time">Triggered at: ${inc.timestamp} | Status: <strong>${inc.status}</strong></div>
        
        <div class="incident-ai-box">
          <strong style="color: var(--accent-cyan);">🤖 ArenaAssist Operations Advice:</strong><br>
          ${inc.genAiAdvice}
        </div>

        ${inc.status === "Pending" ? `
          <button class="dispatch-btn" onclick="dispatchVolunteer('${inc.id}')">
            🦺 Dispatch Volunteer
          </button>
        ` : `
          <button class="dispatch-btn resolving" disabled>
            ⚡ Resolving...
          </button>
        `}
      </div>
    `).join("");
  }

  function updateStaffTasksUI() {
    const container = document.getElementById("staff-tasks-container");
    if (!container) return;

    const activeCountBadge = document.getElementById("ops-active-task-count");

    if (!sim || sim.incidents.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
          🧹 No tasks currently active. Clean-up crews and guides are on standby.
        </div>`;
      if (activeCountBadge) activeCountBadge.textContent = "0 tasks active";
      return;
    }

    // Show only pending/resolving tasks on the Ground Ops screen
    container.innerHTML = sim.incidents.map(inc => `
      <div class="incident-card ${inc.severity.toLowerCase()}">
        <div class="incident-header">
          <span class="incident-title">${inc.title} (Section ${inc.section})</span>
          <span class="incident-badge ${inc.severity.toLowerCase()}">${inc.severity}</span>
        </div>
        <div class="incident-desc">${inc.description}</div>
        <div style="font-size: 0.75rem; margin-top: 4px;">
          👉 <strong>Required Action:</strong> ${inc.dispatchAction}
        </div>
        <div class="incident-time">Status: <strong>${inc.status}</strong></div>
        
        ${inc.status === "Pending" ? `
          <button class="dispatch-btn" onclick="dispatchVolunteer('${inc.id}')">
            Accept & Dispatch
          </button>
        ` : `
          <button class="dispatch-btn resolving" disabled>
            ⚡ Task in Progress
          </button>
        `}
      </div>
    `).join("");

    if (activeCountBadge) {
      activeCountBadge.textContent = `${sim.incidents.length} tasks active`;
    }
  }

  // Exposed globally so inline onclick handlers work smoothly
  window.dispatchVolunteer = (id) => {
    if (sim) {
      sim.resolveIncident(id);
      updateIncidentsUI();
      updateStaffTasksUI();
      updateStats();
    }
  };

  // Sync Stats Dashboard
  function updateStats() {
    if (!sim) return;
    const incidentsCount = document.getElementById("ops-active-incidents-val");
    if (incidentsCount) incidentsCount.textContent = sim.incidents.length;
  }

  // --- 5. GENAI CHAT ASSISTANT (FAN INTERFACE) ---
  const chatForm = document.getElementById("fan-chat-form");
  const chatInput = document.getElementById("fan-chat-input");
  const chatMessages = document.getElementById("fan-chat-messages");
  const suggestionButtons = document.querySelectorAll(".suggest-btn[data-query]");

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const queryText = chatInput.value.trim();
    if (!queryText) return;

    addChatMessage(queryText, "user");
    chatInput.value = "";

    // Show typing state
    const typingMsg = addChatMessage("ArenaAssist is thinking...", "ai typing");

    // Gather simulator context state to enrich prompt
    const state = {
      alerts: sim ? sim.incidents : []
    };

    try {
      const response = await window.ArenaAIEngine.ask(queryText, "fan", state);
      typingMsg.remove();
      addChatMessage(response, "ai");
    } catch (err) {
      typingMsg.remove();
      addChatMessage("Sorry, I encountered an error. Please try again.", "ai");
    }
  });

  // Suggestion click handling
  suggestionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const query = btn.getAttribute("data-query");
      chatInput.value = query;
      chatForm.dispatchEvent(new Event("submit"));
    });
  });

  function addChatMessage(content, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;
    
    // Parse simple markdown strings/newlines safely
    if (sender.includes("typing")) {
      msgDiv.textContent = content;
    } else {
      msgDiv.innerHTML = formatMarkdown(content);
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  }

  function formatMarkdown(text) {
    // Escape HTML tag chars
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Markdown headers ###
    formatted = formatted.replace(/^### (.*$)/gim, '<strong style="color: var(--accent-cyan); display:block; margin: 6px 0 3px 0;">$1</strong>');
    // Markdown bold **
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullet points * or -
    formatted = formatted.replace(/^\* (.*$)/gim, '<div style="margin-left: 10px; display:list-item;">$1</div>');
    formatted = formatted.replace(/^- (.*$)/gim, '<div style="margin-left: 10px; display:list-item;">$1</div>');
    // Newlines to breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }

  // --- 6. TRANSLATOR LOGIC (STAFF INTERFACE) ---
  const translateBtn = document.getElementById("btn-translate-ops");
  const staffInputText = document.getElementById("staff-input-text");
  const staffOutputText = document.getElementById("staff-output-text");
  const staffLangSelect = document.getElementById("staff-lang-select");
  const quickTranslatePhrases = document.querySelectorAll(".quick-translate-phrase");

  translateBtn.addEventListener("click", () => {
    performTranslation();
  });

  // Translate automatically on typing or selections
  staffLangSelect.addEventListener("change", () => {
    if (staffInputText.value.trim()) performTranslation();
  });

  quickTranslatePhrases.forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-text");
      staffInputText.value = text;
      performTranslation();
    });
  });

  function performTranslation() {
    const text = staffInputText.value.trim();
    const lang = staffLangSelect.value;

    if (!text) {
      staffOutputText.value = "";
      return;
    }

    // Try finding matching key phrases in dictionary, otherwise run simple translation mockup
    const dictionary = window.MULTILINGUAL_DICTIONARY[lang];
    let translation = "";

    if (text.includes("wait time at Gate 4") || text.includes("Gate 4 wait times")) {
      translation = dictionary.gate_wait;
    } else if (text.includes("clear bags") || text.includes("bag policy")) {
      translation = dictionary.bag_policy;
    } else if (text.includes("sanitary") || text.includes("restroom") || text.includes("toilet")) {
      translation = dictionary.restroom_info;
    } else if (text.includes("ticket") || text.includes("section number") || text.includes("lost")) {
      translation = dictionary.help_lost_resp;
    } else {
      // Simulate real-time translation dynamically using dictionary template fallback
      translation = `[${lang} Translated]: "${text.replace("Gate 4", "Gate 5/6").replace("42 minutes", "15 minutes")}"`;
    }

    staffOutputText.value = translation;
  }

  // --- 7. SUSTAINABILITY HUB LOGGING ---
  const claimTransitBtn = document.getElementById("claim-transit-btn");
  const claimRefillBtn = document.getElementById("claim-refill-btn");
  const fanTotalPoints = document.getElementById("fan-total-points");
  const fanCO2Saved = document.getElementById("fan-co2-saved");
  const fanWaterSaved = document.getElementById("fan-water-saved");
  const opsGreenPointsVal = document.getElementById("ops-green-points-val");

  let points = 120;
  let co2 = 5.6;
  let bottles = 2;

  claimTransitBtn.addEventListener("click", () => {
    if (claimTransitBtn.disabled) return;
    
    points += 150;
    co2 += 8.4;
    
    fanTotalPoints.textContent = `${points} pts`;
    fanCO2Saved.textContent = `${co2.toFixed(1)} kg`;
    
    claimTransitBtn.disabled = true;
    claimTransitBtn.textContent = "Claimed ✓";
    claimTransitBtn.style.background = "var(--accent-emerald)";
    claimTransitBtn.style.color = "#050a14";
    
    updateCommandGreenPoints();
    alert("Green Points Claimed! You prevented 8.4kg of carbon emission today.");
  });

  claimRefillBtn.addEventListener("click", () => {
    points += 80;
    bottles += 1;
    
    fanTotalPoints.textContent = `${points} pts`;
    fanWaterSaved.textContent = bottles;
    
    updateCommandGreenPoints();
    
    // Add micro-animation highlight
    claimRefillBtn.textContent = "Logged ✓";
    setTimeout(() => {
      claimRefillBtn.textContent = "Log Refill";
    }, 1500);
  });

  function updateCommandGreenPoints() {
    if (opsGreenPointsVal) {
      opsGreenPointsVal.textContent = (12450 + (points - 120)).toLocaleString();
    }
  }

  // --- 8. COMMAND REPORT GENERATOR (ORGANIZER VIEW) ---
  const generateReportBtn = document.getElementById("btn-generate-report");
  const reportBox = document.getElementById("genai-ops-recommendation");

  generateReportBtn.addEventListener("click", async () => {
    reportBox.textContent = "Generating report with ArenaAssist...";
    
    const state = {
      alerts: sim ? sim.incidents : []
    };

    try {
      const response = await window.ArenaAIEngine.ask(
        "Give a concise stadium operations executive report with safety, crowd details, and recommendations.",
        "organizer",
        state
      );
      reportBox.innerHTML = formatMarkdown(response);
    } catch (err) {
      reportBox.textContent = "Error generating report. Please check API settings.";
    }
  });

  // --- 9. BROADCAST ANNOUNCEMENTS HANDLER ---
  function showFanAlert(text) {
    const alertBox = document.getElementById("fan-alert-box");
    const alertText = document.getElementById("fan-alert-text");
    if (alertBox && alertText) {
      alertText.textContent = text;
      alertBox.style.display = "block";
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 10000);
    }
  }
});
