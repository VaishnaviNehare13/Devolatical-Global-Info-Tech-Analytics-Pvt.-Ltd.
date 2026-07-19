import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Timeline, type TimelineEvent } from '../../components/ui/Timeline';
import { Globe, Users, Target, Cpu, HardDrive } from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    { title: 'Client Centricity', desc: 'We align our engineering goals exactly with client objectives to deliver measurable business returns.', icon: <Users className="h-5 w-5 text-secondary" /> },
    { title: 'Architecting Excellence', desc: 'No shortcuts. We build maintainable, scalable, and highly secure microservices configurations.', icon: <Target className="h-5 w-5 text-accent" /> },
    { title: 'Bold Innovation', desc: 'We proactively adopt emerging cloud and data technologies to keep clients ahead of competitor lines.', icon: <Globe className="h-5 w-5 text-indigo-500" /> }
  ];

  const journeyEvents: TimelineEvent[] = [
    { id: 1, date: '2018', title: 'Company Inception', description: 'Devolatical Global was founded with a core team of 5 architects in New York focusing on Spark analytics consulting.' },
    { id: 2, date: '2020', title: 'Global Tech Hub Launch', description: 'Established our primary global engineering headquarters in Mumbai, scaling teams to 120+ senior developers.' },
    { id: 3, date: '2022', title: 'SaaS Platform Release', description: 'Unveiled our proprietary data ingestion engine and telemetry SaaS pipelines, servicing Fortune 500 banks.' },
    { id: 4, date: '2025', title: 'Compliance Ready', description: 'Aligned infrastructure with strict data security guidelines and enterprise compliance benchmarks.' }
  ];

  const team = [
    { name: 'Strategy & Advisory Practice', role: 'Managing Partners', bio: 'Led by industry veterans with extensive experience advising global institutions on metadata alignment, data operating models, and digital transformation roadmaps.', initials: 'AP' },
    { name: 'Systems Engineering Practice', role: 'Principal Architects', bio: 'Specializing in high-throughput distributed systems, Apache Spark stream ingestions, containerized Kubernetes nodes, and automated IaC deployments.', initials: 'SE' },
    { name: 'Security & Compliance Practice', role: 'Certified Auditors', bio: 'Expert in secure identity credentials, IAM boundaries, encryption safeguards, and compliance-ready data pipeline architectures.', initials: 'SC' }
  ];

  const labsList = [
    { title: 'Data Lakehouse Research Lab', desc: 'Benchmarking next-generation partition schemas, dbt models, and caching speeds for Snowflake integrations.' },
    { title: 'AI Inference Acceleration Hub', desc: 'Optimizing tensor calculations, model weight compression, and latency parameters for custom PyTorch models.' },
    { title: 'Cloud Orchestration Center', desc: 'Designing declarative Terraform blueprints and high-availability Kubernetes load balancing configurations.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* 1. Page Header: Who We Are & Our Mission */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Enterprise Consulting Partner</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Who We Are & Our Mission
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Devolatical Global Info-Tech & Analytics Pvt. Ltd. is a premium enterprise data, AI, and analytics consulting firm. Our mission is to evolve complex legacy infrastructures into high-availability cloud data platforms that support secure decision intelligence.
        </p>
      </section>

      {/* 2. Core Values Grid */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Our Delivery Approach
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val) => (
            <Card key={val.title} className="p-6 border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg w-fit mb-4">
                {val.icon}
              </div>
              <h4 className="font-bold text-slate-850 dark:text-white mb-2">{val.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Consulting Methodology Section */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/60 pt-12">
        <div className="space-y-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Our Framework</span>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Consulting Methodology
          </h2>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            We employ an iterative, business-aligned consulting framework to design architectures that scale and govern data effectively.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
            <span className="text-xl font-bold font-mono text-secondary">01</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Discovery & Audit</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Assess the current data landscape, locate integration silos, and audit metadata structures.</p>
          </div>
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
            <span className="text-xl font-bold font-mono text-secondary">02</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Architecture Blueprint</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Map target data pipelines, define semantic model schemas, and establish security gates.</p>
          </div>
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
            <span className="text-xl font-bold font-mono text-secondary">03</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Modern Execution</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Provision containerized pipelines, sync cloud data warehouses, and configure BI dashboards.</p>
          </div>
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
            <span className="text-xl font-bold font-mono text-secondary">04</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Active Governance</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Apply data catalogs, assign stewardship responsibilities, and monitor pipeline health.</p>
          </div>
        </div>
      </section>

      {/* 4. Engineering Culture & Labs */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-slate-100 dark:border-slate-850/60">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Data-Driven Innovation
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We operate at the forefront of technology excellence. Our consultants actively publish research blueprints and dedicate sprints to benchmarking distributed databases.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-dark-card shadow-sm space-y-2">
              <Cpu className="h-5 w-5 text-secondary" />
              <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wide">Continuous R&D</h4>
              <p className="text-[11px] text-slate-400">Regular benchmarking updates on active Spark clusters.</p>
            </div>
            
            <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-dark-card shadow-sm space-y-2">
              <HardDrive className="h-5 w-5 text-accent" />
              <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wide">IaC Standardization</h4>
              <p className="text-[11px] text-slate-400">Every deployment infrastructure is modeled declaratively.</p>
            </div>
          </div>
        </div>

        {/* Labs cards list */}
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Innovation Laboratories
          </h3>
          <div className="space-y-3">
            {labsList.map((lab) => (
              <div key={lab.title} className="p-4 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                <h4 className="text-sm font-bold text-slate-805 dark:text-white">{lab.title}</h4>
                <p className="text-[11px] text-slate-500 leading-normal">{lab.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Leadership profiles */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Advisory & Leadership Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member) => (
            <Card key={member.name} hoverEffect className="p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-base">
                  {member.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-white leading-none">{member.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1 block">{member.role}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{member.bio}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Journey Timeline */}
      <section className="space-y-8 max-w-3xl">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Company Growth Timeline
        </h2>
        <Timeline events={journeyEvents} />
      </section>

      {/* 6. Global offices footprint & Gallery */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 border-t border-slate-100 dark:border-slate-800/85">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Global Office Footprint
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            With collaborative development hubs located in critical corporate cities, our engineering teams provide 24/7/365 active operations monitoring coverage.
          </p>
          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
            <p><strong>New York (Headquarters):</strong> Suite 4200, 1 World Trade Center, New York, NY 10007</p>
            <p><strong>Mumbai (Global Tech Hub):</strong> Levels 5-8, Godrej One, Bandra BKC, Mumbai, MH 400051</p>
          </div>
        </div>
        
        {/* Interactive World Map regional coverage representation */}
        <div className="h-64 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden p-6 shadow-card">
          <div className="absolute inset-0 bg-secondary/5 filter blur-3xl pointer-events-none" />
          
          <svg className="w-full h-full text-slate-200 dark:text-slate-800" viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* World continents contours simulated */}
            <path d="M10 40 Q30 25 70 45 T140 35 T200 60 T270 30 L260 90 L200 110 L150 80 L80 100 L20 80 Z" fill="currentColor" opacity="0.12" />
            
            {/* Connection Arches */}
            <path d="M 65 55 Q 140 10 210 75" fill="none" stroke="#0F62FE" strokeWidth="1.5" strokeDasharray="4 4" />
            <motion.circle
              cx="65"
              cy="55"
              r="3"
              fill="#00C2FF"
              animate={{ cx: [65, 210], cy: [55, 75] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Pins */}
            {/* NY HQ */}
            <circle cx="65" cy="55" r="4.5" fill="#0F62FE" />
            <circle cx="65" cy="55" r="9" stroke="#0F62FE" strokeWidth="1" className="animate-ping" fill="none" />
            <text x="65" y="45" textAnchor="middle" className="text-[7.5px] font-bold text-slate-400 font-mono" fill="currentColor">New York (HQ)</text>

            {/* Mumbai BKC */}
            <circle cx="210" cy="75" r="4.5" fill="#00C2FF" />
            <circle cx="210" cy="75" r="9" stroke="#00C2FF" strokeWidth="1" className="animate-ping" fill="none" />
            <text x="210" y="67" textAnchor="middle" className="text-[7.5px] font-bold text-slate-400 font-mono" fill="currentColor">Mumbai Hub</text>
          </svg>

          <span className="absolute bottom-4 right-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            // active_network_map.diag
          </span>
        </div>
      </section>
    </div>
  );
};

export default About;
