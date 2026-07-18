// FIFA World Cup 2026 Stadium Database & Static Assets
const STADIUM_DATA = {
  name: "FIFA 2026 United MetLife Arena",
  location: "East Rutherford, NJ, USA",
  capacity: 82500,
  gates: [
    { id: "Gate 1", name: "Gate 1 (North - VIP & Accessibility)", coords: { x: 150, y: 50 }, status: "Clear", waitTime: 5 },
    { id: "Gate 2", name: "Gate 2 (Northeast)", coords: { x: 250, y: 80 }, status: "Moderate", waitTime: 12 },
    { id: "Gate 3", name: "Gate 3 (Southeast)", coords: { x: 270, y: 220 }, status: "Heavy", waitTime: 25 },
    { id: "Gate 4", name: "Gate 4 (South - Public Transit Hub)", coords: { x: 150, y: 270 }, status: "Critical", waitTime: 42 },
    { id: "Gate 5", name: "Gate 5 (Southwest)", coords: { x: 50, y: 220 }, status: "Clear", waitTime: 4 },
    { id: "Gate 6", name: "Gate 6 (Northwest)", coords: { x: 50, y: 80 }, status: "Moderate", waitTime: 15 }
  ],
  concessions: [
    { id: "c1", name: "Kickoff Tacos & Nachos", type: "Food", section: "102", status: "Open", waitTime: 10 },
    { id: "c2", name: "Vanguard Vegan & Green", type: "Food", section: "114", status: "Open", waitTime: 5 },
    { id: "c3", name: "World Cup Grill (Burgers)", type: "Food", section: "128", status: "Open", waitTime: 18 },
    { id: "c4", name: "Pitchside Pizzeria", type: "Food", section: "205", status: "Open", waitTime: 15 },
    { id: "c5", name: "MetLife Brews & Beverages", type: "Drinks", section: "220", status: "Open", waitTime: 8 },
    { id: "c6", name: "FIFA Official Merchandise", type: "Merch", section: "100 (Main Plaza)", status: "Open", waitTime: 22 }
  ],
  restrooms: [
    { id: "r1", section: "105", gender: "All Gender & Family", status: "Clear", waitTime: 2 },
    { id: "r2", section: "118", gender: "Men", status: "Busy", waitTime: 8 },
    { id: "r3", section: "132", gender: "Women", status: "Busy", waitTime: 12 },
    { id: "r4", section: "208", gender: "Women", status: "Clear", waitTime: 3 },
    { id: "r5", section: "224", gender: "Men", status: "Clear", waitTime: 4 }
  ],
  firstAid: [
    { id: "fa1", name: "First Aid Central", section: "110", status: "Fully Staffed" },
    { id: "fa2", name: "First Aid Annex", section: "215", status: "Fully Staffed" }
  ],
  waterStations: [
    { id: "w1", section: "103", refillsCount: 1450, status: "Active" },
    { id: "w2", section: "122", refillsCount: 2230, status: "Active" },
    { id: "w3", section: "210", refillsCount: 890, status: "Active" },
    { id: "w4", section: "230", refillsCount: 1100, status: "Active" }
  ]
};

const SCHEDULE_DATA = [
  { time: "15:00", event: "Gates Open & Fan Zone Activation", type: "Ops" },
  { time: "16:30", event: "Teams Warm-up", type: "Sport" },
  { time: "17:45", event: "Pre-match Opening Ceremony", type: "Show" },
  { time: "18:00", event: "Kickoff: USA vs. Germany (Group Stage Match 42)", type: "Sport" },
  { time: "18:45", event: "Halftime Show & Concessions Rush", type: "Ops" },
  { time: "19:00", event: "Second Half Kickoff", type: "Sport" },
  { time: "19:45", event: "Match Concluded & Safe Exit Protocols", type: "Ops" }
];

const TRANSIT_DATA = {
  trains: [
    { route: "MetLife Express (to NYC Penn Station)", frequency: "Every 8 mins", status: "Normal Service", delay: "None" },
    { route: "Secaucus Shuttle", frequency: "Every 5 mins", status: "Heavy Volume", delay: "3 min boarding wait" }
  ],
  buses: [
    { route: "Line 351 (NYC Direct)", frequency: "Every 15 mins", status: "Normal Service", delay: "None" },
    { route: "Local Bus 160", frequency: "Every 20 mins", status: "Minor Delays", delay: "7 mins due to traffic" }
  ],
  rideshares: [
    { zone: "Lot E (West Zone)", pickupTime: "12-15 min wait", surge: "Moderate (1.3x)", status: "Active" },
    { zone: "Lot K (East Zone)", pickupTime: "18-22 min wait", surge: "High (1.6x)", status: "Congested" }
  ],
  parkAndRide: [
    { location: "Redd's Park & Ride", spacesLeft: 84, shuttleTime: "10 mins", status: "Open" },
    { location: "Secaucus Junction Lot", spacesLeft: 310, shuttleTime: "15 mins", status: "Open" }
  ]
};

const SUSTAINABILITY_CHALLENGES = [
  {
    id: "sus1",
    title: "Eco-Transit Champion",
    description: "Use public transit (train or shuttle) to get to the stadium today.",
    points: 150,
    impact: "Saves ~8.4kg of CO2 compared to driving."
  },
  {
    id: "sus2",
    title: "Zero Waste Hero",
    description: "Dispose of food waste and recyclables at marked sorting bins near concessions.",
    points: 100,
    impact: "Diverts material from landfill, contributing to 100% circular economy goal."
  },
  {
    id: "sus3",
    title: "Hydration Station Master",
    description: "Refill your reusable water cup/bottle at one of the 4 water filling stations.",
    points: 80,
    impact: "Prevents single-use plastic waste."
  }
];

const MULTILINGUAL_DICTIONARY = {
  Spanish: {
    "welcome": "Bienvenido al Estadio de la Copa Mundial de la FIFA 2026",
    "gate_wait": "El tiempo de espera en la Puerta 4 es actualmente de 42 minutos. Recomendamos usar la Puerta 5 o 6.",
    "bag_policy": "Solo se permiten bolsas transparentes de tamaño pequeño (menos de 12x6x12 pulgadas).",
    "where_restroom": "¿Dónde están los sanitarios?",
    "restroom_info": "Hay sanitarios cerca de la sección 105, 118 y 132.",
    "emergency": "¡Atención! Si hay una emergencia médica, diríjase a la sección 110.",
    "water": "Estaciones de recarga de agua gratuitas disponibles en las secciones 103, 122, 210 y 230.",
    "help_lost": "Disculpe, me he perdido. ¿Cómo llego a mi sección?",
    "help_lost_resp": "Por favor, comparta el número de sección impreso en su boleto para guiarle paso a paso.",
    "translation_error": "No se pudo traducir en este momento."
  },
  Portuguese: {
    "welcome": "Bem-vindo ao Estádio da Copa do Mundo FIFA 2026",
    "gate_wait": "O tempo de espera no Portão 4 é atualmente de 42 minutos. Recomendamos usar os Portões 5 ou 6.",
    "bag_policy": "Apenas são permitidas bolsas transparentes pequenas (menos de 12x6x12 polegadas).",
    "where_restroom": "Onde ficam os banheiros?",
    "restroom_info": "Existem banheiros próximos às seções 105, 118 e 132.",
    "emergency": "Atenção! Em caso de emergência médica, vá para a seção 110.",
    "water": "Estações gratuitas de recarga de água estão nas seções 103, 122, 210 e 230.",
    "help_lost": "Com licença, estou perdido. Como chego ao meu setor?",
    "help_lost_resp": "Por favor, forneça o número da seção no seu ingresso para que possamos guiá-lo.",
    "translation_error": "Não foi possível traduzir agora."
  },
  French: {
    "welcome": "Bienvenue au Stade de la Coupe du Monde de la FIFA 2026",
    "gate_wait": "Le temps d'attente à la porte 4 est actuellement de 42 minutes. Nous vous conseillons d'utiliser les portes 5 ou 6.",
    "bag_policy": "Seuls les sacs transparents de petite taille (moins de 12x6x12 pouces) sont autorisés.",
    "where_restroom": "Où sont les toilettes?",
    "restroom_info": "Il y a des toilettes près des sections 105, 118 et 132.",
    "emergency": "Attention! En cas d'urgence médicale, rendez-vous à la section 110.",
    "water": "Stations de recharge d'eau gratuites aux sections 103, 122, 210 et 230.",
    "help_lost": "Excusez-moi, je suis perdu. Comment puis-je rejoindre ma section?",
    "help_lost_resp": "Veuillez indiquer le numéro de section figurant sur votre billet pour un guidage direct.",
    "translation_error": "Traduction impossible pour le moment."
  },
  German: {
    "welcome": "Willkommen im FIFA WM-Stadion 2026",
    "gate_wait": "Die Wartezeit an Tor 4 beträgt aktuell 42 Minuten. Wir empfehlen die Nutzung von Tor 5 oder Tor 6.",
    "bag_policy": "Nur kleine Klarsichttaschen (unter 12x6x12 Zoll) sind erlaubt.",
    "where_restroom": "Wo sind die Toiletten?",
    "restroom_info": "Toiletten befinden sich in der Nähe der Sektionen 105, 118 und 132.",
    "emergency": "Achtung! Bei medizinischen Notfällen wenden Sie sich an Sektion 110.",
    "water": "Kostenlose Wassertankstellen in Sektion 103, 122, 210 und 230 verfügbar.",
    "help_lost": "Entschuldigung, ich habe mich verlaufen. Wie komme ich zu meinem Block?",
    "help_lost_resp": "Bitte geben Sie die Blocknummer auf Ihrem Ticket an, um eine genaue Wegbeschreibung zu erhalten.",
    "translation_error": "Übersetzung derzeit nicht möglich."
  }
};

const TOURNAMENT_FAQ = [
  {
    q: "What is the bag policy for the FIFA World Cup 2026 stadium?",
    a: "Only clear plastic, vinyl or PVC bags that do not exceed 12\" x 6\" x 12\" are permitted. Small clutch bags (no larger than 4.5\" x 6.5\") are also allowed but subject to security inspection."
  },
  {
    q: "Is MetLife Stadium cashless?",
    a: "Yes, the arena is 100% cashless. All major credit cards, debit cards, Apple Pay, and Google Pay are accepted. Reverse ATMs (cash-to-card kiosks) are available at Sections 118, 142, and 224."
  },
  {
    q: "How can I request accessibility assistance?",
    a: "Accessible carts and wheelchairs are available near Gates 1 and 5. You can pre-book assistance by asking the GenAI Assistant or speaking with volunteers wearing bright teal vests. Elevated accessibility seats are located in Sections 100-112, 201-208, and 301-310."
  },
  {
    q: "Can I bring reusable water bottles?",
    a: "Yes, you can bring empty, reusable plastic bottles or aluminum flasks up to 32 oz. Glass bottles are strictly prohibited. Free, filtered chilled-water refilling stations are placed throughout the concourses."
  },
  {
    q: "What happens in case of extreme weather or lightning?",
    a: "The stadium has lightning detection sensors. If severe weather is within 8 miles, the Command Center will trigger alerts. Fans will be instructed to seek shelter under the concourses. Live announcements will post on stadium screens and in the Fan Companion app."
  }
];

// Export to window object for ease of vanilla integration
window.STADIUM_DATA = STADIUM_DATA;
window.SCHEDULE_DATA = SCHEDULE_DATA;
window.TRANSIT_DATA = TRANSIT_DATA;
window.SUSTAINABILITY_CHALLENGES = SUSTAINABILITY_CHALLENGES;
window.MULTILINGUAL_DICTIONARY = MULTILINGUAL_DICTIONARY;
window.TOURNAMENT_FAQ = TOURNAMENT_FAQ;
