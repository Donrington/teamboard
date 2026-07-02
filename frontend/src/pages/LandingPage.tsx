import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Kanban,
  ListChecks,
  ShieldCheck,
  StackSimple,
} from '@phosphor-icons/react';

import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAuth } from '@/features/auth/AuthContext';
import { TaskStatus } from '@teamboard/shared';

/* ------------------------------------------------------------------ *
 * Floating "island" navigation.
 * ------------------------------------------------------------------ */
function LandingNav() {
  const { status } = useAuth();
  const authenticated = status === 'authenticated';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-5">
      <nav className="pointer-events-auto flex w-full max-w-content items-center justify-between rounded-full border border-line bg-bone/80 py-2 pl-5 pr-2 shadow-soft backdrop-blur-md">
        <Link to="/">
          <Logo />
        </Link>
        {authenticated ? (
          <div className="flex items-center gap-2.5">
            <Link to="/projects" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Your projects
              </Button>
            </Link>
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" pill>
                Get started
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Hero.
 * ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-36 sm:px-8 sm:pt-44">
      {/* warm ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(76,133,119,0.18), transparent 62%)' }}
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.span
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="eyebrow inline-flex items-center gap-2 rounded-full border border-line bg-bone/70 px-3.5 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" />
          Lightweight work management
        </motion.span>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-7 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-7xl"
        >
          Projects, tasks, and the{' '}
          <span className="italic text-verdigris">quiet order</span> in between.
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted"
        >
          TeamBoard is a small, focused home for a team’s work — group it into projects,
          break it into tasks, and move each one from To&nbsp;Do to Done without the noise.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link to="/signup">
            <Button
              size="lg"
              pill
              trailingIcon={
                <span className="grid h-7 w-7 place-items-center rounded-full bg-bone/15 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
                  <ArrowRight size={16} />
                </span>
              }
            >
              Start organizing
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" pill>
              Sign in
            </Button>
          </Link>
        </motion.div>

        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 font-mono text-[11px] uppercase tracking-label text-muted"
        >
          React · NestJS · MongoDB
        </motion.p>
      </div>

      <BoardPreview />
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Faux-window board preview — visual proof of the product.
 * ------------------------------------------------------------------ */
const PREVIEW = [
  {
    status: TaskStatus.Todo,
    tasks: ['Draft homepage copy', 'Collect brand assets'],
  },
  {
    status: TaskStatus.InProgress,
    tasks: ['Wire up the API client', 'Design the task board'],
  },
  {
    status: TaskStatus.Done,
    tasks: ['Set up the repo', 'Model the schema'],
  },
];

function BoardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="surface overflow-hidden shadow-lift">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-line" />
          <span className="h-3 w-3 rounded-full bg-line" />
          <span className="h-3 w-3 rounded-full bg-line" />
          <span className="ml-3 font-mono text-[11px] text-muted">teamboard / website-relaunch</span>
        </div>
        {/* board */}
        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
          {PREVIEW.map((col) => (
            <div key={col.status} className="rounded-card bg-fog/60 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <StatusBadge status={col.status} />
                <span className="font-mono text-[11px] text-muted">{col.tasks.length}</span>
              </div>
              <div className="space-y-2.5">
                {col.tasks.map((t) => (
                  <div key={t} className="rounded-control border border-line bg-bone px-3.5 py-3 text-sm shadow-soft">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Feature bento.
 * ------------------------------------------------------------------ */
const FEATURES = [
  {
    icon: <Kanban size={22} weight="regular" />,
    title: 'A board that moves at a click',
    body: 'Three honest columns — To Do, In Progress, Done. Move a task and it slides to its new home; the count updates itself.',
    span: 'sm:col-span-3',
  },
  {
    icon: <ListChecks size={22} weight="regular" />,
    title: 'Projects into tasks',
    body: 'Group work into projects, then break each one down. Every project carries its own live task count.',
    span: 'sm:col-span-3',
  },
  {
    icon: <ShieldCheck size={22} weight="regular" />,
    title: 'Yours, and only yours',
    body: 'Sign-in is backed by a JWT and bcrypt-hashed passwords. Every project and task is scoped to your account on the server.',
    span: 'sm:col-span-2',
  },
  {
    icon: <StackSimple size={22} weight="regular" />,
    title: 'Built to grow up',
    body: 'A modular NestJS backend with clean service boundaries — ready to split into microservices when the team is.',
    span: 'sm:col-span-4',
  },
];

function FeatureBento() {
  return (
    <section className="mx-auto max-w-content px-5 py-24 sm:px-8">
      <Reveal>
        <span className="eyebrow">Why TeamBoard</span>
        <h2 className="mt-4 max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything the work needs. Nothing it doesn’t.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-6">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06} className={f.span}>
            <article className="surface group h-full p-7 transition-shadow duration-300 hover:shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-card bg-fog text-verdigris">
                {f.icon}
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted">{f.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Closing CTA band.
 * ------------------------------------------------------------------ */
function CtaBand() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-content overflow-hidden rounded-[28px] bg-ink px-8 py-20 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-verdigris/25 blur-3xl animate-drift"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-brass/20 blur-3xl animate-drift"
            style={{ animationDelay: '-9s' }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance font-display text-4xl font-semibold leading-[1.08] text-bone sm:text-5xl">
              Give your team’s work a place to live.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-pretty text-bone/60">
              Create an account and lay out your first project in under a minute.
            </p>
            <div className="mt-9 flex justify-center">
              <Link to="/signup">
                <Button
                  variant="accent"
                  size="lg"
                  pill
                  trailingIcon={
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-bone/15 transition-transform duration-300 group-hover:translate-x-0.5">
                      <ArrowUpRight size={16} />
                    </span>
                  }
                >
                  Create your board
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo showTagline />
        <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-label text-muted">
          <Link to="/login" className="transition-colors hover:text-ink">
            Sign in
          </Link>
          <Link to="/signup" className="transition-colors hover:text-ink">
            Get started
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-[100dvh]">
      <LandingNav />
      <Hero />
      <FeatureBento />
      <CtaBand />
      <Footer />
    </div>
  );
}
