// ArenaAssist GenAI Engine
class ArenaAIEngine {
  constructor() {
    this.apiKey = localStorage.getItem("gemini_api_key") || "";
    this.systemInstruction = `
You are "ArenaAssist", the official FIFA World Cup 2026 Stadium Operations and Fan Experience AI Assistant at the FIFA 2026 United MetLife Arena.
You help fans, staff, and organizers with:
- Navigation, gates, wait times, and accessible entry.
- Transportation options, train schedules, rideshare zones, and traffic delays.
- Stadium policies (e.g. clear bag policy, cashless payment, hydration stations).
- Sustainability actions (eco-transit challenges, recycling, carbon footprint).
- Dynamic operational updates (e.g. crowd alerts, gate re-routings).

Tone: Friendly, efficient, professional, and clear. Proactively suggest alternatives if an area is congested (e.g., Gate 4 is backed up, recommend Gates 5/6). Keep responses concise, formatted using simple Markdown bullet points where appropriate. Always answer in the language the user speaks.
`;
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem("gemini_api_key", this.apiKey);
    } else {
      localStorage.removeItem("gemini_api_key");
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  // Main chat routing method
  async ask(prompt, role = "fan", currentSimState = {}) {
    const contextStr = this.buildContextString(role, currentSimState);
    
    if (this.apiKey) {
      try {
        return await this.callGeminiAPI(prompt, contextStr);
      } catch (error) {
        console.error("Gemini API call failed, falling back to local engine:", error);
        return this.generateFallbackResponse(prompt, role, currentSimState, true);
      }
    } else {
      // Small artificial delay to mimic network request for realistic feel
      await new Promise(resolve => setTimeout(resolve, 600));
      return this.generateFallbackResponse(prompt, role, currentSimState, false);
    }
  }

  // Direct integration with the Gemini API (using gemini-1.5-flash)
  async callGeminiAPI(prompt, context) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `STADIUM REAL-TIME CONTEXT:\n${context}\n\nUSER PROMPT: ${prompt}`
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: this.systemInstruction
          }
        ]
      },
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 500,
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected API response structure");
    }
  }

  // Generates rich context string to feed to Gemini
  buildContextString(role, state) {
    const gates = window.STADIUM_DATA.gates.map(g => `- ${g.name}: Status=${g.status}, Wait=${g.waitTime}m`).join("\n");
    const concessions = window.STADIUM_DATA.concessions.map(c => `- ${c.name} (Sec ${c.section}): Wait=${c.waitTime}m`).join("\n");
    const transit = window.TRANSIT_DATA.trains.concat(window.TRANSIT_DATA.buses).map(t => `- ${t.route}: ${t.status} (${t.delay})`).join("\n");
    
    let activeAlerts = "None";
    if (state.alerts && state.alerts.length > 0) {
      activeAlerts = state.alerts.map(a => `[${a.severity}] ${a.title} - ${a.description}`).join("\n");
    }

    return `
Role: ${role}
Active Alerts:
${activeAlerts}

Gate Statuses:
${gates}

Concessions Wait Times:
${concessions}

Transit Status:
${transit}
`;
  }

  // Highly robust, localized fallback system
  generateFallbackResponse(prompt, role, state, apiError = false) {
    const query = prompt.toLowerCase();
    const prefix = apiError ? "*(Note: Gemini API failed; running local fallback engine)*\n\n" : "";

    // 1. Multilingual quick detection
    if (query.includes("hola") || query.includes("puerta") || query.includes("bolsa") || query.includes("baño")) {
      return prefix + this.getLocalMultilingualResponse("Spanish", query);
    }
    if (query.includes("bonjour") || query.includes("porte") || query.includes("toilette") || query.includes("sac")) {
      return prefix + this.getLocalMultilingualResponse("French", query);
    }
    if (query.includes("olá") || query.includes("portão") || query.includes("banheiro") || query.includes("bolsa")) {
      return prefix + this.getLocalMultilingualResponse("Portuguese", query);
    }
    if (query.includes("hallo") || query.includes("tor ") || query.includes("tasche") || query.includes("toilette")) {
      return prefix + this.getLocalMultilingualResponse("German", query);
    }

    // 2. Role-specific Command Center summaries (for organizers)
    if (role === "organizer") {
      if (query.includes("summary") || query.includes("status") || query.includes("report")) {
        const criticalGate = window.STADIUM_DATA.gates.find(g => g.waitTime > 30);
        const activeAlertCount = (state.alerts || []).length;
        return `${prefix}### 🏟️ FIFA 2026 Executive Operations Summary
* **Stadium Status**: Open & Active (Current Match: USA vs. Germany).
* **Crowd Congestion**: High concentration at **${criticalGate ? criticalGate.id : 'Gate 4'}** (${criticalGate ? criticalGate.waitTime : 42} min wait time).
* **Active Incidents**: ${activeAlertCount} pending alerts in Command Center.
* **GenAI Recommendation**: Trigger dynamic signage at Gates 3 and 4 to redirect incoming ticket holders towards Gates 5 and 6 (wait times under 15 minutes). Deploy 4 additional transit marshals to South Bus Plaza.`;
      }
    }

    // 3. General Stadium & Operations responses
    if (query.includes("gate") || query.includes("entrance") || query.includes("wait")) {
      let response = `${prefix}### 🚪 Stadium Entry & Wait Times\nHere are the current wait times at the gates:\n\n`;
      window.STADIUM_DATA.gates.forEach(g => {
        let emoji = "🟢";
        if (g.status === "Heavy") emoji = "🟡";
        if (g.status === "Critical") emoji = "🔴";
        response += `* ${emoji} **${g.name}**: ${g.waitTime} min wait (${g.status})\n`;
      });
      const congested = window.STADIUM_DATA.gates.filter(g => g.waitTime > 20);
      if (congested.length > 0) {
        response += `\n⚠️ **ArenaAssist Recommendation**: Skip ${congested.map(c => c.id).join(" & ")}. Use **Gate 1 (North)** or **Gate 5 (Southwest)** which are currently clear!`;
      }
      return response;
    }

    if (query.includes("bag") || query.includes("backpack") || query.includes("purse") || query.includes("policy")) {
      const bagFaq = window.TOURNAMENT_FAQ.find(f => f.q.includes("bag"));
      return `${prefix}### 🎒 Bag Policy\n${bagFaq.a}`;
    }

    if (query.includes("water") || query.includes("bottle") || query.includes("refill") || query.includes("drink")) {
      let response = `${prefix}### 💧 Hydration & Water Refilling
You can bring **empty, reusable plastic bottles or aluminum flasks up to 32 oz**. Glass is strictly prohibited. 

**Free Filtered Water Refill Stations** are located at:
`;
      window.STADIUM_DATA.waterStations.forEach(w => {
        response += `* **Section ${w.section}** (Refills tracked: ${w.refillsCount} saved bottles today!)\n`;
      });
      return response;
    }

    if (query.includes("cash") || query.includes("atm") || query.includes("pay")) {
      const cashFaq = window.TOURNAMENT_FAQ.find(f => f.q.includes("cashless"));
      return `${prefix}### 💳 Payment & Cashless Policy\n${cashFaq.a}`;
    }

    if (query.includes("wheelchair") || query.includes("ada") || query.includes("accessibility") || query.includes("handicap")) {
      const adaFaq = window.TOURNAMENT_FAQ.find(f => f.q.includes("accessibility"));
      return `${prefix}### ♿ Accessibility Services\n${adaFaq.a}`;
    }

    if (query.includes("train") || query.includes("transit") || query.includes("bus") || query.includes("shuttle") || query.includes("rideshare") || query.includes("uber") || query.includes("parking")) {
      let response = `${prefix}### 🚆 Transit & Departure Update\n`;
      response += `**Trains:**\n`;
      window.TRANSIT_DATA.trains.forEach(t => {
        response += `* **${t.route}**: ${t.status} | ${t.delay}\n`;
      });
      response += `\n**Buses:**\n`;
      window.TRANSIT_DATA.buses.forEach(b => {
        response += `* **${b.route}**: ${b.status} | ${b.delay}\n`;
      });
      response += `\n**Rideshare Zones:**\n`;
      window.TRANSIT_DATA.rideshares.forEach(r => {
        response += `* **${r.zone}**: ${r.pickupTime} wait (${r.status}) | ${r.surge}\n`;
      });
      return response;
    }

    if (query.includes("food") || query.includes("taco") || query.includes("pizza") || query.includes("concession") || query.includes("vegan") || query.includes("burger")) {
      let response = `${prefix}### 🍔 Concessions & Food Spots\nHere are the top open concessions near you:\n\n`;
      window.STADIUM_DATA.concessions.forEach(c => {
        response += `* **${c.name}** (Section ${c.section}): ${c.waitTime} mins wait line (${c.type})\n`;
      });
      response += `\n💡 *Tip: Concessions are completely cashless. All stations accept credit cards, Apple Pay, and Google Pay.*`;
      return response;
    }

    if (query.includes("sustainability") || query.includes("carbon") || query.includes("green") || query.includes("recycle")) {
      let response = `${prefix}### 🌱 World Cup Green Initiative\nHelp us make FIFA 2026 the most sustainable World Cup ever! Here are active sustainability challenges you can do right now:\n\n`;
      window.SUSTAINABILITY_CHALLENGES.forEach(c => {
        response += `🏆 **${c.title}** (+${c.points} Green Points)\n`;
        response += `* *Action*: ${c.description}\n`;
        response += `* *Impact*: ${c.impact}\n\n`;
      });
      return response;
    }

    if (query.includes("incident") || query.includes("spill") || query.includes("medical") || query.includes("emergency") || query.includes("first aid")) {
      return `${prefix}### 🚨 Emergency & Medical Help\n* **First Aid Stations**: Section 110 (Central) & Section 215 (Annex).\n* **Volunteers**: Look for anyone in bright teal World Cup vests.\n* **Operations Note**: Ground staff can be dispatched to resolve any slip/trip hazards or crowd congestion immediately.`;
    }

    // Default response containing schedule and friendly welcome
    return `${prefix}Hi there! I am **ArenaAssist**, your GenAI stadium guide. I can help you with gate wait times, public transit options, the cash-free policy, clear bag requirements, accessibility carts, or finding food.

**Upcoming Events Today:**
${window.SCHEDULE_DATA.map(s => `* **${s.time}**: ${s.event}`).join("\n")}

What stadium info can I assist you with right now?`;
  }

  // Translates using the multilingual dictionary strings
  getLocalMultilingualResponse(lang, query) {
    const dict = window.MULTILINGUAL_DICTIONARY[lang];
    if (!dict) return "I can translate for Spanish, French, Portuguese, and German. What do you need?";

    if (query.includes("puerta") || query.includes("wait") || query.includes("attente") || query.includes("tor") || query.includes("portão")) {
      return `🗣️ **[${lang} Translation]**:\n\n${dict.gate_wait}`;
    }
    if (query.includes("bolsa") || query.includes("bag") || query.includes("sac") || query.includes("tasche")) {
      return `🗣️ **[${lang} Translation]**:\n\n${dict.bag_policy}`;
    }
    if (query.includes("baño") || query.includes("toilet") || query.includes("sanitaire") || query.includes("restroom") || query.includes("banheiro")) {
      return `🗣️ **[${lang} Translation]**:\n\n${dict.restroom_info}`;
    }
    if (query.includes("agua") || query.includes("water") || query.includes("eau") || query.includes("wasser")) {
      return `🗣️ **[${lang} Translation]**:\n\n${dict.water}`;
    }

    return `🗣️ **[${lang} Translation]**:\n\n${dict.welcome}\n\n* ${dict.help_lost_resp}`;
  }
}

// Attach to window object
window.ArenaAIEngine = new ArenaAIEngine();
