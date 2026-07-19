import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Activity, Landmark, ShoppingBag, ArrowUpRight, Clock, Target, CheckCircle2 } from 'lucide-react';

interface CaseDetail {
  id: string;
  client: string;
  industry: 'Finance' | 'Healthcare' | 'Retail';
  title: string;
  summary: string;
  problem: string; // Business Challenge
  objectives: string[]; // Client Objectives
  solution: string; // Solution Architecture
  results: string[]; // Business Impact & ROI
  kpis: string[];
  tech: string[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  timeline: string[];
  icon: React.ReactNode;
}

export const CaseStudies: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Finance' | 'Healthcare' | 'Retail'>('All');

  const casesList: CaseDetail[] = [
    {
      id: 'case-finance',
      client: 'Global Tier-1 Investment Bank',
      industry: 'Finance',
      title: 'Streaming Ingestion Scaling for Asset Transactions',
      summary: 'Re-engineered data lakehouse architecture to handle ingestion loads of 80k active transactions per second.',
      problem: 'Legacy databases experienced connection pooling locks during peak trading hours, causing transaction latency spikes and delayed portfolios update runs.',
      objectives: [
        'Consolidate transaction events from four regional financial centers.',
        'Maintain 99.99% system availability under extreme traffic surges.',
        'Minimize cloud storage overhead through active schema pruning.'
      ],
      solution: 'Replaced core ingestion layers with Kafka streaming brokers feeding an auto-scaling Apache Spark cluster that syncs directly into Snowflake Core tables.',
      results: [
        'Reduced ledger sync latencies from 4.2s to sub-10ms intervals.',
        'Eliminated transaction pooling bottlenecks, avoiding connection losses.',
        'Decreased cloud infrastructure cost metrics by 34%, yielding an annual ROI of $1.2M.'
      ],
      kpis: ['Latency: Sub-10ms', 'Cost Save: 34%', 'System Uptime: 99.99%'],
      tech: ['AWS Kinesis', 'Apache Spark', 'Snowflake', 'Scala', 'Terraform'],
      testimonial: {
        quote: "Devolatical Global delivered our new database engine on time. Transaction locks have dropped to zero.",
        author: "Richard Caldwell",
        role: "VP of Technology, Capital Assets Division"
      },
      timeline: ['Phase 1: Architecture Review (1 Wk)', 'Phase 2: Spark Cluster Design (2 Wks)', 'Phase 3: Real-Time Syncing (2 Wks)', 'Phase 4: Dynamic Load Trials (1 Wk)'],
      icon: <Landmark className="h-5 w-5 text-secondary" />
    },
    {
      id: 'case-healthcare',
      client: 'Providence Clinical Research Network',
      industry: 'Healthcare',
      title: 'Compliance-Ready Patient Telemetry Warehousing',
      summary: 'Provisioned a secure, compliance-ready storage warehouse mapping patient clinical records.',
      problem: 'Data sharing between regional hospitals was delayed, impacting clinical research timelines due to strict audit validation needs and security parameters.',
      objectives: [
        'Establish automated audit readiness logs for security reviews.',
        'Reduce diagnostics exchange times across systems by at least 30%.',
        'Secure 256-bit encryption for all records on transport and at rest.'
      ],
      solution: 'Designed secure API gateways deploying AWS RDS databases with multi-AZ replication, using Wazuh active threat monitoring logs.',
      results: [
        'Established automated compliance audit trails.',
        'Decreased diagnostic data delivery times by 40% across clinics.',
        'Hardened network defenses to pass independent validation tests.'
      ],
      kpis: ['Data Delivery: -40%', 'Encryption: AES-256', 'Compliance: HIPAA Ready'],
      tech: ['Node.js', 'PostgreSQL', 'AWS GovCloud', 'Docker', 'Terraform'],
      testimonial: {
        quote: "Our compliance audits are now fully automated. The data exchange pipelines operate securely and smoothly.",
        author: "Dr. Amanda Ross",
        role: "Director of Clinical Research Systems"
      },
      timeline: ['Phase 1: Compliance Mapping (2 Wks)', 'Phase 2: Database Replication Setup (2 Wks)', 'Phase 3: Gateway Integrations (2 Wks)', 'Phase 4: Security Verification (1 Wk)'],
      icon: <Activity className="h-5 w-5 text-red-500" />
    },
    {
      id: 'case-retail',
      client: 'Omnichannel Consumer Retailer',
      industry: 'Retail',
      title: 'Machine Learning Demand Forecasting and Personalization',
      summary: 'Developed clickstream analytics and ML recommendation pipelines scaling peak holiday volumes.',
      problem: 'Static demand forecasting models led to warehouse stock-outs during peak seasonal promotions, causing lost revenue sales and cart abandonment.',
      objectives: [
        'Optimize inventory forecasting cycles using real-time transactions.',
        'Maintain sub-50ms latency on personalized recommendation APIs.',
        'Unify web and retail transactions under a single analytics layer.'
      ],
      solution: 'Provisioned Python forecasting engines running on Kubernetes clusters that process real-time visitor event metrics from Postgres databases.',
      results: [
        'Improved demand prediction accuracies by 28%, reducing stockouts.',
        'Reduced warehouse stock-out rates to 0.2% globally.',
        'Average cart order values increased by 14% due to personalized recommendation APIs.'
      ],
      kpis: ['Prediction accuracy: +28%', 'Order values: +14%', 'Stockout rate: 0.2%'],
      tech: ['Python', 'Kubernetes', 'TensorFlow', 'PostgreSQL', 'Metabase'],
      testimonial: {
        quote: "The forecasting accuracy improvement completely changed our inventory strategies. A multi-million dollar return.",
        author: "Simon Cole",
        role: "Chief Operating Officer"
      },
      timeline: ['Phase 1: Analytics Hook Integration (2 Wks)', 'Phase 2: Forecasting ML Model build (3 Wks)', 'Phase 3: Cluster Auto-scaling setup (2 Wks)', 'Phase 4: A/B Testing Verification (1 Wk)'],
      icon: <ShoppingBag className="h-5 w-5 text-accent" />
    }
  ];

  const filteredCases = activeFilter === 'All'
    ? casesList
    : casesList.filter((c) => c.industry === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Case Studies</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Enterprise Implementations
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Explore how Devolatical Global delivers verified returns on architectural engineering and analytics deployments.
        </p>
      </section>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        {(['All', 'Finance', 'Healthcare', 'Retail'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === tab
                ? 'bg-secondary text-white'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((cs) => (
          <Card key={cs.id} hoverEffect className="flex flex-col justify-between h-full border border-slate-100 dark:border-slate-800 hover:border-secondary/40 p-6 relative overflow-hidden group">
            <div className="absolute inset-0 border border-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="text-[9px]">
                  {cs.industry}
                </Badge>
                <span className="text-[10px] text-slate-400 font-bold">{cs.client}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2 leading-snug group-hover:text-secondary transition-colors">
                {cs.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                {cs.summary}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mb-6">
                {cs.kpis.map((kpi, idx) => (
                  <Badge key={idx} variant="success" className="text-[9px]">
                    {kpi}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center group cursor-pointer text-xs"
              onClick={() => setSelectedCase(cs)}
            >
              <span>View Case details</span>
              <ArrowUpRight className="ml-2 h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Card>
        ))}
      </section>

      {/* Case Study Modal */}
      <Modal
        isOpen={selectedCase !== null}
        onClose={() => setSelectedCase(null)}
        title={selectedCase?.title}
        className="max-w-2xl"
      >
        {selectedCase && (
          <div className="space-y-6 text-sm leading-relaxed max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/40">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">{selectedCase.client}</span>
              <span className="text-xs text-slate-400 font-semibold">{selectedCase.industry}</span>
            </div>

            {/* Architecture Diagram Visualization */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Pipeline Ingestion Flow Diagram</h4>
              <div className="h-28 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 80">
                  <path d="M 20 40 H 100 H 200 H 290" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
                  
                  {/* Nodes */}
                  <rect x="10" y="25" width="30" height="30" rx="4" fill="#0F62FE" opacity="0.85" />
                  <text x="25" y="43" textAnchor="middle" fill="#FFFFFF" className="text-[7px] font-mono font-bold">API</text>

                  <rect x="100" y="25" width="40" height="30" rx="4" fill="#00C2FF" opacity="0.85" />
                  <text x="120" y="43" textAnchor="middle" fill="#1e293b" className="text-[7px] font-mono font-bold">Spark</text>

                  <rect x="200" y="25" width="40" height="30" rx="4" fill="#22C55E" opacity="0.85" />
                  <text x="220" y="43" textAnchor="middle" fill="#FFFFFF" className="text-[7px] font-mono font-bold">Data Store</text>
                </svg>
                <span className="absolute bottom-2 right-4 text-[8px] font-mono text-slate-400">devolatical-dataflow.svg</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Business Challenge</h4>
                <p className="text-slate-500 text-xs">{selectedCase.problem}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Solution Architecture</h4>
                <p className="text-slate-500 text-xs">{selectedCase.solution}</p>
              </div>
            </div>

            {/* Client Objectives */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Client Objectives</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                {selectedCase.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <Target className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timelines and Tech */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Delivery Timeline */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">Implementation Process</h4>
                <ul className="space-y-1.5 text-xs text-slate-550 dark:text-slate-400">
                  {selectedCase.timeline.map((event, idx) => (
                    <li key={idx} className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-2 text-secondary flex-shrink-0" />
                      <span>{event}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">Technologies Used</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCase.tech.map((t, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Results */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Business Impact & ROI</h4>
                <ul className="space-y-1.5 text-xs text-slate-550 dark:text-slate-400">
                  {selectedCase.results.map((r, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Testimonial Quote */}
              <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 self-start">
                <p className="italic text-xs text-slate-500">"{selectedCase.testimonial.quote}"</p>
                <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest text-right">
                  — {selectedCase.testimonial.author}, {selectedCase.testimonial.role}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <Button variant="secondary" onClick={() => setSelectedCase(null)} className="cursor-pointer text-xs">
                Return to Cases
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CaseStudies;
