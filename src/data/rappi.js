// This case extends the portfolio's existing editorial layout. Real prototype
// screens lead the story; the reported outcomes come from Mateo's project brief.
export const rappiTranslationsEs = {}
const copy = (english, spanish) => {
  rappiTranslationsEs[english] = spanish
  return english
}

export const rappiProject = {
  id: 'rappi',
  index: '01',
  title: 'Rappi Aliados',
  name: 'One place to run a restaurant.',
  client: 'Rappi · Merchants',
  category: copy('Merchant operations · Mobile & tablet', 'Operación de restaurantes · Móvil y tablet'),
  year: '2025 – present',
  role: 'Product Designer · Merchants',
  scope: copy('Unified app, login, orders, users and roles, and design system', 'Aplicación unificada, acceso, órdenes, usuarios y roles, y sistema de diseño'),
  team: copy('Product design, engineering and QA', 'Diseño de producto, desarrollo y QA'),
  duration: copy('2025 – present · Ongoing product work', '2025 – hoy · Trabajo continuo de producto'),
  heroImage: '/projects/rappi/hero.webp',
  layout: 'story',
  summary: copy('Mateo brought Portal Partners and Portal Aliados together in one Rappi Aliados experience for mobile and tablet.', 'Mateo unificó Portal Partners y Portal Aliados en una experiencia de Rappi Aliados para móvil y tablet.'),
  processSummary: copy('The Rappi Aliados process connects platform unification, a shared design system, working prototypes built with Claude Code and Cursor, and inspectable edge cases for engineering and QA.', 'El proceso de Rappi Aliados conecta la unificación de portales, un sistema de diseño compartido, prototipos funcionales construidos con Claude Code y Cursor, y casos borde que desarrollo y QA pueden revisar.'),
  processSteps: [
    { title: copy('Platform unification', 'Unificación de la plataforma'), body: copy('Bring the restaurant’s modules, users and roles into one Rappi Aliados experience.', 'Reunir los módulos, usuarios y roles del restaurante en una experiencia de Rappi Aliados.') },
    { title: copy('Shared design system', 'Sistema de diseño compartido'), body: copy('Align Rappi components and patterns with the GitHub repository.', 'Alinear los componentes y patrones de Rappi con el repositorio en GitHub.') },
    { title: copy('Code prototyping', 'Prototipado en código'), body: copy('Build working mobile and tablet flows with Claude Code and Cursor.', 'Construir flujos funcionales para móvil y tablet con Claude Code y Cursor.') },
    { title: copy('Scenarios and handoff', 'Escenarios y entrega'), body: copy('Make edge cases inspectable for engineering and QA, with design output they can build from.', 'Hacer que desarrollo y QA puedan revisar los casos borde y construir a partir del output de diseño.') },
  ],
  intro: copy(
    'A restaurant should not need two portals to run one business. Rappi Aliados brings the daily operation together: orders, data, finance, menu and team access, across mobile and tablet.',
    'Un restaurante no debería necesitar dos portales para gestionar un solo negocio. Rappi Aliados reúne la operación diaria: órdenes, datos, financiero, menú y acceso del equipo, desde móvil y tablet.',
  ),
  body: [
    copy('I worked on the experience that brings Portal Partners and Portal Aliados into one application. The work connects everyday restaurant tasks with a shared design system and working prototypes that engineering and QA can use directly.', 'Trabajé en la experiencia que reúne Portal Partners y Portal Aliados en una sola aplicación. El trabajo conecta las tareas diarias del restaurante con un sistema de diseño compartido y prototipos funcionales que desarrollo y QA pueden utilizar directamente.'),
  ],
  unification: {
    before: ['Portal Partners', 'Portal Aliados'],
    after: 'Rappi Aliados',
    modules: [copy('Orders', 'Órdenes'), copy('Data', 'Datos'), copy('Finance', 'Financiero'), copy('Menu', 'Menú')],
    benefit: copy('One workspace. Shared access. Clear responsibilities.', 'Un espacio de trabajo. Acceso compartido. Responsabilidades claras.'),
  },
  metrics: [
    { value: '−25%', label: copy('merchant churn', 'churn de comercios'), detail: copy('after platform unification', 'tras la unificación de la plataforma') },
    { value: '+45%', label: copy('process efficiency', 'eficiencia del proceso'), detail: copy('design and feature delivery', 'diseño y entrega de funcionalidades') },
    { value: '80%', label: copy('design workflow with AI', 'trabajo de diseño con IA'), detail: 'Claude Code + Cursor' },
    { value: '70%', label: copy('usefulness for engineering', 'utilidad para desarrollo'), detail: copy('of the design output', 'del output de diseño') },
  ],
  metricsSource: copy('Project results reported by Mateo Espinosa.', 'Resultados del proyecto reportados por Mateo Espinosa.'),
  screensNote: copy('Screens from the interactive prototype, using example restaurant and order data.', 'Pantallas del prototipo interactivo, con datos de ejemplo de restaurantes y órdenes.'),
  sections: [
    {
      title: copy('A recognizable way in.', 'Un acceso que se reconoce.'),
      body: copy('The orange welcome screen brings Rappi’s bag and food imagery into the entry point. The same identity carries from a quick sign-in on a phone to a tablet used at the restaurant, without making either device feel like a reduced desktop portal.', 'La bienvenida naranja lleva la bolsa y la comida de Rappi al punto de entrada. La misma identidad conecta el acceso rápido desde el teléfono con la tablet del restaurante, sin convertir ninguno de los dispositivos en una versión reducida de un portal de escritorio.'),
      bullets: [
        copy('One Rappi Aliados identity instead of separate entry points for each portal.', 'Una identidad de Rappi Aliados en lugar de accesos separados para cada portal.'),
        copy('Login, recovery and account states are part of the same experience.', 'El ingreso, la recuperación y los estados de cuenta forman parte de la misma experiencia.'),
      ],
      imageIds: ['login-tablet', 'login-mobile', 'credentials-mobile'],
    },
    {
      title: copy('From finding an order to knowing what to do.', 'De encontrar una orden a saber qué hacer.'),
      body: copy('Orders are the daily operating surface. Store and status filters help merchants focus on the right work; order details bring the items, fulfillment status and next action into the same flow. Tablet makes room for several groups of orders and a wider detail view, while mobile puts the next action within reach.', 'Las órdenes son el espacio de operación diaria. Los filtros por tienda y estado ayudan al comercio a enfocarse; el detalle reúne los productos, el estado de entrega y la siguiente acción en el mismo flujo. La tablet permite ver varios grupos de órdenes y un detalle más amplio, mientras el móvil mantiene la siguiente acción a mano.'),
      bullets: [
        copy('Mobile keeps the operation within reach while moving around the restaurant.', 'El móvil mantiene la operación a mano mientras el equipo se mueve por el restaurante.'),
        copy('Tablet gives the team more context through grouped orders and a wider detail layout.', 'La tablet ofrece más contexto con órdenes agrupadas y un detalle más amplio.'),
        copy('Filters support restaurant owners managing more than one store.', 'Los filtros apoyan a los dueños que gestionan más de una tienda.'),
      ],
      imageIds: ['orders-tablet', 'orders-mobile', 'detail-mobile', 'detail-tablet'],
    },
    {
      title: copy('The right stores, in focus.', 'Las tiendas correctas, en foco.'),
      body: copy('A restaurant owner may manage several stores. Country, brand and store filters narrow the operation to the locations that matter at that moment. The same selection pattern works on mobile and tablet, with the selected stores visible before applying the filter.', 'Un dueño puede gestionar varias tiendas. Los filtros por país, marca y tienda permiten enfocar la operación en los locales que importan en ese momento. El mismo patrón funciona en móvil y tablet, con las tiendas seleccionadas visibles antes de aplicar el filtro.'),
      bullets: [
        copy('Keep multi-store work within the same application.', 'Mantener la gestión de varias tiendas dentro de la misma aplicación.'),
        copy('Review the selected scope before returning to the operation.', 'Revisar el alcance seleccionado antes de volver a la operación.'),
      ],
      imageIds: ['filters-tablet', 'filters-mobile'],
    },
    {
      title: copy('One platform, with access that fits the team.', 'Una plataforma con acceso para cada equipo.'),
      body: copy('The unification also brings users and roles into one portal. Restaurant owners can distribute responsibilities across their team while keeping orders, data, finance and menu within the same product. The benefit is a clearer way to use and manage access across the restaurant’s operation.', 'La unificación también reúne usuarios y roles en un solo portal. Los dueños pueden distribuir responsabilidades entre sus equipos y mantener órdenes, datos, financiero y menú dentro del mismo producto. El beneficio es una experiencia más clara de uso y de gestión de accesos para la operación del restaurante.'),
      bullets: [
        copy('A shared place to manage users and their responsibilities.', 'Un mismo lugar para gestionar usuarios y sus responsabilidades.'),
        copy('A more coherent experience across the modules the restaurant uses every day.', 'Una experiencia más coherente entre los módulos que el restaurante utiliza a diario.'),
        copy('Reported merchant churn decreased by 25% with the unified application.', 'El churn de comercios reportado disminuyó un 25% con la aplicación unificada.'),
      ],
      imageIds: ['users-tablet', 'roles-tablet'],
    },
    {
      title: copy('A design system that reaches the repository.', 'Un sistema de diseño que llega al repositorio.'),
      body: copy('The previous experiences did not share a unified design system with Rappi’s identity. We built a common language of components and patterns, aligned with a GitHub repository. Design and engineering can work from the same foundation as new features are created.', 'Las experiencias anteriores no compartían un sistema de diseño unificado con la esencia de Rappi. Construimos un lenguaje común de componentes y patrones, alineado con un repositorio en GitHub. Diseño y desarrollo pueden trabajar desde la misma base al crear nuevas funcionalidades.'),
      bullets: [
        copy('Shared components carry the same Rappi identity across mobile and tablet.', 'Los componentes compartidos llevan la misma identidad de Rappi a móvil y tablet.'),
        copy('The project reported a 45% improvement in the efficiency of the design and feature-delivery process.', 'El proyecto reportó una mejora del 45% en la eficiencia del proceso de diseño y entrega de funcionalidades.'),
      ],
      imageIds: [],
      workflow: [
        { title: 'Rappi DS', body: copy('A shared foundation for brand, components and interaction.', 'Una base compartida de marca, componentes e interacción.') },
        { title: 'GitHub', body: copy('Components aligned with the repository that teams build from.', 'Componentes alineados con el repositorio desde el que construyen los equipos.') },
        { title: copy('Working prototype', 'Prototipo funcional'), body: copy('Real flows and selectable states to inspect together.', 'Flujos reales y estados seleccionables para revisar en equipo.') },
        { title: copy('Engineering + QA', 'Desarrollo + QA'), body: copy('A source to use in the harness and a common reference for scenarios.', 'Una fuente para utilizar en el harness y una referencia común de los escenarios.') },
      ],
    },
    {
      title: copy('Working software as the design handoff.', 'Software funcional como entrega de diseño.'),
      body: copy('Around 80% of the design work was developed with Claude Code and Cursor. The output is an interactive source that engineering can take into its harness and build from. The reported usefulness of that design output for development was 70%.', 'Cerca del 80% del trabajo de diseño se desarrolló con Claude Code y Cursor. El resultado es una fuente interactiva que desarrollo puede llevar a su harness para construir a partir de ella. La utilidad reportada de ese output de diseño para desarrollo fue del 70%.'),
      bullets: [
        copy('Interaction, layout and component behavior can be inspected in the prototype itself.', 'La interacción, la estructura y el comportamiento de los componentes se pueden revisar en el propio prototipo.'),
        copy('Edge cases are implemented as selectable scenarios, so QA and engineering can inspect more than the happy path.', 'Los casos borde están implementados como escenarios seleccionables para que QA y desarrollo revisen más que el camino ideal.'),
        copy('Authentication errors, recovery, restricted access and connection states can be reviewed before implementation.', 'Los errores de autenticación, la recuperación, el acceso restringido y los estados de conexión se pueden revisar antes de implementar.'),
      ],
      imageIds: ['qa-scenarios-mobile'],
    },
  ],
  outcomesLabel: copy('What changed for merchants and teams', 'Qué cambió para los comercios y los equipos'),
  outcomes: [
    copy('Portal Partners and Portal Aliados became one Rappi Aliados experience.', 'Portal Partners y Portal Aliados se convirtieron en una sola experiencia de Rappi Aliados.'),
    copy('Orders, data, finance, menu, users and roles share one place to work.', 'Órdenes, datos, financiero, menú, usuarios y roles comparten un mismo espacio de trabajo.'),
    copy('Reported merchant churn decreased by 25% after the unification.', 'El churn de comercios reportado disminuyó un 25% tras la unificación.'),
    copy('A GitHub-aligned design system supported a reported 45% improvement in process efficiency.', 'Un sistema de diseño alineado con GitHub apoyó una mejora reportada del 45% en la eficiencia del proceso.'),
    copy('80% of the design workflow used Claude Code and Cursor; the design output had 70% reported usefulness for development.', 'El 80% del trabajo de diseño utilizó Claude Code y Cursor; el output de diseño tuvo una utilidad reportada del 70% para desarrollo.'),
    copy('Implemented edge cases gave engineering and QA a shared source to inspect.', 'Los casos borde implementados dieron a desarrollo y QA una fuente compartida para revisar.'),
  ],
  gallery: [
    { id: 'login-tablet', src: '/projects/rappi/login-tablet.jpg', device: 'tablet', width: 1224, height: 864, frameRadius: 40, label: copy('Tablet · Welcome back', 'Tablet · Usuario recurrente'), alt: copy('Rappi Aliados tablet welcome for a returning user, with orange bag-and-food photography behind the status bar', 'Bienvenida de Rappi Aliados en tablet para un usuario recurrente, con fotografía naranja de la bolsa y la comida detrás de la barra de estado') },
    { id: 'login-mobile', src: '/projects/rappi/login-mobile.jpg', device: 'phone', width: 417, height: 876, frameRadius: 56, label: copy('Mobile · Welcome back', 'Móvil · Usuario recurrente'), alt: copy('Rappi Aliados mobile welcome for a returning user, with the saved account and status indicators over the orange background', 'Bienvenida móvil de Rappi Aliados para un usuario recurrente, con la cuenta recordada y los indicadores de estado sobre el fondo naranja') },
    { id: 'credentials-mobile', src: '/projects/rappi/credentials-mobile.jpg', device: 'phone', width: 417, height: 876, frameRadius: 56, label: copy('Mobile · Returning account sign-in', 'Móvil · Acceso de usuario recurrente'), alt: copy('Rappi Aliados password screen for a saved account', 'Pantalla de contraseña de Rappi Aliados para una cuenta recordada') },
    { id: 'orders-tablet', src: '/projects/rappi/orders-tablet.jpg', device: 'tablet', width: 1224, height: 864, frameRadius: 40, label: copy('Tablet · Orders at a glance', 'Tablet · Órdenes de un vistazo'), alt: copy('Rappi Aliados tablet orders grouped by preparation and delivery status', 'Órdenes de Rappi Aliados para tablet agrupadas por estado de preparación y entrega') },
    { id: 'orders-mobile', src: '/projects/rappi/orders-mobile.jpg', device: 'phone', width: 417, height: 876, frameRadius: 56, label: copy('Mobile · The daily operation', 'Móvil · La operación diaria'), alt: copy('Rappi Aliados mobile orders with status filters and restaurant navigation', 'Órdenes móviles de Rappi Aliados con filtros por estado y navegación del restaurante') },
    { id: 'detail-mobile', src: '/projects/rappi/detail-mobile.jpg', device: 'phone', width: 417, height: 876, frameRadius: 56, label: copy('Mobile · Order detail', 'Móvil · Detalle de la orden'), alt: copy('Mobile order detail with products, fulfillment state and actions', 'Detalle móvil de la orden con productos, estado de entrega y acciones') },
    { id: 'detail-tablet', src: '/projects/rappi/detail-tablet.jpg', device: 'tablet', width: 1224, height: 864, frameRadius: 40, label: copy('Tablet · More room for the details', 'Tablet · Más espacio para el detalle'), alt: copy('Tablet order detail with products, preparation time and delivery information', 'Detalle de la orden en tablet con productos, tiempo de preparación e información de entrega') },
    { id: 'filters-tablet', src: '/projects/rappi/filters-tablet.jpg', device: 'tablet', width: 1224, height: 864, frameRadius: 40, label: copy('Tablet · Focus on the right stores', 'Tablet · Enfocarse en las tiendas correctas'), alt: copy('Store filters in the Rappi Aliados tablet experience', 'Filtros de tiendas en la experiencia de Rappi Aliados para tablet') },
    { id: 'filters-mobile', src: '/projects/rappi/filters-mobile.jpg', device: 'phone', width: 417, height: 876, frameRadius: 56, label: copy('Mobile · Store filters', 'Móvil · Filtros de tiendas'), alt: copy('Rappi Aliados mobile store selector and filters', 'Selector y filtros de tiendas de Rappi Aliados en móvil') },
    { id: 'users-tablet', src: '/projects/rappi/users-tablet.jpg', device: 'tablet', width: 1224, height: 864, frameRadius: 40, label: copy('Tablet · Users and roles in one place', 'Tablet · Usuarios y roles en un solo lugar'), alt: copy('Rappi Aliados users and roles management for restaurant teams', 'Gestión de usuarios y roles de Rappi Aliados para los equipos del restaurante') },
    { id: 'roles-tablet', src: '/projects/rappi/roles-tablet.jpg', device: 'tablet', width: 1224, height: 864, frameRadius: 40, label: copy('Tablet · Clear responsibilities', 'Tablet · Responsabilidades claras'), alt: copy('Rappi Aliados roles for owners, store administrators, operators, campaign and finance managers', 'Roles de Rappi Aliados para dueños, administradores de tienda, operadores, gestores de campañas y financieros') },
    { id: 'qa-scenarios-mobile', src: '/projects/rappi/qa-scenarios-mobile.jpg', device: 'phone', width: 393, height: 852, label: copy('Prototype · Edge cases made inspectable', 'Prototipo · Casos borde que se pueden revisar'), alt: copy('Scenario lab showing login errors, recovery, restricted access and offline cases', 'Laboratorio de escenarios con errores de ingreso, recuperación, acceso restringido y casos sin conexión') },
  ],
}

rappiTranslationsEs[rappiProject.name] = 'Un solo lugar para gestionar un restaurante.'
rappiTranslationsEs['Two portals, one workspace'] = 'Dos portales, un espacio de trabajo'
rappiTranslationsEs['{count} products, real responsibilities'] = '{count} productos, responsabilidades reales'
rappiTranslationsEs['Rappi Aliados'] = 'Rappi Aliados'
rappiTranslationsEs['Rappi · Merchants'] = 'Rappi · Comercios'
rappiTranslationsEs['Rappi DS'] = 'Rappi DS'
rappiTranslationsEs.GitHub = 'GitHub'
rappiTranslationsEs['Claude Code + Cursor'] = 'Claude Code + Cursor'

export const rappiRoleScope = copy('Rappi Aliados: unifying Portal Partners and Portal Aliados across mobile and tablet, with shared users, roles and Rappi DS.', 'Rappi Aliados: unificación de Portal Partners y Portal Aliados en móvil y tablet, con usuarios, roles y Rappi DS compartidos.')
export const rappiExperienceSummary = copy('Unifying restaurant operations across mobile and tablet with Rappi Aliados. Shared components, working prototypes and explicit scenarios connect product design with engineering and QA.', 'Unificación de la operación de restaurantes en móvil y tablet con Rappi Aliados. Componentes compartidos, prototipos funcionales y escenarios explícitos conectan diseño de producto con desarrollo y QA.')
