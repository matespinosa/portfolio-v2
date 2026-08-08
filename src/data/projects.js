export const projects = [
  {
    id: 'modyo',
    index: '01',
    title: 'Modyo Platform',
    category: 'DXP · design system · low-code',
    year: 'Modyo',
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
    ],
    gallery: [
      { src: '/projects/modyo/research.webp', alt: 'Modyo research and benchmark artifacts', label: 'Research & benchmark' },
      { src: '/projects/modyo/system.webp', alt: 'Modyo design system work', label: 'Design system' },
      { src: '/projects/modyo/platform.webp', alt: 'Modyo platform modules', label: 'Modyo 10' },
      { src: '/projects/modyo/outcomes.webp', alt: 'Modyo platform outcomes', label: 'Results' },
    ],
  },
  {
    id: 'mibanco',
    index: '02',
    title: 'Web app transaction — MiBanco',
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
      '+22% increase in credit sales completed fully online',
    ],
    gallery: [
      { src: '/projects/mibanco/research.webp', alt: 'MiBanco research and benchmark work', label: 'Research' },
      { src: '/projects/mibanco/system.webp', alt: 'MiBanco design system', label: 'Design system' },
      { src: '/projects/mibanco/experience.webp', alt: 'MiBanco digital banking experience', label: 'Product experience' },
      { src: '/projects/mibanco/outcomes.webp', alt: 'MiBanco testing and impact', label: 'Testing & impact' },
    ],
  },
  {
    id: 'credicorp',
    index: '03',
    title: 'Credicorp Capital — Corporate FX Module',
    category: 'Corporate banking · FX',
    year: 'Credicorp Capital',
    role: 'Product Designer · Discovery · Rebranding',
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
      { src: '/projects/credicorp/research.webp', alt: 'Credicorp Capital FX discovery work', label: 'Discovery' },
      { src: '/projects/credicorp/module.webp', alt: 'Credicorp Capital FX module', label: 'FX module' },
      { src: '/projects/credicorp/flows.webp', alt: 'Credicorp Capital transaction flows', label: 'Transaction flows' },
      { src: '/projects/credicorp/outcomes.webp', alt: 'Credicorp Capital impact', label: 'Impact' },
    ],
  },
  {
    id: 'dando',
    index: '04',
    title: 'Dando by CFG',
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
          'Make a libranza loan easier to understand before applying.',
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
      { src: '/projects/dando/research.webp', alt: 'Dando by CFG research work', label: 'Research' },
      { src: '/projects/dando/system.webp', alt: 'Dando by CFG design system', label: 'Design system' },
      { src: '/projects/dando/flows.webp', alt: 'Dando by CFG onboarding flows', label: 'Onboarding' },
      { src: '/projects/dando/outcomes.webp', alt: 'Dando by CFG launch results', label: 'Launch results' },
    ],
  },
]

export const selectedClients = [
  { org: 'Modyo', detail: 'DXP · Design system · Low-code', context: 'Client work' },
  { org: 'MiBanco', detail: 'Onboarding · Transactions · Credit · CDTs', context: 'Client work' },
  { org: 'Credicorp Capital', detail: 'Corporate FX · Treasury · Backoffice', context: 'Client work' },
  { org: 'Dando by CFG', detail: 'Lending · KYC · Onboarding · Backoffice', context: 'Client work' },
  { org: 'Rappi', detail: 'Merchants · Restaurants · Mi Tienda', context: 'Current role' },
]

export const experience = [
  { org: 'Rappi', role: 'Product Designer · Merchants', span: '2025 - now' },
  { org: 'Modyo', role: 'Product Designer · Design systems', span: 'Client engagement' },
  { org: 'Product design', role: 'Financial products & complex platforms', span: '5+ years' },
  { org: 'Frontend', role: 'React, Next.js and web foundations', span: '6+ years' },
  { org: 'AI-enabled practice', role: 'Cursor, Codex and Claude', span: '2025 - 26' },
]
