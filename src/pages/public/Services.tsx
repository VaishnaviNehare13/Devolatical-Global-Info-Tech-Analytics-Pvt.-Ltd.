import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Database, Server, Code, ArrowUpRight, Clock, CheckCircle2, Cpu } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { motion } from 'framer-motion';

interface ServicePillar {
  id: string;
  name: string;
  subOfferings: string[];
  challenge: string;
  solution: string;
  impact: string;
  deliverables: string[];
  outcomes: string[];
  techStack: string[];
  duration: string;
  icon: React.ReactNode;
  architectureType: 'analytics' | 'infrastructure' | 'software';
}

export const Services: React.FC = () => {
  const { showToast } = useToast();
  const [selectedPillar, setSelectedPillar] = useState<ServicePillar | null>(null);

  const officialPillars: ServicePillar[] = [
    {
      id: 'advanced-data-analytics',
      name: 'Advanced Data Analytics',
      subOfferings: [
        'Business Intelligence',
        'Data Visualization',
        'Predictive Analytics',
        'Automated Reporting',
        'Analytics Dashboards'
      ],
      challenge: 'Organizations encounter fragmented data sources, stale operational reporting, and slow query speeds that hinder data-backed decision making.',
      solution: 'We architect unified semantic data models, high-throughput ingestion pipelines, real-time telemetry dashboards, and predictive forecasting engines.',
      impact: 'Reduces reporting compilation cycles from days to seconds and improves operational efficiency.',
      deliverables: [
        'Enterprise Semantic Data Model',
        'Interactive Business Intelligence Dashboards',
        'Predictive ML Forecasting Engines',
        'Automated Executive Reporting Schedules'
      ],
      outcomes: [
        'Sub-second query latencies on large datasets',
        'Single operational source of truth across business units',
        'Elimination of manual spreadsheet compiling'
      ],
      techStack: ['Snowflake', 'Databricks Delta Lake', 'dbt', 'Python', 'Power BI', 'Tableau', 'Apache Spark'],
      duration: '4 - 8 Weeks Engagement',
      icon: <Database className="h-7 w-7 text-secondary" />,
      architectureType: 'analytics'
    },
    {
      id: 'it-infrastructure-solutions',
      name: 'IT Infrastructure Solutions',
      subOfferings: [
        'Cloud Migration',
        'Network Architecture',
        'Infrastructure Monitoring',
        'Secure Deployments',
        'IT Support'
      ],
      challenge: 'Legacy hardware appliances and unmonitored infrastructure create reliability risks, scaling bottlenecks, and elevated operational spends.',
      solution: 'We engineer zero-downtime multi-cloud migrations, declarative IaC blueprints, resilient network topographies, and 24/7 telemetry monitoring systems.',
      impact: 'Shrinks ongoing infrastructure maintenance costs while maintaining high availability architecture.',
      deliverables: [
        'Multi-Region Cloud Topology Blueprints (AWS / Azure)',
        'Terraform Infrastructure-as-Code Repositories',
        'Real-Time Telemetry & Monitoring Dashboards',
        'Secure Deployment & IT Support Playbooks'
      ],
      outcomes: [
        'Zero-downtime storage cutovers',
        'Auto-scaling compute clusters under peak traffic',
        'Hardened network access controls'
      ],
      techStack: ['AWS', 'Microsoft Azure', 'Terraform', 'Kubernetes', 'Docker', 'Prometheus', 'Wazuh'],
      duration: '6 - 12 Weeks Engagement',
      icon: <Server className="h-7 w-7 text-accent" />,
      architectureType: 'infrastructure'
    },
    {
      id: 'custom-software-solutions',
      name: 'Custom Software Solutions',
      subOfferings: [
        'Enterprise Web Applications',
        'Mobile Applications',
        'Workflow Automation',
        'Business Software'
      ],
      challenge: 'Off-the-shelf software tools often fail to accommodate specialized business processes, resulting in manual workarounds and fragmented user experiences.',
      solution: 'We design custom web platforms, mobile solutions, API integration layers, and automated workflow engines tailored to operational goals.',
      impact: 'Automates manual operational tasks to accelerate processing throughput.',
      deliverables: [
        'Production Web & Mobile Software Codebases',
        'REST / gRPC Microservice API Gateways',
        'Automated Workflow Engine Blueprints',
        'Developer Documentation & Deployment Scripts'
      ],
      outcomes: [
        'High performance user portals with instant updates',
        'Streamlined internal workflow automation',
        'Decoupled scalable microservice architectures'
      ],
      techStack: ['React', 'TypeScript', 'Node.js', 'Go', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
      duration: '8 - 14 Weeks Engagement',
      icon: <Code className="h-7 w-7 text-indigo-500" />,
      architectureType: 'software'
    }
  ];

  const handleConsultation = (serviceName: string) => {
    setSelectedPillar(null);
    showToast(`Request for custom consultation on ${serviceName} received!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-3xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Official Company Services</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Enterprise Services & Core Offerings
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Devolatical Global Info-Tech & Analytics Pvt. Ltd. delivers high-performance software, robust IT infrastructure, and actionable data analytics tailored for enterprise success.
        </p>
      </section>

      {/* Official 3 Pillars Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {officialPillars.map((pillar) => (
          <Card key={pillar.id} hoverEffect className="flex flex-col justify-between border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden group">
            <div>
              <div className="p-3.5 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform duration-300">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-850 dark:text-white mb-3 group-hover:text-secondary transition-colors">
                {pillar.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {pillar.challenge}
              </p>

              {/* Sub-Offerings Badge List */}
              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Core Offerings</span>
                <div className="flex flex-wrap gap-1.5">
                  {pillar.subOfferings.map((sub, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[9.5px]">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Business Impact Box */}
              <div className="p-3 bg-slate-50 dark:bg-dark/40 border-l-2 border-accent rounded-r-lg text-xs text-slate-600 dark:text-slate-400 mb-6">
                <strong className="text-slate-800 dark:text-slate-200">Business Impact:</strong> {pillar.impact}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-850/50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                {pillar.duration}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="justify-center group cursor-pointer text-xs font-bold"
                onClick={() => setSelectedPillar(pillar)}
              >
                <span>Full Specifications</span>
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </Card>
        ))}
      </section>

      {/* Interactive Specifications Modal */}
      <Modal
        isOpen={selectedPillar !== null}
        onClose={() => setSelectedPillar(null)}
        title={selectedPillar?.name}
        className="max-w-2xl"
      >
        {selectedPillar && (
          <div className="space-y-6 text-sm leading-relaxed max-h-[75vh] overflow-y-auto pr-1">
            {/* Sub-offerings */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">Sub-Offerings & Capabilities</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedPillar.subOfferings.map((sub, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px]">
                    ✓ {sub}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Business Challenge & Solution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-dark/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Business Challenge</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedPillar.challenge}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-dark/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Our Solution</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedPillar.solution}</p>
              </div>
            </div>

            {/* Architecture Diagram Visualization */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">Architecture Flow Diagram</h4>
              <div className="h-32 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
                {selectedPillar.architectureType === 'analytics' && (
                  <svg className="w-full h-full" viewBox="0 0 320 80">
                    <path d="M 20 40 H 100 H 200 H 290" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
                    <motion.circle cx="20" cy="40" r="3.5" fill="#00C2FF" animate={{ cx: [20, 100, 200, 290] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
                    <rect x="10" y="25" width="30" height="30" rx="4" fill="#002E5B" />
                    <text x="25" y="43" textAnchor="middle" fill="#FFFFFF" className="text-[7px] font-mono font-bold">Ingest</text>
                    <rect x="100" y="25" width="40" height="30" rx="4" fill="#00C2FF" />
                    <text x="120" y="43" textAnchor="middle" fill="#1e293b" className="text-[7px] font-mono font-bold">Spark</text>
                    <rect x="200" y="25" width="40" height="30" rx="4" fill="#22C55E" />
                    <text x="220" y="43" textAnchor="middle" fill="#FFFFFF" className="text-[7px] font-mono font-bold">Lakehouse</text>
                  </svg>
                )}
                {selectedPillar.architectureType === 'infrastructure' && (
                  <svg className="w-full h-full" viewBox="0 0 320 80">
                    <path d="M 20 40 L 100 20 L 200 60 L 290 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
                    <motion.circle cx="20" cy="40" r="3.5" fill="#002E5B" animate={{ cx: [20, 100, 200, 290], cy: [40, 20, 60, 40] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
                    <circle cx="20" cy="40" r="10" fill="#002E5B" />
                    <circle cx="100" cy="20" r="10" fill="#00C2FF" />
                    <circle cx="200" cy="60" r="10" fill="#22C55E" />
                    <circle cx="290" cy="40" r="10" fill="#F59E0B" />
                  </svg>
                )}
                {selectedPillar.architectureType === 'software' && (
                  <svg className="w-full h-full" viewBox="0 0 320 80">
                    <path d="M 20 40 H 150 H 290" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
                    <motion.circle cx="20" cy="40" r="3.5" fill="#6366F1" animate={{ cx: [20, 150, 290] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
                    <rect x="10" y="25" width="40" height="30" rx="4" fill="#6366F1" />
                    <text x="30" y="43" textAnchor="middle" fill="#FFFFFF" className="text-[7px] font-mono font-bold">UI Frontend</text>
                    <rect x="135" y="25" width="40" height="30" rx="4" fill="#00C2FF" />
                    <text x="155" y="43" textAnchor="middle" fill="#1e293b" className="text-[7px] font-mono font-bold">API Backend</text>
                    <rect x="270" y="25" width="40" height="30" rx="4" fill="#22C55E" />
                    <text x="290" y="43" textAnchor="middle" fill="#FFFFFF" className="text-[7px] font-mono font-bold">DB Store</text>
                  </svg>
                )}
              </div>
            </div>

            {/* Deliverables & Outcomes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">Key Deliverables</h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {selectedPillar.deliverables.map((d, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">Expected Outcomes</h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {selectedPillar.outcomes.map((o, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Cpu className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technology Stack */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">Technology Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedPillar.techStack.map((t, idx) => (
                  <Badge key={idx} variant="outline" className="text-[9.5px]">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 italic font-mono mt-1">
                * Representative enterprise technologies commonly used in modern solutions.
              </p>
            </div>

            {/* Footer Consultation Actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <Button
                variant="secondary"
                className="flex-grow justify-center cursor-pointer text-xs font-bold"
                onClick={() => handleConsultation(selectedPillar.name)}
              >
                Request Custom Consultation
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer text-xs"
                onClick={() => setSelectedPillar(null)}
              >
                Close Specifications
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Services;
