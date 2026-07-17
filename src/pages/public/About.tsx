import React from 'react';
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
    { id: 4, date: '2025', title: 'SOC 2 Type II Certified', description: 'Completed independent audit validations verifying strict data security and compliance benchmarks.' }
  ];

  const team = [
    { name: 'Sarah Jenkins', role: 'Chief Executive Officer', bio: 'Former VP of Enterprise Data at IBM. 18+ years leading global tech delivery pipelines.', initials: 'SJ' },
    { name: 'Vikram Mehta', role: 'Chief Technology Officer', bio: 'Principal software architect and former Databricks core committer. Specialist in distributed systems.', initials: 'VM' },
    { name: 'Marcus Vance', role: 'Chief Security Officer', bio: 'Former cyber security lead at Stripe. Expert in SOC 2 compliance frameworks and penetrative audits.', initials: 'MV' }
  ];

  const labsList = [
    { title: 'Data Lakehouse Research Lab', desc: 'Benchmarking next-generation partition schemas, dbt models, and caching speeds for Snowflake integrations.' },
    { title: 'AI Inference Acceleration Hub', desc: 'Optimizing tensor calculations, model weight compression, and latency parameters for custom PyTorch models.' },
    { title: 'Cloud Orchestration Center', desc: 'Designing declarative Terraform blueprints and high-availability Kubernetes load balancing configurations.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* 1. Page Header */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">About Devolatical Global</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Architecting Trust & Data Systems
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Devolatical Global Info-Tech & Analytics Pvt. Ltd. was founded to build reliable, high-throughput cloud and software architectures. We serve as critical partners to multi-million-dollar enterprises globally.
        </p>
      </section>

      {/* 2. Core Values Grid */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Our Operational Values
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

      {/* 3. Engineering Culture & Labs */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4 border-t border-slate-100 dark:border-slate-850/60">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Our Engineering Culture
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We operate with a "fail-fast, scale-correctly" culture. Our developers actively commit to public open-source initiatives and spend 20% of their sprints prototyping in our dedicated R&D labs.
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
            Active Innovation Labs
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

      {/* 4. Leadership profiles */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Leadership Team
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

      {/* 5. Journey Timeline */}
      <section className="space-y-8 max-w-3xl">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Our Journey
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
        
        {/* Simple map illustration box */}
        <div className="h-64 bg-slate-100 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/5 filter blur-3xl" />
          <Globe className="h-20 w-20 text-slate-300 dark:text-slate-700 animate-spin-slow" />
          <span className="absolute bottom-4 right-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            2 Operations Hubs active
          </span>
        </div>
      </section>
    </div>
  );
};

export default About;
