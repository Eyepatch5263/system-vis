'use client';

import Link from 'next/link';
import {
  Layers,
  Zap,
  BarChart3,
  Sparkles,
  ArrowRight,
  Server,
  Database,
  Globe,
  GitBranch,
  Activity,
  Shield,
  Box,
  ChevronRight,
  Cpu,
  Network,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

/* ─── Feature cards ─────────────────────────────────────────────── */
const features = [
  {
    icon: Layers,
    label: 'Architect',
    href: '/architect',
    title: 'Visual Architecture Designer',
    description:
      'Drag-and-drop canvas with 15+ node types — services, databases, caches, queues, CDN, load balancers, ML models, payment gateways and more. Connect them with configurable edges and network properties.',
    highlights: ['15+ node types', 'Edge latency & bandwidth', 'Terraform import'],
    iconColor: 'text-blue-500',
    border: 'hover:border-blue-500/30',
    glow: 'from-blue-500/10 to-blue-600/5',
  },
  {
    icon: Zap,
    label: 'Simulate',
    href: '/simulate',
    title: 'Real-time Traffic Simulation',
    description:
      'Discrete-event simulation engine with Poisson arrival modelling. Choose from constant, ramp, spike, or wave traffic patterns and watch requests flow through your architecture in real time.',
    highlights: ['Poisson traffic generation', '4 configurable patterns', 'Retry & backoff logic'],
    iconColor: 'text-amber-500',
    border: 'hover:border-amber-500/30',
    glow: 'from-amber-500/10 to-amber-600/5',
  },
  {
    icon: BarChart3,
    label: 'Metrics',
    href: '/metrics',
    title: 'Live Performance Metrics',
    description:
      'Per-node CPU & memory utilization, P50/P95/P99 latency percentiles, error rates, queue depths, and throughput. Automated bottleneck detection alerts you before users notice.',
    highlights: ['P50 / P95 / P99 latency', 'CPU & memory per node', 'Bottleneck alerts'],
    iconColor: 'text-emerald-500',
    border: 'hover:border-emerald-500/30',
    glow: 'from-emerald-500/10 to-emerald-600/5',
  },
  {
    icon: Sparkles,
    label: 'AI',
    href: '/ai',
    title: 'AI-Powered Optimization',
    description:
      'Get intelligent suggestions to eliminate bottlenecks, right-size node capacity, and improve resilience. Ask the AI advisor anything about your architecture and simulation results.',
    highlights: ['Root-cause analysis', 'Capacity recommendations', 'Architecture Q&A'],
    iconColor: 'text-violet-500',
    border: 'hover:border-violet-500/30',
    glow: 'from-violet-500/10 to-violet-600/5',
  },
];

/* ─── Stats ──────────────────────────────────────────────────────── */
const stats = [
  { value: '15+', label: 'Node Types' },
  { value: '4', label: 'Traffic Patterns' },
  { value: 'Real-time', label: 'Simulation Engine' },
  { value: 'AI', label: 'Powered Insights' },
];

/* ─── Steps ──────────────────────────────────────────────────────── */
const steps = [
  {
    number: '01',
    icon: Layers,
    title: 'Design your architecture',
    description:
      'Drop nodes onto the canvas and connect them. Configure each component — instances, latency, capacity, failure rates.',
  },
  {
    number: '02',
    icon: Activity,
    title: 'Run a simulation',
    description:
      'Choose a traffic pattern and hit run. Watch requests propagate across your graph with live utilization metrics per node.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Optimize with AI',
    description:
      'Let the AI advisor analyse bottlenecks and surface actionable recommendations to make your system production-ready.',
  },
];

/* ─── Node type pills ─────────────────────────────────────────────── */
const nodeTypes = [
  { icon: Server, label: 'Microservice' },
  { icon: Database, label: 'Database' },
  { icon: Globe, label: 'CDN' },
  { icon: GitBranch, label: 'Load Balancer' },
  { icon: Box, label: 'Message Queue' },
  { icon: Shield, label: 'API Gateway' },
  { icon: Cpu, label: 'ML Model' },
  { icon: Network, label: 'WebSocket' },
];

/* ─── Hero node-graph SVG ─────────────────────────────────────────── */
function HeroGraph() {
  return (
    <svg viewBox="0 0 480 260" className="w-full max-w-lg select-none" aria-hidden="true">
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" className="fill-border" />
        </marker>
      </defs>

      {/* Edges */}
      {[
        [96, 56, 164, 56],
        [236, 56, 300, 56],
        [356, 46, 400, 28],
        [356, 66, 400, 84],
        [434, 20, 434, 156],
        [434, 92, 376, 180],
        [376, 188, 436, 172],
        [200, 80, 200, 178],
        [232, 192, 428, 192],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerEnd="url(#arr)"
          className="stroke-border"
        />
      ))}

      {/* Frontend */}
      <rect x="16" y="36" width="80" height="40" rx="8" className="fill-card stroke-border" strokeWidth="1" />
      <text x="56" y="52" textAnchor="middle" fontSize="9" className="fill-muted-foreground" fontWeight="500">Frontend</text>
      <text x="56" y="66" textAnchor="middle" fontSize="8" className="fill-foreground">React App</text>

      {/* Gateway */}
      <rect x="164" y="36" width="72" height="40" rx="8" className="fill-card stroke-border" strokeWidth="1" />
      <text x="200" y="52" textAnchor="middle" fontSize="9" className="fill-muted-foreground" fontWeight="500">Gateway</text>
      <text x="200" y="66" textAnchor="middle" fontSize="8" className="fill-foreground">Rate Limit</text>

      {/* Load Balancer */}
      <rect x="300" y="36" width="56" height="40" rx="8" className="fill-card stroke-border" strokeWidth="1" />
      <text x="328" y="52" textAnchor="middle" fontSize="9" className="fill-muted-foreground" fontWeight="500">LB</text>
      <text x="328" y="66" textAnchor="middle" fontSize="8" className="fill-foreground">Round-robin</text>

      {/* Service A — highlighted */}
      <rect x="400" y="10" width="70" height="36" rx="8" fill="oklch(0.546 0.245 262.881 / 15%)" stroke="oklch(0.546 0.245 262.881 / 50%)" strokeWidth="1" />
      <text x="435" y="25" textAnchor="middle" fontSize="9" className="fill-muted-foreground" fontWeight="500">Service A</text>
      <text x="435" y="38" textAnchor="middle" fontSize="8" fill="oklch(0.546 0.245 262.881)">3 instances</text>

      {/* Service B */}
      <rect x="400" y="66" width="70" height="36" rx="8" className="fill-card stroke-border" strokeWidth="1" />
      <text x="435" y="81" textAnchor="middle" fontSize="9" className="fill-muted-foreground" fontWeight="500">Service B</text>
      <text x="435" y="94" textAnchor="middle" fontSize="8" className="fill-foreground">2 instances</text>

      {/* Queue */}
      <rect x="164" y="178" width="68" height="36" rx="8" className="fill-card stroke-border" strokeWidth="1" />
      <text x="198" y="193" textAnchor="middle" fontSize="9" className="fill-muted-foreground" fontWeight="500">Queue</text>
      <text x="198" y="206" textAnchor="middle" fontSize="8" className="fill-foreground">Kafka</text>

      {/* Cache — highlighted */}
      <rect x="340" y="176" width="68" height="36" rx="8" fill="oklch(0.623 0.214 259.815 / 12%)" stroke="oklch(0.623 0.214 259.815 / 40%)" strokeWidth="1" />
      <text x="374" y="191" textAnchor="middle" fontSize="9" className="fill-muted-foreground" fontWeight="500">Cache</text>
      <text x="374" y="204" textAnchor="middle" fontSize="8" fill="oklch(0.623 0.214 259.815)">98% hit rate</text>

      {/* Database */}
      <rect x="428" y="154" width="44" height="40" rx="8" className="fill-card stroke-border" strokeWidth="1" />
      <text x="450" y="171" textAnchor="middle" fontSize="9" className="fill-muted-foreground" fontWeight="500">DB</text>
      <text x="450" y="184" textAnchor="middle" fontSize="8" className="fill-foreground">Postgres</text>

      {/* Live metrics badge */}
      <rect x="16" y="106" width="110" height="22" rx="11" fill="oklch(0.546 0.245 262.881 / 10%)" stroke="oklch(0.546 0.245 262.881 / 25%)" strokeWidth="0.5" />
      <circle cx="30" cy="117" r="3.5" fill="oklch(0.546 0.245 262.881)" />
      <text x="38" y="121" fontSize="9" fill="oklch(0.546 0.245 262.881)" fontFamily="monospace">CPU 42% · P99 38ms</text>

      {/* Throughput badge */}
      <rect x="16" y="136" width="88" height="22" rx="11" fill="oklch(0.546 0.245 262.881 / 6%)" stroke="oklch(0.546 0.245 262.881 / 18%)" strokeWidth="0.5" />
      <text x="60" y="151" textAnchor="middle" fontSize="9" fill="oklch(0.546 0.245 262.881)" fontFamily="monospace">1 240 req / s</text>

      {/* Bottleneck badge */}
      <rect x="288" y="110" width="82" height="22" rx="11" fill="oklch(0.577 0.245 27.325 / 12%)" stroke="oklch(0.577 0.245 27.325 / 35%)" strokeWidth="0.5" />
      <circle cx="302" cy="121" r="3.5" fill="oklch(0.577 0.245 27.325)" />
      <text x="310" y="125" fontSize="9" fill="oklch(0.577 0.245 27.325)" fontFamily="monospace">Bottleneck ↑</text>
    </svg>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              SV
            </span>
            <span className="text-sm">SystemVis</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/architect" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Dot grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0
            [background-image:radial-gradient(oklch(0_0_0/8%)_1px,transparent_1px)]
            dark:[background-image:radial-gradient(oklch(1_0_0/6%)_1px,transparent_1px)]
            [background-size:28px_28px]"
        />
        {/* Gradient fade edges */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          {/* Left */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Architecture Simulation Platform
            </div>

            <h1 className="text-5xl font-bold tracking-tight leading-[1.08] lg:text-6xl">
              Design systems
              <br />
              <span className="text-muted-foreground">that scale.</span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Drag-and-drop your architecture, run realistic traffic simulations, watch live
              metrics per node, and get AI-powered recommendations — all before writing a single
              line of infrastructure code.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/architect" className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
                Start designing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/simulate" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                See simulation
              </Link>
            </div>

            {/* Node type pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {nodeTypes.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — hero graph */}
          <div className="flex items-center justify-center">
            <div className="w-full rounded-2xl border border-border bg-card/60 p-6 shadow-2xl ring-1 ring-foreground/5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  simulation · tick 142 · 1 240 req/s
                </span>
              </div>
              <HeroGraph />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-border/60 bg-muted/25">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-3xl font-bold tracking-tight">{value}</dt>
                <dd className="text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Platform
          </p>
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Everything your architecture needs
          </h2>
          <p className="mt-3 text-muted-foreground">
            Four tightly integrated tools that take you from blank canvas to production-confident
            system design.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, label, href, title, description, highlights, iconColor, border, glow }) => (
            <Link
              key={href}
              href={href}
              className={`group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg ${border}`}
            >
              {/* Hover glow */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${glow}`}
              />

              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background ${iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  Open {label} <ChevronRight className="h-3 w-3" />
                </span>
              </div>

              <div className="relative">
                <h3 className="mb-2 font-semibold leading-snug">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>

              <ul className="relative flex flex-wrap gap-2">
                {highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-14 max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Workflow
            </p>
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              From idea to insight in minutes
            </h2>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3">
            {/* Dashed connector line */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[17%] right-[17%] top-8 hidden h-px border-t border-dashed border-border sm:block"
            />

            {steps.map(({ number, icon: Icon, title, description }) => (
              <div key={number} className="relative flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                    <Icon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <span className="font-mono text-3xl font-bold text-border select-none">
                    {number}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm ring-1 ring-foreground/5 sm:p-16">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ready?
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
              Stress-test your architecture
              <br />
              before production does.
            </h2>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">
              Open the canvas, drop your nodes, and run a simulation in under two minutes — no
              account required.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/architect" className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
                Start building <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/ai" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Try AI advisor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground text-[10px] font-bold">
              SV
            </span>
            SystemVis — Architecture Simulation Platform
          </div>
          <nav className="flex gap-5">
            {[
              { href: '/architect', label: 'Architect' },
              { href: '/simulate', label: 'Simulate' },
              { href: '/metrics', label: 'Metrics' },
              { href: '/ai', label: 'AI' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
