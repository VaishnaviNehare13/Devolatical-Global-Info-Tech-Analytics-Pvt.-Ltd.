import React from 'react';
import { Card } from '../../components/ui/Card';
import { Timeline, type TimelineEvent } from '../../components/ui/Timeline';
import { Globe, Users, Target, Database, Server, Code, Layers, MapPin } from 'lucide-react';

export const About: React.FC = () => {
  const deliveryValues = [
    { title: 'Data-Driven Strategy', desc: 'We align technical software and analytics architectures directly with core business metrics.', icon: <Target className="h-5 w-5 text-secondary" /> },
    { title: 'Architectural Excellence', desc: 'We design maintainable, scalable, and highly secure microservices and cloud infrastructures.', icon: <Users className="h-5 w-5 text-accent" /> },
    { title: 'Tech-Forward Innovation', desc: 'We adopt proven modern cloud, database, and software technologies to keep enterprises ahead.', icon: <Globe className="h-5 w-5 text-indigo-500" /> }
  ];

  // Consulting Delivery Methodology Lifecycle (Replaces fictional company timeline)
  const methodologyStages: TimelineEvent[] = [
    {
      id: 1,
      date: 'Stage 01',
      title: 'Discovery & Infrastructure Audit',
      description: 'Assess existing enterprise data systems, identify technical bottlenecks, audit data quality, and evaluate infrastructure scalability gaps.'
    },
    {
      id: 2,
      date: 'Stage 02',
      title: 'Architecture & System Blueprinting',
      description: 'Design unified semantic data models, cloud infrastructure migration roadmaps, and custom software application specifications.'
    },
    {
      id: 3,
      date: 'Stage 03',
      title: 'Modern Execution & Deployment',
      description: 'Build high-performance software, provision secure cloud environments, and integrate automated analytics pipelines.'
    },
    {
      id: 4,
      date: 'Stage 04',
      title: 'Active Governance & Continuous Optimization',
      description: 'Implement automated monitoring controls, continuous telemetry audits, and ongoing technical support.'
    }
  ];

  // "Our Engineering Excellence" Capability Areas (Replaces fictional people profiles)
  const engineeringCapabilities = [
    {
      title: 'Data Analytics Practice',
      code: 'CAP-01',
      icon: <Database className="h-6 w-6 text-secondary" />,
      desc: 'Specializing in Business Intelligence, real-time data visualization, predictive modeling algorithms, automated executive reporting, and analytics dashboards.'
    },
    {
      title: 'IT Infrastructure Practice',
      code: 'CAP-02',
      icon: <Server className="h-6 w-6 text-accent" />,
      desc: 'Focusing on zero-downtime cloud migrations, resilient network architecture design, infrastructure telemetry monitoring, and secure enterprise deployments.'
    },
    {
      title: 'Custom Software Engineering',
      code: 'CAP-03',
      icon: <Code className="h-6 w-6 text-indigo-500" />,
      desc: 'Architecting high-availability enterprise web applications, cross-platform mobile solutions, end-to-end workflow automation, and custom business software.'
    },
    {
      title: 'Enterprise Solution Architecture',
      code: 'CAP-04',
      icon: <Layers className="h-6 w-6 text-emerald-500" />,
      desc: 'Designing end-to-end digital ecosystems, semantic data layers, multi-cloud integration frameworks, and zero-trust security boundaries.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* 1. Page Header: Who We Are & Our Mission */}
      <section className="space-y-4 max-w-3xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">
          Devolatical Global Info-Tech & Analytics Pvt. Ltd.
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Who We Are & Our Mission
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          We are a premium Info-Tech & Analytics firm rooted in Mumbai with global standards. We specialize in Advanced Data Analytics, IT Infrastructure, and Custom Software Solutions, building scalable digital ecosystems that drive data-backed business transformations.
        </p>
        <div className="p-4 bg-slate-50 dark:bg-dark-card border-l-4 border-secondary rounded-r-xl text-xs text-slate-600 dark:text-slate-300">
          <strong>Mission:</strong> "Deliver high-performance software solutions, robust IT infrastructure, and actionable data analytics that empower businesses worldwide."
        </div>
      </section>

      {/* 2. Delivery Principles */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Core Delivery Approach
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deliveryValues.map((val) => (
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

      {/* 3. Our Engineering Excellence (Capabilities Section) */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/60 pt-12">
        <div className="space-y-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Company Capabilities</span>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Our Engineering Excellence
          </h2>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Our enterprise capabilities cover the complete spectrum of modern software engineering, cloud infrastructure, and data analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {engineeringCapabilities.map((cap) => (
            <Card key={cap.title} hoverEffect className="p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg">
                  {cap.icon}
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{cap.code}</span>
              </div>
              <h4 className="font-bold text-slate-850 dark:text-white text-base mb-2">{cap.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Consulting Delivery Methodology */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/60 pt-12 max-w-3xl">
        <div className="space-y-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Project Lifecycle</span>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Consulting & Delivery Methodology
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            A structured 4-stage consulting lifecycle designed to ensure seamless integration and measurable outcomes.
          </p>
        </div>
        <Timeline events={methodologyStages} />
      </section>

      {/* 5. Company Location & Coordinates */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 border-t border-slate-100 dark:border-slate-800/85">
        <div className="space-y-4">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Global Operating Base</span>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Rooted in Mumbai, Global Standards
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Headquartered in Andheri West, Mumbai, Devolatical Global Info-Tech & Analytics Pvt. Ltd. delivers high-performance digital ecosystems for global enterprises.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start space-x-2.5">
              <MapPin className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-white">Registered Address:</strong><br />
                Andheri West, Mumbai, Maharashtra, India
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Location Visual SVG */}
        <div className="h-64 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden p-6 shadow-card">
          <div className="absolute inset-0 bg-secondary/5 filter blur-3xl pointer-events-none" />
          
          <svg className="w-full h-full text-slate-200 dark:text-slate-800" viewBox="0 0 320 140" fill="none">
            <path d="M10 40 Q30 25 70 45 T140 35 T200 60 T270 30 L260 90 L200 110 L150 80 L80 100 L20 80 Z" fill="currentColor" opacity="0.12" />
            
            {/* Mumbai Andheri West Coordinates Node */}
            <circle cx="160" cy="70" r="6" fill="#00C2FF" />
            <circle cx="160" cy="70" r="14" stroke="#00C2FF" strokeWidth="1.5" className="animate-ping" fill="none" />
            <text x="160" y="52" textAnchor="middle" className="text-[9px] font-bold text-slate-600 dark:text-slate-300 font-mono" fill="currentColor">
              Andheri West, Mumbai
            </text>
          </svg>

          <span className="absolute bottom-4 right-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            // tech_hub_location.map
          </span>
        </div>
      </section>
    </div>
  );
};

export default About;
