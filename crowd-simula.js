// FIFA 2026 Crowd Dynamics & Heatmap Simulator
class StadiumCrowdSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Core parameters
    this.speed = 1.0;
    this.density = 250; // number of crowd particles
    this.incidentFrequency = 0.05; // probability of incident per tick
    
    // Simulation state
    this.particles = [];
    this.incidents = [];
    this.isPaused = false;
    
    // Seed positions
    this.initializeParticles();
    this.startSimulationLoop();
  }

  setSpeed(speedVal) {
    this.speed = parseFloat(speedVal);
  }

  setDensity(densityVal) {
    this.density = parseInt(densityVal);
    this.initializeParticles();
  }

  initializeParticles() {
    this.particles = [];
    
    // Generate particles around the concourse and seats
    for (let i = 0; i < this.density; i++) {
      // Concourses are represented by concentric ellipses
      const isConcourse = Math.random() > 0.4;
      let radiusX, radiusY;
      
      if (isConcourse) {
        // Concourse track
        radiusX = 140 + Math.random() * 30;
        radiusY = 90 + Math.random() * 20;
      } else {
        // Seat track
        radiusX = 75 + Math.random() * 50;
        radiusY = 45 + Math.random() * 35;
      }

      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: this.width / 2 + Math.cos(angle) * radiusX,
        y: this.height / 2 + Math.sin(angle) * radiusY,
        angle: angle,
        radiusX: radiusX,
        radiusY: radiusY,
        speed: (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1),
        size: 3 + Math.random() * 4,
        heat: Math.random()
      });
    }
  }

  // Generate an incident on operations dashboard
  triggerIncident() {
    const sections = ["102", "114", "128", "205", "220", "110", "118", "132", "105", "208"];
    const section = sections[Math.floor(Math.random() * sections.length)];
    
    const templates = [
      {
        title: "Liquid Spill Hazard",
        description: `Soda spill in concourse near Section ${section}. Risk of slip/fall.`,
        type: "Safety",
        severity: "Moderate",
        dispatchAction: "Send cleaning crew with caution tape.",
        genAiAdvice: "Clean area immediately. Post visual caution signage. Dynamic monitors in Section 102 should highlight detour routes until completed."
      },
      {
        title: "Crowd Gate Backup",
        description: "High queue surge at Gate 4. Boarding transit trains is slowing down.",
        type: "Crowd",
        severity: "High",
        dispatchAction: "Send ticket checkpoint marshals.",
        genAiAdvice: "Activate ticket pre-checks at subway exits. Adjust digital signs to instruct fans to proceed to Gate 5 for faster security clearance."
      },
      {
        title: "Medical Assistance Needed",
        description: `Fan experiencing minor heat exhaustion in Section ${section}.`,
        type: "Medical",
        severity: "Critical",
        dispatchAction: "Dispatch first-aid medics from Section 110.",
        genAiAdvice: "Immediate dispatch of EMS team. Ensure accessibility paths are clear. Direct crowd control volunteers to assist family members."
      },
      {
        title: "Sustainability Station Full",
        description: `Zero-waste recycling station at Section ${section} is at 95% capacity.`,
        type: "Sustainability",
        severity: "Low",
        dispatchAction: "Dispatch waste recycling collectors.",
        genAiAdvice: "Empty container immediately to prevent overflow. Divert crowd engagement logs to highlight alternative green bins."
      }
    ];

    const chosen = templates[Math.floor(Math.random() * templates.length)];
    
    // Check if incident already exists to avoid duplicates
    if (this.incidents.find(inc => inc.title === chosen.title && inc.section === section)) {
      return;
    }

    const newIncident = {
      id: "inc_" + Math.random().toString(36).substr(2, 9),
      title: chosen.title,
      description: chosen.description,
      type: chosen.type,
      severity: chosen.severity,
      section: section,
      status: "Pending",
      dispatchAction: chosen.dispatchAction,
      genAiAdvice: chosen.genAiAdvice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    this.incidents.unshift(newIncident);
    
    // Dispatch custom event to notify main app
    const event = new CustomEvent("stadium-incident", { detail: newIncident });
    window.dispatchEvent(event);
  }

  resolveIncident(id) {
    const idx = this.incidents.findIndex(inc => inc.id === id);
    if (idx !== -1) {
      this.incidents[idx].status = "Resolving";
      
      // Simulate resolver arrival after 3 seconds
      setTimeout(() => {
        if (this.incidents[idx]) {
          this.incidents[idx].status = "Resolved";
          // Notify app
          window.dispatchEvent(new CustomEvent("stadium-incident-resolved", { detail: this.incidents[idx] }));
          this.incidents.splice(idx, 1);
        }
      }, 3000);
    }
  }

  updateSimulation() {
    if (this.isPaused) return;

    // 1. Update particle coordinates
    this.particles.forEach(p => {
      p.angle += (p.speed * 0.01 * this.speed);
      p.x = this.width / 2 + Math.cos(p.angle) * p.radiusX;
      p.y = this.height / 2 + Math.sin(p.angle) * p.radiusY;
      
      // Add slight jitter
      p.x += (Math.random() - 0.5) * 2;
      p.y += (Math.random() - 0.5) * 2;
    });

    // 2. Randomly trigger incidents
    if (Math.random() < this.incidentFrequency * 0.1 * this.speed) {
      this.triggerIncident();
    }
  }

  drawStadium() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw outer boundary glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(0, 242, 254, 0.2)";
    ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
    ctx.beginPath();
    ctx.ellipse(this.width / 2, this.height / 2, 195, 135, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // 2. Draw soccer pitch (center)
    ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.fillStyle = "rgba(4, 30, 48, 0.7)";
    ctx.beginPath();
    ctx.rect(this.width / 2 - 50, this.height / 2 - 30, 100, 60);
    ctx.fill();
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 15, 0, Math.PI * 2);
    ctx.stroke();
    // Center line
    ctx.beginPath();
    ctx.moveTo(this.width / 2, this.height / 2 - 30);
    ctx.lineTo(this.width / 2, this.height / 2 + 30);
    ctx.stroke();

    // 3. Draw stadium seats/sections rings (structural outlines)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.ellipse(this.width / 2, this.height / 2, 130, 80, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.ellipse(this.width / 2, this.height / 2, 170, 110, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Draw Concourse walkthrough layout ring
    ctx.strokeStyle = "rgba(0, 242, 254, 0.15)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(this.width / 2, this.height / 2, 150, 95, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1; // reset

    // 5. Draw Gates as nodes on map
    window.STADIUM_DATA.gates.forEach(gate => {
      // Map coords dynamically or use their scaled ones
      const scaleX = (gate.coords.x / 300) * (this.width - 80) + 40;
      const scaleY = (gate.coords.y / 300) * (this.height - 80) + 40;

      let color = "#00ff87"; // Clear
      if (gate.status === "Moderate") color = "#f39c12";
      if (gate.status === "Heavy") color = "#e67e22";
      if (gate.status === "Critical") color = "#e74c3c";

      // Draw outer glowing circle
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(scaleX, scaleY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "8px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(gate.id, scaleX, scaleY - 10);
    });

    // 6. Draw Concessions as yellow shopping-basket icons or triangles
    window.STADIUM_DATA.concessions.forEach((c, idx) => {
      // Place concessions in quadrants
      const angle = (idx / window.STADIUM_DATA.concessions.length) * Math.PI * 2;
      const rx = 145;
      const ry = 92;
      const cx = this.width / 2 + Math.cos(angle) * rx;
      const cy = this.height / 2 + Math.sin(angle) * ry;

      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label code
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "7px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`C${idx+1}`, cx, cy + 10);
    });

    // 7. Draw the actual Crowd Particles (dynamic heat map look)
    this.particles.forEach(p => {
      // Color particle based on speed/heat
      let particleColor = "rgba(0, 242, 254, 0.4)"; // Standard Fan
      
      // If crowd particle is near Gate 4 (transit bottleneck), color it hot orange/red
      const distToGate4X = p.x - ((150/300) * (this.width - 80) + 40);
      const distToGate4Y = p.y - ((270/300) * (this.height - 80) + 40);
      const distToGate4 = Math.sqrt(distToGate4X * distToGate4X + distToGate4Y * distToGate4Y);

      if (distToGate4 < 45) {
        particleColor = `rgba(231, 76, 60, ${0.4 + Math.random() * 0.4})`; // Critical crowd density
      } else if (p.heat > 0.75) {
        particleColor = `rgba(243, 156, 18, ${0.35 + Math.random() * 0.4})`; // Heavy/moderate
      } else if (p.heat > 0.45) {
        particleColor = `rgba(0, 255, 135, 0.4)`; // Sustainable flow
      }

      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 8. Draw active incident rings on map
    this.incidents.forEach(inc => {
      // Find a position coordinate based on section
      const secNum = parseInt(inc.section) || 100;
      const angle = (secNum / 400) * Math.PI * 2;
      const radX = 110;
      const radY = 70;
      const x = this.width / 2 + Math.cos(angle) * radX;
      const y = this.height / 2 + Math.sin(angle) * radY;

      // Pulse ring
      const pulseSize = 10 + (Math.sin(Date.now() * 0.008) * 6);
      ctx.strokeStyle = inc.severity === "Critical" ? "#e74c3c" : "#f39c12";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.stroke();

      // Inner danger dot
      ctx.fillStyle = inc.severity === "Critical" ? "#e74c3c" : "#f39c12";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1;
    });
  }

  startSimulationLoop() {
    const loop = () => {
      this.updateSimulation();
      this.drawStadium();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Attach to window
window.StadiumCrowdSimulation = StadiumCrowdSimulation;
