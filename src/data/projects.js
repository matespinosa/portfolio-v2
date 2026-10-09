export const projects = [
  {
    id: 'modyo',
    sourceUrl: 'https://mateo-espinosa.framer.website/projects/modyo-platform',
    index: '01',
    title: 'Modyo Platform',
    client: 'Modyo',
    name: 'Modyo Platform',
    category: 'DXP · design system · low-code',
    year: '2023 – 2024',
    role: 'Product Designer · Research · Design system',
    scope: 'Modyo 10, low-code tools and shared product foundations',
    team: 'Engineers, PMs, marketers and product teams',
    duration: 'End-to-end platform engagement',
    heroImage: '/projects/modyo/hero.avif',
    intro:
      'Modyo is a Digital Experience Platform used by banks and fintechs across Latin America to create, deploy and operate secure sites on a micro-frontend architecture.',
    body: [
      'The platform had grown by bolting on standalone features: different teams, mixed visual styles and duplicated components. I researched, designed, validated and shipped the key pieces that brought the experience back into one system.',
      'The work connected product, branding, engineering and QA so the platform could move faster without losing consistency or accessibility.',
    ],
    sections: [
      {
        title: 'My role',
        body: 'I ended up wearing several hats at once, from user detective to handoff guardian.',
        bullets: [
          'Ten interviews with engineers, PMs and marketers to uncover where the platform actually hurt.',
          'Accessible palette, modular typography and 60+ components ready in Figma and Storybook.',
          'Clickable prototypes for the new Modyo 10 and low-code tools, validated with the teams using the old flow.',
          'PR reviews, QA polish and living documentation inside the product.',
        ],
      },
      {
        title: 'Research & benchmark',
        body: 'Research uncovered terminology confusion around Spaces and Channels, plus repeated component work because the official library lacked examples. A seven-product benchmark helped us bring in stronger patterns for hierarchy, documentation and visual builders.',
        bullets: [
          'Compact sidebar with shortcuts to critical tasks.',
          'Side-panel documentation with code, props and live examples.',
          'Drag-and-drop editing with history and versioning.',
        ],
      },
      {
        title: 'Design system',
        body: 'The new foundation gave product and engineering a shared language. Tokens and components made interaction patterns recognizable across modules instead of reinventing the same decisions in every squad.',
        bullets: [
          'Neutral palette with blue and green accents for visual focus.',
          'Components documented for both Figma and Storybook.',
          'Shared foundations applied across pages, widgets, templates, navigation and settings.',
        ],
      },
      {
        title: 'Modyo 10 & low-code onboarding',
        body: 'We moved from a bulky flat menu to six clear groups, renamed ambiguous terminology and added contextual descriptions, breadcrumbs and illustrated empty states. The first low-code module enabled teams to create multi-step forms without touching the frontend.',
        bullets: [
          'Conditional logic and declarative validations.',
          'Plug-and-play integrations for KYC, scoring and anti-fraud APIs.',
          'Automatic versioning, rollback and Mixpanel adoption events.',
        ],
      },
      {
        title: 'Making complex modules easier to navigate',
        body: 'The redesign also addressed the daily work inside each module. Widget and template properties moved into a persistent side panel, with quick search and filters by version and state.',
        bullets: [
          'Spaces became Experiences and Channels became Sites, supported by contextual descriptions.',
          'The in-app code editor gained linting, Code and Test data tabs, and hot reload to reduce jumps to an external IDE.',
          'The content library brought slug, author, date and live filters into one consistent table.',
        ],
      },
    ],
    metrics: [
      { value: '48%', label: 'dev time saved', detail: 'goal: 40%' },
      { value: '92%', label: 'task success', detail: 'moderated tests' },
      { value: '78%', label: 'UX improvement', detail: 'resolved inconsistencies' },
      { value: '7', label: 'sales prospects', detail: 'banks negotiating' },
    ],
    outcomes: [
      '48% developer time saved against a 40% goal',
      '92% task success in moderated tests of the new platform',
      '78% UX improvement after resolving platform inconsistencies',
      'Seven banks negotiating the Origination Builder against a goal of five',
    ],
    gallery: [
      { src: '/projects/modyo/research.webp', alt: 'Logos of products referenced in the Modyo benchmark', label: 'Benchmark references' },
      { src: '/projects/modyo/platform.webp', alt: 'Modyo color and typography foundations', label: 'Design system foundations' },
      { src: '/projects/modyo/system.webp', alt: 'Modyo overview, widgets, content types and code editor screens', label: 'Modyo 10 modules' },
      { src: '/projects/modyo/outcomes.webp', alt: 'Modyo low-code builder for multi-step onboarding forms', label: 'Low-code form builder' },
    ],
  },
  {
    id: 'mibanco',
    sourceUrl: 'https://mateo-espinosa.framer.website/projects/mibanco',
    index: '02',
    title: 'Web app transaction — MiBanco',
    client: 'MiBanco',
    name: 'Web app transaction',
    category: 'Digital banking · onboarding',
    year: 'MiBanco',
    role: 'Senior Product Designer · Discovery · Design system',
    scope: 'Onboarding, transactions, credit and CDT management',
    team: 'Product, research, development, QA and branding',
    duration: 'End-to-end product engagement',
    heroImage: '/projects/mibanco/hero.avif',
    intro:
      'As Senior Product Designer I led user research, the creation of the design system and the orchestration of the handoff with development.',
    body: [
      'By the end of 2022, MiBanco was serving more than half a million customers nationwide. Its digital channel looked old, was not very accessible and offered a product opening process that could take up to 20 minutes.',
      'The mission was to modernize the experience and accelerate growth without losing the proximity that defines the brand.',
    ],
    sections: [
      {
        title: 'The goal',
        body: 'The product needed to serve a growing customer base while making financial decisions easier to understand. The redesign connected account opening with the full banking relationship instead of treating onboarding as an isolated flow.',
      },
      {
        title: 'From curiosity to insight',
        body: 'We listened to 12 current and prospective customers to understand their pains: lengthy paperwork, technical language and poor visibility of credit status. We also benchmarked Bancolombia, Davivienda, Nequi, Daviplata, Nubank, Ualá and BBVA.',
        bullets: [
          'Progressive steps with immediate feedback.',
          'Readable cards with soft edges and a fixed bottom bar.',
          'Shorter, clearer onboarding flows from modern neobanks and fintechs.',
        ],
      },
      {
        title: 'Making the design system',
        body: 'We updated the traditional colors with AA contrasts for accessibility, introduced Inter for digital products and built simple 2px iconography with illustrations celebrating Colombian micro-enterprise.',
        bullets: [
          'Atomic Design from atoms to pages.',
          'Reusable buttons, icons and patterns across dozens of contexts.',
          'A shared foundation for design, development and QA.',
        ],
      },
      {
        title: 'An experience with purpose',
        body: 'The new experience combined secure onboarding with a transactional portal for debit accounts, CDT investments and loans. Credit management included a simulator, dynamic conditions and immediate disbursement after approval.',
        bullets: [
          'Jumio integration for biometric and anti-fraud verification.',
          'A unified dashboard with filtered movements, hidden balances and certificates.',
          'Installment management, extra payments and payment history in one flow.',
        ],
      },
      {
        title: 'Testing and impact',
        body: 'Two rounds of moderated testing with five users each validated the solution. Clear messages and security seals increased perceived trust while the shortened onboarding made digital account opening a realistic first option.',
      },
    ],
    metrics: [
      { value: '14 → 4:30', label: 'account opening', detail: 'minutes' },
      { value: '84/100', label: 'system usability', detail: 'SUS score' },
      { value: '9/10', label: 'perceived trust', detail: 'clear messages and seals' },
      { value: '+32%', label: 'new accounts', detail: 'first post-launch quarter' },
    ],
    outcomes: [
      'Account opening reduced from 14 minutes to 4 minutes 30 seconds',
      '84/100 System Usability Scale score',
      '+32% new accounts in the first post-launch quarter',
      '18% of users moved from physical channels to digital as their first option',
      '+22% increase in credit sales completed fully online',
    ],
    gallery: [
      { src: '/projects/mibanco/research.webp', alt: 'Logos of banks referenced in the MiBanco benchmark', label: 'Benchmark references' },
      { src: '/projects/mibanco/system.webp', alt: 'MiBanco design system', label: 'Design system' },
      { src: '/projects/mibanco/experience.webp', alt: 'MiBanco mobile and desktop sign-in screens', label: 'Responsive sign-in' },
      { src: '/projects/mibanco/outcomes.webp', alt: 'MiBanco account overview, movements and credit detail screens', label: 'Accounts and credit management' },
    ],
  },
  {
    id: 'credicorp',
    sourceUrl: 'https://mateo-espinosa.framer.website/projects/divisas-cc',
    index: '03',
    title: 'Credicorp Capital — Corporate FX Module',
    client: 'Credicorp Capital',
    name: 'Corporate FX Module',
    category: 'Corporate banking · FX',
    year: '2024 – 2025',
    role: 'Senior Product Designer · Discovery · Rebranding',
    scope: 'Transaction, backoffice, FX and compliance forms',
    team: 'Corporate clients, treasury, operations and engineering',
    duration: 'Platform module engagement',
    heroImage: '/projects/credicorp/hero.avif',
    intro:
      'We turned a phone-based FX process into a fully digital experience, letting corporate treasurers negotiate, book and settle foreign-currency deals — plus auto-generate Banco de la República forms — in under five minutes.',
    body: [
      'The work consolidated the foreign-exchange journey into a single digital touchpoint inside Canal Digital Corporativo, removing the dependency on phone or email negotiations with treasury officers.',
      'The product connected quote, settlement, compliance and audit history in one experience for high-consequence corporate workflows.',
    ],
    sections: [
      {
        title: 'The goal',
        body: 'The opportunity was to guide treasurers toward self-service booking, streamline the path from quote to settlement, reduce operational rework and create a more transparent experience for corporate clients.',
      },
      {
        title: 'Discovery & research',
        body: 'Stakeholder mapping uncovered five disconnected systems. We observed eight corporate treasurers executing monthly FX hedges and interviewed operations staff who reconciled forms. The critical pain was clear: treasurers feared losing a quoted spread while juggling paperwork.',
        bullets: [
          'Competitive analysis across BBVA Net Cash, CitiDirect, Bancolombia, Davivienda, Itaú and Scotiabank.',
          'None of the benchmarked products automated Colombian cambio forms end to end.',
          'A journey map connected the treasury desk, compliance and settlement moments.',
        ],
      },
      {
        title: 'Solution overview',
        body: 'We embedded a Foreign Exchange Module directly in Canal Digital Corporativo. The architecture connected a React micro-frontend and Node BFF to treasury pricing, compliance validation and core banking settlement services.',
        bullets: [
          'Live FX quotes with a 30-second lock timer.',
          'Automatic Forms 1–6 population with ERP data and contextual help.',
          'Dual approval workflow and searchable vouchers, forms and signatures.',
        ],
      },
      {
        title: 'Feature deep dive',
        body: 'The rate board streamed quotes and exposed the spread breakdown before confirmation. Cambio forms pre-filled 80% of their fields, smart defaults accelerated multi-account settlement and a timeline made approval and audit history explicit.',
      },
      {
        title: 'Iteration design',
        body: 'Maze testing with eight treasurers showed 87% first-try success and exposed confusion around the template icon. Two further rounds with ten participants improved the operation-to-numeral mapping and lifted SUS from 50 to 82. A three-week pilot with five clients transacting US$12M confirmed zero data-entry errors.',
        bullets: [
          'Pilot feedback led to a Templates drawer that reduced form entry from four minutes to 90 seconds.',
        ],
      },
      {
        title: 'Next steps identified',
        body: 'The original case closed with a roadmap for extending the module. These were opportunities for future work, rather than delivered features.',
        bullets: [
          'Multi-currency netting for subsidiaries.',
          'A scenario simulator for hedge effectiveness.',
          'Exploration of faster cross-border settlement rails.',
        ],
      },
    ],
    metrics: [
      { value: 'US$1.2B', label: 'traded digitally', detail: 'first six months' },
      { value: '96%', label: 'faster settlement', detail: 'cycle-time reduction' },
      { value: '340h', label: 'ops time saved', detail: 'per month' },
      { value: '+25%', label: 'spread revenue', detail: 'faster deal flow' },
    ],
    outcomes: [
      'US$1.2B traded digitally in the first six months, four times forecast',
      'Settlement cycle time fell by 96%',
      'Operations saved 340 staff-hours per month',
      'Spread revenue increased 25% through faster deal flow',
    ],
    gallery: [
      { src: '/projects/credicorp/research.webp', alt: 'Logos of banks referenced in the Credicorp benchmark', label: 'Benchmark references' },
      { src: '/projects/credicorp/module.webp', alt: 'Credicorp desktop and mobile foreign-exchange forms', label: 'Responsive FX forms' },
      { src: '/projects/credicorp/flows.webp', alt: 'Credicorp document upload step displayed on a laptop', label: 'Supporting documents' },
      { src: '/projects/credicorp/outcomes.webp', alt: 'Credicorp foreign-exchange approval and reusable template screens', label: 'Approvals and templates' },
    ],
  },
  {
    id: 'dando',
    sourceUrl: 'https://mateo-espinosa.framer.website/projects/dando',
    index: '04',
    title: 'Dando by CFG',
    client: 'CFG Partners',
    name: 'Dando by CFG',
    category: 'Digital lending · onboarding',
    year: 'Dando by CFG',
    role: 'Product Designer · Discovery · Design system',
    scope: 'Loan simulator, KYC, onboarding and sales backoffice',
    team: 'CFG Partners, sales, risk, treasury and engineering',
    duration: 'MVP product engagement',
    heroImage: '/projects/dando/hero.avif',
    intro:
      'CFG Partners asked us to transform its loan process — slow, face-to-face and full of paperwork — into a 100% digital experience without losing human proximity.',
    body: [
      'The product needed to attract new customers, incorporate them through online onboarding and accompany them with tailored financial offers.',
      'The experience combined an interactive credit simulator, frictionless identity verification, digital signing and a backoffice for sales teams.',
    ],
    sections: [
      {
        title: 'The goal',
        body: 'The challenge boiled down to three objectives: attract new customers, capture and verify their information online, and accompany them with tailored financial offers.',
        bullets: [
          'Make loans repaid through payroll deductions easier to understand before applying.',
          'Remove office visits and repeated document handoffs.',
          'Give sales teams traceable, coordinated work instead of Excel and email.',
        ],
      },
      {
        title: 'Research & insights',
        body: 'Eight semi-structured sessions with police and military — Dando CFG’s majority audience — exposed the trust, repetition and geographical barriers inside the old journey.',
        bullets: [
          'Pain over duplicate data and repeated photocopies.',
          'Fear about where identity documents ended up.',
          'Travel to offices made it hard to compare offers.',
          '“If I could do everything from my cell phone with someone to guide me, it would be easier and more intuitive.”',
        ],
      },
      {
        title: 'Building the design system',
        body: 'Starting from zero digital brand assets, we defined an accessible foundation in six weeks and built the parametric components needed for Figma and React.',
        bullets: [
          'AA/AAA palette, fluid type scale and 8px grid.',
          'Atomic buttons, inputs and badges with documented tokens.',
          'Spacing, shadows and radius foundations for design, development and QA.',
        ],
      },
      {
        title: 'Deciding what to build first',
        body: 'We grouped research opportunities in an affinity-mapping workshop, then used an Effort × Value matrix to weigh business and user value. Four pillars defined the MVP.',
        bullets: [
          'A credit simulator to make costs clear before applying.',
          'Contextual chatbot and FAQ support to answer questions without scaling the advisory team.',
          'KYC verification to support identity checks and faster approvals.',
          'A commercial backoffice to coordinate sales and treasury.',
        ],
      },
      {
        title: 'Opening the door to the user',
        body: 'The interactive simulator asked only for amount and term, then showed monthly payment, rates, insurance and advice in real time. Microcopy taught while guiding, and the state persisted if a user left and returned.',
        bullets: [
          'Jumio OCR and facial biometrics with two clear KYC steps.',
          'Immediate feedback for blurry captures or reflections.',
          'Cloud document repository, ONAC electronic signature and instant file validation.',
        ],
      },
      {
        title: 'The engine inside: sales backoffice',
        body: 'A CRM-style dashboard replaced Excel and email with status filters, urgency tags, granular permissions and bulk actions. Response time to users dropped from 48 hours to four hours.',
      },
      {
        title: 'Lessons learned',
        body: 'The project reinforced three practices that helped connect the customer journey to the work of internal teams.',
        bullets: [
          'Invest in the design system early to save time during development and QA.',
          'Co-design with sales from the wireframe stage to avoid functional rework.',
          'Separate identity verification from the offer so each onboarding step can improve independently.',
        ],
      },
    ],
    metrics: [
      { value: '22,000', label: 'new customers / month', detail: 'after MVP' },
      { value: '60,000', label: 'requests processed', detail: 'after MVP' },
      { value: '+158%', label: 'new customers', detail: 'MVP impact' },
      { value: '+45%', label: 'operational efficiency', detail: 'net gain' },
    ],
    outcomes: [
      'New customers increased from 8,500 to 22,000 per month (+158%)',
      'Requests processed increased from 18,000 to 60,000 (+233%)',
      'Operational efficiency improved by a 45% net gain',
      'Response time to users dropped from 48 hours to four hours',
    ],
    gallery: [
      { src: '/projects/dando/research.webp', alt: 'Logos of financial products used as references for Dando', label: 'Market references' },
      { src: '/projects/dando/system.webp', alt: 'Dando personal information and application progress screens', label: 'Onboarding and application status' },
      { src: '/projects/dando/flows.webp', alt: 'Dando acceptance and signature step on a mobile phone', label: 'Acceptance and signing' },
      { src: '/projects/dando/outcomes.webp', alt: 'Dando loan pre-offer simulator and mobile welcome screen', label: 'Loan simulation and first use' },
    ],
  },
  {
    id: 'kapital',
    index: '05',
    title: 'Kapital Colombia — Factoring end to end',
    client: 'Kapital Colombia',
    name: 'Factoring end to end',
    category: 'SME financing · Factoring',
    year: 'Kapital Bank · 2025',
    role: 'Lead Product Designer · End to end',
    scope: 'Benchmark, business rules, CesionBnk and RADIAN integration, and the factoring dashboard',
    team: 'Country Manager Colombia, Product Mexico and Colombia, commercial, accounting and engineering',
    duration: '2025 · Colombia market launch',
    heroImage: '/projects/kapital/hero.avif',
    heroFit: 'contain',
    intro:
      'Kapital already ran factoring in Mexico. Colombia meant rebuilding it on different ground — electronic invoices as negotiable titles, the RADIAN registry and a digital-correspondent banking model — so an SME could turn receivables into cash without leaving the portal.',
    body: [
      'I led the Colombian factoring product end to end: from benchmarking the market and aligning three product perspectives, to translating commercial and accounting rules into interface decisions and designing the dashboard businesses use every day.',
      'The product runs on CesionBnk, the provider that validates invoices against DIAN and registers the assignment in RADIAN. The design job was to turn those technical states into a clear, predictable experience for the person financing an invoice.',
    ],
    sections: [
      {
        title: 'The goal',
        body: 'Launch a factoring product in Colombia that businesses could understand and operate on their own, with the same trust Kapital had built in Mexico but adapted to local regulation and market habits.',
        bullets: [
          'Invoice-to-cash without relying on manual support.',
          'The cost of financing visible before the customer commits.',
          'Every invoice traceable from upload to disbursement.',
        ],
      },
      {
        title: 'One product, three perspectives',
        body: 'The Country Manager in Colombia brought the market, the regulatory context and the partners. Product Mexico brought the operating model and the lessons from factoring already in production. Product Colombia owned local adaptation and delivery. Design worked as the connective layer between them.',
        bullets: [
          'A shared service blueprint tied customer steps to commercial, accounting and provider processes.',
          'A weekly rhythm with the three product voices, with decisions written down and traceable.',
          'Mexican flows reused where the model held, redesigned where Colombian rules changed it.',
        ],
      },
      {
        title: 'Benchmark: local players and regional references',
        body: 'Before drawing a screen we studied how the market already financed invoices. The Colombian set covered Finaktiva, Mesfix, Klym and Logros. For the regional and internal references we looked at Xepelin, Konfío and Kapital’s own factoring in Mexico.',
        bullets: [
          'Dimensions compared: invoice upload (manual versus DIAN), clarity of discount and fees, time to approval, and status tracking.',
          'The same questions asked of every product: what does the customer know before committing, and what happens after?',
          'Findings became design principles: show the amount to receive early, keep one status vocabulary, and make every invoice inspectable.',
        ],
      },
      {
        title: 'CesionBnk and RADIAN: making the invoice a title',
        body: 'CesionBnk checks each invoice against DIAN, confirms its status as a negotiable title and registers the assignment in RADIAN. The design problem was translation: provider states are precise but opaque, while customers need to know where their money is.',
        bullets: [
          'Provider and registry states mapped to four customer-facing groups: Por cobrar, Pendientes, Aprobadas and Rechazadas.',
          'Approved operations split into disbursement, in Kapital and finalized, so the next step is always clear.',
          'Rejections explain the reason, and the analysis window — 24 hours — is stated up front.',
        ],
      },
      {
        title: 'Business rules with commercial and accounting',
        body: 'The product only works if the interface enforces the same rules the business does. Commercial and accounting sat with product and design to turn policy into validations, calculations and copy.',
        bullets: [
          'Eligibility: only invoices accepted in RADIAN, not previously assigned and within the allowed due-date window can be financed.',
          'Limits and risk: limits per issuer and payer, concentration controls and approved payers shape what can be selected.',
          'Pricing: discount by days to finance, disbursement commission and tax roll up into one amount to receive that reconciles with accounting.',
        ],
      },
      {
        title: 'The factoring dashboard',
        body: 'The dashboard gives the business one place to see what it has financed and what is pending: monthly negotiated invoices, top suppliers, and a status-driven invoice table. Operations open into a clear summary and each invoice into its electronic document.',
        bullets: [
          'Search by name or NIT, and filter by issue or due date.',
          'Manual invoice upload alongside DIAN import.',
          'Operation detail with discount, total to finance and amount to receive; invoice view with CUFE.',
          'Empty and first-use states, and layouts from 1280 to 1920 pixels.',
        ],
      },
    ],
    metrics: [],
    metricsNote: 'Business metrics for this project have not been published.',
    outcomesLabel: 'Design deliverables',
    outcomes: [
      'A factoring dashboard with invoice search, date filters and operation tracking',
      'Customer-facing states for invoice validation, approval and disbursement',
      'Operation summaries showing discount, financing total and amount to receive',
      'Manual and DIAN invoice upload flows, with electronic invoice detail',
    ],
    gallery: [
      { src: '/projects/kapital/states.webp', alt: 'Kapital factoring dashboard with pending operations', label: 'Operation states' },
      { src: '/projects/kapital/detail.webp', alt: 'Kapital factoring operation summary', label: 'Operation detail' },
      { src: '/projects/kapital/invoice.webp', alt: 'Kapital electronic invoice view with CUFE', label: 'Invoice view' },
      { src: '/projects/kapital/filters.webp', alt: 'Kapital factoring search and filters', label: 'Search and filters' },
    ],
  },
]

export const selectedClients = [
  { org: 'Modyo', detail: 'DXP · Design system · Low-code', context: 'Client work' },
  { org: 'MiBanco', detail: 'Onboarding · Transactions · Credit · CDTs', context: 'Client work' },
  { org: 'Credicorp Capital', detail: 'Corporate FX · Treasury · Backoffice', context: 'Client work' },
  { org: 'Dando by CFG', detail: 'Lending · KYC · Onboarding · Backoffice', context: 'Client work' },
  { org: 'Kapital Bank', detail: 'Factoring · RADIAN · SME financing', context: 'Client work' },
  { org: 'Rappi', detail: 'Merchants · Restaurants · Mi Tienda', context: 'Current role' },
]

export const experience = [
  {
    org: 'Rappi',
    role: 'Product Designer · Merchants',
    span: '2025 – present',
    summary: 'Merchant onboarding and operations across menus, promotions, ads and business settings. AI tools support live prototypes and design system work.',
  },
  {
    org: 'Kapital Bank',
    role: 'Product Designer · Colombia',
    span: '2025',
    summary: 'Led UX and product initiatives for Colombia, including end-to-end factoring, invoice sales, disbursements and platform operations.',
  },
  {
    org: 'Credicorp Capital',
    role: 'Senior Product Designer',
    span: '2024 – 2025',
    summary: 'Led UX and product design for the unified brokerage and fiduciary channel, with customer interviews and testing across client types.',
  },
  {
    org: 'Modyo Platform',
    role: 'Product Designer · Design systems',
    span: '2023 – 2024',
    summary: 'Co-led Modyo 10, built the first Figma and Storybook design system, and created the Dynamic Framework UI and banking demos.',
  },
  {
    org: 'Modyo Services',
    role: 'UX/UI Designer',
    span: '2022 – 2023',
    summary: 'Discovery, onboarding and design systems for MiBanco, Banco Mundo Mujer and CFG / Bci, with product work in Chile and Mexico.',
  },
  {
    org: 'Brace Developers',
    role: 'Consultant · UI Developer',
    span: '2021',
    summary: 'Documented the design and delivery process, implemented interfaces with React, Next.js and Tailwind CSS, and coordinated with backend, QA and design.',
  },
]
