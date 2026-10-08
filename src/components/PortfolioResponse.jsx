import { useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Briefcase,
  CaretRight,
  ChartBar,
  Code,
  Compass,
  ListBullets,
  MapPin,
  Sparkle,
  TrendUp,
  User,
  UsersThree,
} from '@phosphor-icons/react'
import { experience, projects } from '../data/projects'
import { profile } from '../data/profile'
import { cleanAssistantText, responseLead } from '../lib/portfolioPresentation'
import {
  CURRENT_ROLE_ES,
  EXPERIENCE_ES,
  EXPERIENCE_ORG_ES,
  EXPERIENCE_SPAN_ES,
  METRIC_DETAILS_ES,
  METRIC_LABELS_ES,
  PROCESS_COPY_ES,
  SECTION_LABELS_ES,
} from '../data/copyEs'

const PROJECT_COPY_ES = {
  modyo: {
    title: 'Modyo Platform',
    category: 'DXP · sistema de diseño',
    summary: 'Unificó una plataforma compleja y sus herramientas low-code en un sistema compartido.',
  },
  mibanco: {
    title: 'MiBanco',
    category: 'Banca digital · onboarding',
    summary: 'Rediseñó el canal transaccional y la apertura de cuentas.',
  },
  credicorp: {
    title: 'Credicorp Capital',
    category: 'Tesorería · FX corporativo',
    summary: 'Digitalizó negociación, cumplimiento y liquidación de divisas.',
  },
  dando: {
    title: 'Dando by CFG',
    category: 'Crédito digital · KYC',
    summary: 'Diseñó préstamos 100% digitales con simulador y backoffice.',
  },
  kapital: {
    title: 'Kapital Colombia',
    category: 'Factoring · financiamiento pymes',
    summary: 'Lideró de principio a fin el factoring en Colombia sobre CesionBnk y RADIAN.',
  },
}

const ROLE_COPY_ES = {
  modyo: {
    role: 'Product Designer · Investigación · Sistema de diseño',
    scope: 'Modyo 10, herramientas low-code y fundamentos compartidos de producto.',
    team: 'Ingeniería, producto, marketing y equipos usuarios de la plataforma.',
  },
  mibanco: {
    role: 'Senior Product Designer · Discovery · Sistema de diseño',
    scope: 'Onboarding, transacciones, crédito y gestión de CDTs.',
    team: 'Producto, investigación, desarrollo, QA y branding.',
  },
  credicorp: {
    role: 'Product Designer · Discovery · Rebranding',
    scope: 'Transacciones, backoffice, FX y formularios de cumplimiento.',
    team: 'Clientes corporativos, tesorería, operaciones e ingeniería.',
  },
  dando: {
    role: 'Product Designer · Discovery · Sistema de diseño',
    scope: 'Simulador de crédito, KYC, onboarding y backoffice comercial.',
    team: 'CFG Partners, ventas, riesgo, tesorería e ingeniería.',
  },
  kapital: {
    role: 'Lead Product Designer · De principio a fin',
    scope: 'Benchmark, reglas de negocio, integración con CesionBnk y RADIAN, y dashboard de factoring.',
    team: 'Country Manager Colombia, producto México y Colombia, comercial, contabilidad e ingeniería.',
  },
}

const PRIMARY_METRICS = {
  modyo: [0, 1],
  mibanco: [0, 3],
  credicorp: [0, 1],
  dando: [2, 3],
  kapital: [0, 1],
}

const FOLLOW_UPS = {
  carousel: {
    es: [
      { label: 'Resultados', question: 'Compara los resultados de estos proyectos.', icon: ChartBar },
      { label: 'Mi rol', question: '¿Cuál fue el rol de Mateo en estos proyectos?', icon: User },
      { label: 'Proceso', question: '¿Cómo fue el proceso de diseño en estos proyectos?', icon: ListBullets },
    ],
    en: [
      { label: 'Results', question: 'Compare the results of these projects.', icon: ChartBar },
      { label: 'My role', question: "What was Mateo's role in these projects?", icon: User },
      { label: 'Process', question: 'How did the design process work across these projects?', icon: ListBullets },
    ],
  },
  metrics: {
    es: [
      { label: 'Ver proceso', question: '¿Cómo fue el proceso de diseño?', icon: ListBullets },
      { label: 'Entender el rol', question: '¿Qué rol tuvo Mateo y con qué equipo trabajó?', icon: User },
    ],
    en: [
      { label: 'View process', question: 'How did the design process work?', icon: ListBullets },
      { label: 'Understand role', question: 'What role did Mateo have and who did he work with?', icon: User },
    ],
  },
  process: {
    es: [
      { label: 'Ver resultados', question: '¿Qué resultados tuvo este proyecto?', icon: ChartBar },
      { label: 'Mi rol', question: '¿Cuál fue el rol de Mateo?', icon: User },
    ],
    en: [
      { label: 'View results', question: 'What results did this project achieve?', icon: ChartBar },
      { label: 'My role', question: "What was Mateo's role?", icon: User },
    ],
  },
  role: {
    es: [
      { label: 'Ver proceso', question: '¿Cómo fue el proceso de diseño?', icon: ListBullets },
      { label: 'Ver impacto', question: '¿Qué impacto tuvo el proyecto?', icon: ChartBar },
    ],
    en: [
      { label: 'View process', question: 'How did the design process work?', icon: ListBullets },
      { label: 'View impact', question: 'What impact did the project have?', icon: ChartBar },
    ],
  },
}

function selectedProjects(projectIds) {
  const ids = new Set(projectIds || [])
  return projects.filter((project) => ids.has(project.id))
}

function projectCopy(project, language) {
  if (language === 'es') return PROJECT_COPY_ES[project.id]
  return {
    title: PROJECT_COPY_ES[project.id]?.title || project.title,
    category: project.category,
    summary: project.intro,
  }
}

function metricLabel(metric, language) {
  return language === 'es' ? METRIC_LABELS_ES[metric.label] || metric.label : metric.label
}

function metricDetail(metric, language) {
  return language === 'es' ? METRIC_DETAILS_ES[metric.detail] || metric.detail : metric.detail
}

function compactSentence(value, maxLength = 150) {
  const clean = cleanAssistantText(value).split(/\n+/)[0]
  const firstSentence = clean.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || clean
  if (firstSentence.length <= maxLength) return firstSentence
  return `${firstSentence.slice(0, maxLength).replace(/\s+\S*$/, '')}…`
}

function FollowUps({ items, onAsk, isSending, label }) {
  if (!items?.length) return null

  return (
    <div className="portfolio-response__followups" role="group" aria-label={label}>
      {items.map(({ label: itemLabel, question, icon: Icon }) => (
        <button type="button" key={itemLabel} onClick={() => onAsk(question)} disabled={isSending}>
          <Icon size={15} aria-hidden="true" />
          {itemLabel}
        </button>
      ))}
    </div>
  )
}

function ProjectCard({ project, language, onOpenProject, displayIndex }) {
  const copy = projectCopy(project, language)
  const metrics = (PRIMARY_METRICS[project.id] || [0, 1])
    .map((index) => project.metrics[index])
    .filter(Boolean)

  return (
    <article className="portfolio-response__project-card">
      <div className="portfolio-response__project-cover">
        <img src={project.heroImage} alt="" loading="lazy" />
        <span className="mono">{String(displayIndex ?? project.index).padStart(2, '0')}</span>
      </div>
      <div className="portfolio-response__project-body">
        <p className="portfolio-response__eyebrow mono">{copy.category}</p>
        <h3>{copy.title || project.title}</h3>
        <p className="portfolio-response__summary">{copy.summary}</p>
        <dl className="portfolio-response__card-metrics">
          {metrics.map((metric) => (
            <div key={`${project.id}-${metric.value}-${metric.label}`}>
              <dt>{metricLabel(metric, language)}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
        {onOpenProject && (
          <button
            type="button"
            className="portfolio-response__primary"
            onClick={() => onOpenProject(project)}
          >
            {language === 'es' ? 'Explorar caso' : 'Explore case'}
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  )
}

function ProjectEvidenceRow({ project, language, onOpenProject, displayIndex }) {
  const copy = projectCopy(project, language)
  const metricIndex = PRIMARY_METRICS[project.id]?.[0] ?? 0
  const metric = project.metrics[metricIndex] || project.metrics[0]

  const content = (
    <>
      <img
        className="portfolio-response__evidence-image"
        src={project.heroImage}
        alt={`${copy.title || project.title} project cover`}
        loading="lazy"
      />
      <span className="portfolio-response__evidence-copy">
        <span className="portfolio-response__evidence-eyebrow mono">
          <span>{String(displayIndex).padStart(2, '0')}</span>
          {copy.category}
        </span>
        <strong>{copy.title || project.title}</strong>
        <span className="portfolio-response__evidence-summary">{copy.summary}</span>
        {metric && (
          <span className="portfolio-response__evidence-metric">
            <b>{metric.value}</b>
            <span>{metricLabel(metric, language)}</span>
          </span>
        )}
      </span>
      <CaretRight className="portfolio-response__evidence-arrow" size={24} aria-hidden="true" />
    </>
  )

  if (!onOpenProject) {
    return <article className="portfolio-response__evidence-row">{content}</article>
  }

  return (
    <button
      type="button"
      className="portfolio-response__evidence-row"
      onClick={() => onOpenProject(project)}
      aria-label={`${language === 'es' ? 'Abrir' : 'Open'} ${copy.title || project.title}`}
    >
      {content}
    </button>
  )
}

function ProjectEvidenceList({ projectList, language, onOpenProject, onAsk, isSending }) {
  const followUpQuestion = FOLLOW_UPS.carousel[language][0].question

  return (
    <div className="portfolio-response__evidence-list">
      <div className="portfolio-response__evidence-rows">
        {projectList.map((project, index) => (
          <ProjectEvidenceRow
            project={project}
            language={language}
            onOpenProject={onOpenProject}
            displayIndex={index + 1}
            key={project.id}
          />
        ))}
      </div>
      <button
        type="button"
        className="portfolio-response__evidence-followup"
        onClick={() => onAsk(followUpQuestion)}
        disabled={isSending}
      >
        <Sparkle size={18} weight="fill" aria-hidden="true" />
        <span>
          {language === 'es'
            ? '¿Quieres ver métricas, procesos o decisiones de alguno de estos casos?'
            : 'Would you like to see metrics, process, or decisions from one of these cases?'}
        </span>
        <CaretRight size={21} aria-hidden="true" />
      </button>
    </div>
  )
}

function ProjectCarousel({ projectList, language, onOpenProject, onAsk, isSending }) {
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const updateIndex = () => {
    const track = trackRef.current
    const firstCard = track?.firstElementChild
    if (!track || !firstCard) return
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
    const cardStep = firstCard.getBoundingClientRect().width + gap
    setActiveIndex(Math.min(projectList.length - 1, Math.max(0, Math.round(track.scrollLeft / cardStep))))
  }

  const goTo = (index) => {
    const track = trackRef.current
    const card = track?.children[index]
    if (!track || !card) return
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
    setActiveIndex(index)
  }

  return (
    <>
      <ProjectEvidenceList
        projectList={projectList}
        language={language}
        onOpenProject={onOpenProject}
        onAsk={onAsk}
        isSending={isSending}
      />
      <div
        className="portfolio-response__carousel"
        ref={trackRef}
        onScroll={updateIndex}
        aria-label={language === 'es' ? 'Proyectos relacionados' : 'Related projects'}
      >
        {projectList.map((project, index) => (
          <ProjectCard
            project={project}
            language={language}
            onOpenProject={onOpenProject}
            displayIndex={index + 1}
            key={project.id}
          />
        ))}
      </div>
      <div className="portfolio-response__pagination" aria-label={language === 'es' ? 'Paginación del carrusel' : 'Carousel pagination'}>
        <span>{activeIndex + 1} / {projectList.length}</span>
        <div>
          {projectList.map((project, index) => (
            <button
              type="button"
              key={project.id}
              data-active={index === activeIndex ? 'true' : 'false'}
              onClick={() => goTo(index)}
              aria-label={`${language === 'es' ? 'Mostrar' : 'Show'} ${project.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
      <p className="portfolio-response__prompt">
        {language === 'es' ? '¿Qué quieres comparar?' : 'What would you like to compare?'}
      </p>
      <FollowUps
        items={FOLLOW_UPS.carousel[language]}
        onAsk={onAsk}
        isSending={isSending}
        label={language === 'es' ? 'Comparar proyectos' : 'Compare projects'}
      />
    </>
  )
}

function MetricGrid({ projectList, language, onOpenProject, onAsk, isSending }) {
  return (
    <>
      <div className="portfolio-response__metric-groups">
        {projectList.map((project) => (
          <section className="portfolio-response__metric-group" key={project.id}>
            <header>
              <div>
                <span className="mono">{project.index}</span>
                <h3>{projectCopy(project, language).title}</h3>
              </div>
              {onOpenProject && (
                <button type="button" onClick={() => onOpenProject(project)} aria-label={`${language === 'es' ? 'Abrir' : 'Open'} ${project.title}`}>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              )}
            </header>
            {project.metrics.length > 0 ? (
              <dl>
                {project.metrics.map((metric) => (
                  <div key={`${project.id}-${metric.value}-${metric.label}`}>
                    <dd>{metric.value}</dd>
                    <dt>{metricLabel(metric, language)}</dt>
                    <small>{metricDetail(metric, language)}</small>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="portfolio-response__summary">
                {language === 'es' ? 'Métricas de negocio aún no publicadas. El caso presenta los entregables de diseño.' : project.metricsNote}
              </p>
            )}
          </section>
        ))}
      </div>
      <FollowUps
        items={FOLLOW_UPS.metrics[language]}
        onAsk={onAsk}
        isSending={isSending}
        label={language === 'es' ? 'Explorar el impacto' : 'Explore the impact'}
      />
    </>
  )
}

function ProcessSteps({ projectList, language, onOpenProject, onAsk, isSending }) {
  const [activeProjectId, setActiveProjectId] = useState(projectList[0]?.id)
  const activeProject = projectList.find((project) => project.id === activeProjectId) || projectList[0]
  if (!activeProject) return null

  const steps = language === 'es'
    ? PROCESS_COPY_ES[activeProject.id]
    : activeProject.sections
      .filter((section) => section.title !== 'My role')
      .slice(0, 4)

  return (
    <>
      {projectList.length > 1 && (
        <div className="portfolio-response__switcher" role="tablist" aria-label={language === 'es' ? 'Elegir proyecto' : 'Choose project'}>
          {projectList.map((project) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeProject.id === project.id}
              data-active={activeProject.id === project.id ? 'true' : 'false'}
              onClick={() => setActiveProjectId(project.id)}
              key={project.id}
            >
              {projectCopy(project, language).title}
            </button>
          ))}
        </div>
      )}
      <section className="portfolio-response__process">
        <header>
          <img src={activeProject.heroImage} alt="" />
          <div>
            <span className="mono">{language === 'es' ? 'PROCESO' : 'PROCESS'}</span>
            <h3>{projectCopy(activeProject, language).title}</h3>
          </div>
        </header>
        <ol>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="mono">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h4>{language === 'es' ? SECTION_LABELS_ES[step.title] || step.title : step.title}</h4>
                <p>{compactSentence(step.body)}</p>
              </div>
            </li>
          ))}
        </ol>
        {onOpenProject && (
          <button type="button" className="portfolio-response__text-link" onClick={() => onOpenProject(activeProject)}>
            {language === 'es' ? 'Ver proceso completo' : 'View full process'}
            <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        )}
      </section>
      <FollowUps
        items={FOLLOW_UPS.process[language]}
        onAsk={onAsk}
        isSending={isSending}
        label={language === 'es' ? 'Continuar sobre el proceso' : 'Continue about the process'}
      />
    </>
  )
}

function RoleBrief({ projectList, language, onOpenProject, onAsk, isSending }) {
  return (
    <>
      <div className="portfolio-response__roles">
        {projectList.map((project) => (
          <section key={project.id}>
            {(() => {
              const copy = language === 'es' ? ROLE_COPY_ES[project.id] : project
              return (
                <>
            <header>
              <span className="portfolio-response__role-icon"><User size={18} aria-hidden="true" /></span>
              <div>
                <span className="mono">{projectCopy(project, language).title}</span>
                <h3>{copy.role}</h3>
              </div>
            </header>
            <dl>
              <div>
                <dt>{language === 'es' ? 'Alcance' : 'Scope'}</dt>
                <dd>{copy.scope}</dd>
              </div>
              <div>
                <dt>{language === 'es' ? 'Equipo' : 'Team'}</dt>
                <dd>{copy.team}</dd>
              </div>
            </dl>
            {onOpenProject && (
              <button type="button" className="portfolio-response__text-link" onClick={() => onOpenProject(project)}>
                {language === 'es' ? 'Abrir caso' : 'Open case'}
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            )}
                </>
              )
            })()}
          </section>
        ))}
      </div>
      <FollowUps
        items={FOLLOW_UPS.role[language]}
        onAsk={onAsk}
        isSending={isSending}
        label={language === 'es' ? 'Continuar sobre el rol' : 'Continue about the role'}
      />
    </>
  )
}

function ProfileFacts({ topic, language }) {
  if (topic === 'experience') {
    return (
      <ol className="portfolio-response__timeline">
        {experience.map((item) => (
          <li key={`${item.org}-${item.span}`}>
            <span aria-hidden="true" />
            <div>
              <small className="mono">{language === 'es' ? EXPERIENCE_SPAN_ES[item.span] || item.span : item.span}</small>
              <strong>{language === 'es' ? EXPERIENCE_ORG_ES[item.org] || item.org : item.org}</strong>
              <p>{language === 'es' ? EXPERIENCE_ES[item.org] || item.role : item.role}</p>
            </div>
          </li>
        ))}
      </ol>
    )
  }

  const content = {
    current: {
      icon: Briefcase,
      eyebrow: language === 'es' ? 'ROL ACTUAL' : 'CURRENT ROLE',
      title: profile.currentRole.company,
      facts: language === 'es'
        ? [CURRENT_ROLE_ES.role, CURRENT_ROLE_ES.scope]
        : [profile.currentRole.role, profile.currentRole.scope],
    },
    frontend: {
      icon: Code,
      eyebrow: 'FRONTEND',
      title: language === 'es' ? 'Diseño con criterio de implementación' : 'Design with implementation judgment',
      facts: ['React · Next.js', 'HTML · CSS · JavaScript', language === 'es' ? 'Viabilidad · prototipado · colaboración' : 'Feasibility · prototyping · collaboration'],
    },
    ai: {
      icon: Sparkle,
      eyebrow: language === 'es' ? 'PRÁCTICA CON IA' : 'AI PRACTICE',
      title: language === 'es' ? 'Más velocidad, mismo criterio' : 'More speed, the same judgment',
      facts: ['Cursor', 'Codex', 'Claude'],
    },
    location: {
      icon: MapPin,
      eyebrow: language === 'es' ? 'UBICACIÓN' : 'LOCATION',
      title: profile.location,
      facts: [language === 'es' ? 'Trabajo con productos en Latinoamérica' : 'Product work across Latin America'],
    },
    practice: {
      icon: Compass,
      eyebrow: language === 'es' ? 'PRÁCTICA' : 'PRACTICE',
      title: language === 'es' ? 'Producto, sistemas y código' : 'Product, systems and code',
      facts: [language === 'es' ? 'Estrategia de producto' : 'Product strategy', language === 'es' ? 'Productos financieros' : 'Financial products', language === 'es' ? 'Sistemas de diseño y flujos B2B' : 'Design systems and B2B workflows'],
    },
  }[topic]

  if (!content) return null
  const Icon = content.icon

  return (
    <section className="portfolio-response__profile-card">
      <span className="portfolio-response__profile-icon"><Icon size={21} aria-hidden="true" /></span>
      <p className="mono">{content.eyebrow}</p>
      <h3>{content.title}</h3>
      <ul>
        {content.facts.map((fact) => <li key={fact}>{fact}</li>)}
      </ul>
    </section>
  )
}

function ProjectSpotlight({ project, language, onOpenProject, onAsk, isSending }) {
  if (!project) return null
  const copy = projectCopy(project, language)

  return (
    <>
      <section className="portfolio-response__spotlight">
        <img src={project.heroImage} alt="" />
        <div>
          <p className="mono">{copy.category}</p>
          <h3>{copy.title || project.title}</h3>
          <p>{copy.summary}</p>
          <dl>
            {(PRIMARY_METRICS[project.id] || [0, 1]).map((index) => project.metrics[index]).filter(Boolean).map((metric) => (
              <div key={`${metric.value}-${metric.label}`}>
                <dd>{metric.value}</dd>
                <dt>{metricLabel(metric, language)}</dt>
              </div>
            ))}
          </dl>
          {onOpenProject && (
            <button type="button" className="portfolio-response__primary" onClick={() => onOpenProject(project)}>
              {language === 'es' ? 'Explorar caso' : 'Explore case'}
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
      <FollowUps
        items={FOLLOW_UPS.carousel[language]}
        onAsk={onAsk}
        isSending={isSending}
        label={language === 'es' ? 'Explorar este proyecto' : 'Explore this project'}
      />
    </>
  )
}

export default function PortfolioResponse({ message, onAsk, onOpenProject, isSending }) {
  const language = message.language === 'es' ? 'es' : 'en'
  const projectList = useMemo(() => selectedProjects(message.projectIds), [message.projectIds])
  const kind = message.presentation?.kind || 'narrative'
  const rich = !['narrative', 'suggestions'].includes(kind)
  const lead = responseLead(message.content, { rich, maxLength: rich ? 600 : 900 })
  const headline = kind === 'project-carousel' ? responseLead(message.content, { rich: true, maxLength: 140 }) : ''
  const mobileLead = headline?.endsWith(':') ? `${headline.slice(0, -1)} clave.` : headline

  return (
    <div className="portfolio-response" data-kind={kind}>
      {kind === 'project-carousel' && (
        <>
          <div className="portfolio-response__activity">
            <span aria-hidden="true"><Sparkle size={18} weight="fill" /></span>
            <p>
              {language === 'es'
                ? `Revisé ${projectList.length} casos del portafolio`
                : `I reviewed ${projectList.length} portfolio cases`}
            </p>
          </div>
          <h2 className="portfolio-response__mobile-lead">{mobileLead}</h2>
        </>
      )}
      {lead && (
        <div className="portfolio-response__lead">
          <p>{lead}</p>
        </div>
      )}

      {kind === 'project-carousel' && (
        <ProjectCarousel
          projectList={projectList}
          language={language}
          onOpenProject={onOpenProject}
          onAsk={onAsk}
          isSending={isSending}
        />
      )}

      {kind === 'project-spotlight' && (
        <ProjectSpotlight
          project={projectList[0]}
          language={language}
          onOpenProject={onOpenProject}
          onAsk={onAsk}
          isSending={isSending}
        />
      )}

      {kind === 'metric-grid' && (
        <MetricGrid
          projectList={projectList}
          language={language}
          onOpenProject={onOpenProject}
          onAsk={onAsk}
          isSending={isSending}
        />
      )}

      {kind === 'process-steps' && (
        <ProcessSteps
          projectList={projectList}
          language={language}
          onOpenProject={onOpenProject}
          onAsk={onAsk}
          isSending={isSending}
        />
      )}

      {kind === 'role-brief' && (
        <RoleBrief
          projectList={projectList}
          language={language}
          onOpenProject={onOpenProject}
          onAsk={onAsk}
          isSending={isSending}
        />
      )}

      {kind === 'profile-facts' && (
        <ProfileFacts topic={message.presentation?.topic} language={language} />
      )}

      {kind === 'suggestions' && message.suggestions?.length > 0 && (
        <div className="portfolio-response__suggestions" role="group" aria-label={language === 'es' ? 'Preguntas disponibles' : 'Available questions'}>
          {message.suggestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => onAsk(suggestion)} disabled={isSending}>
              <TrendUp size={15} aria-hidden="true" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {kind === 'narrative' && message.projectIds?.includes('rappi') && (
        <div className="portfolio-response__inline-fact">
          <UsersThree size={18} aria-hidden="true" />
          <span>{profile.currentRole.role}</span>
        </div>
      )}
    </div>
  )
}
