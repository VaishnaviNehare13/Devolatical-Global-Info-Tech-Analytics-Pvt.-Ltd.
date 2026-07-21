import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Activity, Landmark, ShoppingBag, Factory, Building2, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';

interface CaseDetail {
  id: string;
  clientLabel: string;
  industry: 'Finance' | 'Healthcare' | 'Retail' | 'Manufacturing' | 'Government';
  title: string;
  summary: string;
  challenge: string;
  architecture: string;
  implementation: string[];
  technology: string[];
  businessImpact: string;
  results: string[];
  kpis: string[];
  testimonial: {
    quote: string;
    role: string;
  };
  icon: React.ReactNode;
}

export const CaseStudies: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Finance' | 'Healthcare' | 'Retail' | 'Manufacturing' | 'Government'>('All');

  const casesList: CaseDetail[] = [
    {
      id: 'case-finance',
      clientLabel: 'Financial Institution',
      industry: 'Finance',
      title: 'Streaming Ingestion & High-Throughput Asset Transaction Ledger',
      summary: 'Re-engineered core data lakehouse architecture to handle ingestion streaming workloads of high-volume asset transactions.',
      challenge: 'Legacy transaction databases experienced connection pooling bottlenecks during peak trading windows, causing ledger sync latency spikes.',
      architecture: 'Event-driven streaming ingestion layer utilizing message brokers feeding an auto-scaling Spark engine that syncs directly into Snowflake Core schemas.',
      implementation: [
        'Phase 1: Database connection pool & bottleneck audit',
        'Phase 2: Spark cluster auto-scaling setup',
        'Phase 3: Real-time Kafka stream ingestion pipeline integration',
        'Phase 4: High-concurrency stress validation trials'
      ],
      technology: ['AWS Kinesis', 'Apache Spark', 'Snowflake', 'Scala', 'Terraform', 'Kafka'],
      businessImpact: 'Eliminated transaction pooling locks and significantly reduced ledger sync latencies across trading windows.',
      results: [
        'Reduced ledger sync latency to optimal sub-second intervals',
        'Zero connection pool lockouts during peak market volumes',
        'Improved cloud compute resource efficiency'
      ],
      kpis: ['Low Latency Architecture', 'Cost Optimization', 'High Availability'],
      testimonial: {
        quote: "The redesigned streaming ledger pipeline completely eliminated database locks during peak market volatility.",
        role: "Principal Architect, Financial Services Practice"
      },
      icon: <Landmark className="h-5 w-5 text-secondary" />
    },
    {
      id: 'case-healthcare',
      clientLabel: 'Healthcare Provider',
      industry: 'Healthcare',
      title: 'Clinical Data Exchange & Encrypted Patient Telemetry Warehouse',
      summary: 'Provisioned a multi-AZ clinical data warehouse mapping patient health records with strict automated encryption controls.',
      challenge: 'Clinical telemetry exchange across regional diagnostic centers was delayed due to manual record verification routines.',
      architecture: 'Secure API gateways interfacing with multi-AZ PostgreSQL databases utilizing KMS key envelope encryption and active telemetry log monitoring.',
      implementation: [
        'Phase 1: HL7/FHIR telemetry schema mapping',
        'Phase 2: Encrypted multi-AZ database replication',
        'Phase 3: Secure API gateway integration',
        'Phase 4: Automated diagnostic verification testing'
      ],
      technology: ['Node.js', 'PostgreSQL', 'AWS KMS', 'Docker', 'Terraform', 'Go'],
      businessImpact: 'Accelerated clinical diagnostic data delivery times while ensuring zero unencrypted data staging.',
      results: [
        'Accelerated diagnostic telemetry sharing speed across clinics',
        'Automated telemetry audit log generation',
        'Zero metadata integrity loss during multi-system record syncs'
      ],
      kpis: ['Rapid Telemetry Delivery', 'Encryption: AES-256', 'Auditable Security'],
      testimonial: {
        quote: "Diagnostic telemetry exchange between regional nodes is now fast, seamless, and fully encrypted.",
        role: "Lead Systems Engineer, Healthcare Solutions Practice"
      },
      icon: <Activity className="h-5 w-5 text-red-500" />
    },
    {
      id: 'case-retail',
      clientLabel: 'Retail Organization',
      industry: 'Retail',
      title: 'Predictive Demand Forecasting & Omnichannel Clickstream Analytics',
      summary: 'Developed real-time clickstream event processors and predictive demand forecasting algorithms.',
      challenge: 'Static demand forecasting models led to warehouse stock-outs during peak seasonal promotions, causing lost revenue sales.',
      architecture: 'Predictive forecasting models executing on Kubernetes worker nodes that process real-time clickstream streams from event databases.',
      implementation: [
        'Phase 1: Clickstream tracking hook integration',
        'Phase 2: Predictive demand forecasting model training',
        'Phase 3: Kubernetes cluster auto-scaling setup',
        'Phase 4: Omnichannel inventory sync verification'
      ],
      technology: ['Python', 'Kubernetes', 'TensorFlow', 'PostgreSQL', 'Docker', 'Metabase'],
      businessImpact: 'Improved inventory prediction accuracy, significantly reducing warehouse stock-outs during peak sales events.',
      results: [
        'Improved inventory demand forecasting accuracy',
        'Drastically reduced warehouse stock-outs globally',
        'High-performance recommendation API response times'
      ],
      kpis: ['Enhanced Forecasting', 'Minimized Stockouts', 'High Speed APIs'],
      testimonial: {
        quote: "Real-time demand forecasting transformed our inventory strategy and eliminated stock-outs during holiday traffic.",
        role: "Lead Analytics Architect, Retail Practice"
      },
      icon: <ShoppingBag className="h-5 w-5 text-accent" />
    },
    {
      id: 'case-manufacturing',
      clientLabel: 'Manufacturing Enterprise',
      industry: 'Manufacturing',
      title: 'IoT Sensor Telemetry Aggregation & Predictive Maintenance Hub',
      summary: 'Engineered an IoT device telemetry aggregator feeding real-time machine degradation anomaly models on factory assembly lines.',
      challenge: 'Unscheduled equipment outages on assembly lines caused costly operational delays and lost manufacturing output.',
      architecture: 'Event-driven IoT telemetry ingestion network paired with time-series anomaly detection algorithms and automated maintenance triggers.',
      implementation: [
        'Phase 1: Factory floor IoT sensor protocol integration',
        'Phase 2: Real-time time-series telemetry pipeline coding',
        'Phase 3: Predictive maintenance threshold triggers setup',
        'Phase 4: Automated dispatch alert testing'
      ],
      technology: ['Azure IoT Hub', 'Terraform', 'Go', 'Kubernetes', 'Prometheus'],
      businessImpact: 'Reduced unscheduled assembly line downtime through proactive hardware maintenance alerts.',
      results: [
        'Significant reduction in assembly line downtime',
        'Early detection of motor heat and vibration anomalies',
        'Lower hardware replacement spends'
      ],
      kpis: ['Reduced Downtime', 'Proactive Alerts', 'Real-Time Telemetry'],
      testimonial: {
        quote: "Predictive maintenance alerts allow our maintenance teams to resolve machine wear long before outages occur.",
        role: "Principal Infrastructure Lead, Industrial Systems Practice"
      },
      icon: <Factory className="h-5 w-5 text-indigo-500" />
    },
    {
      id: 'case-government',
      clientLabel: 'Government Agency',
      industry: 'Government',
      title: 'Secured Record Analytics Portal & Automated Indexing Pipeline',
      summary: 'Migrated legacy public records to a secure private cloud indexing architecture with auditable access controls.',
      challenge: 'Legacy database appliances caused slow record search query responses for administrative requests.',
      architecture: 'Hardened private cloud architecture deploying automated document indexing pipelines and encrypted query caching layers.',
      implementation: [
        'Phase 1: Legacy record format conversion & staging',
        'Phase 2: Hardened private cloud VPC provisioning',
        'Phase 3: Automated document indexing script deployment',
        'Phase 4: Access audit logging verification'
      ],
      technology: ['AWS GovCloud', 'Wazuh', 'Terraform', 'Python', 'PostgreSQL'],
      businessImpact: 'Accelerated administrative record query speeds while ensuring auditable access tracking.',
      results: [
        'Significantly faster record query response times',
        'Fully auditable access tracking logs',
        'Zero security policy deviations during system audits'
      ],
      kpis: ['Rapid Record Access', 'Auditable Trail', 'High Availability'],
      testimonial: {
        quote: "The private cloud indexing portal drastically accelerated record retrieval while keeping access fully auditable.",
        role: "Senior Solutions Architect, Public Sector Practice"
      },
      icon: <Building2 className="h-5 w-5 text-blue-500" />
    }
  ];

  const filteredCases = activeFilter === 'All'
    ? casesList
    : casesList.filter((c) => c.industry === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-3xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Case Studies</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Enterprise Implementations & Outcomes
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Explore how Devolatical Global Info-Tech & Analytics Pvt. Ltd. delivers verified business returns across Advanced Data Analytics, IT Infrastructure Solutions, and Custom Software Engineering.
        </p>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        {(['All', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Government'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === tab
                ? 'bg-secondary text-white'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-slate-50/50 dark:bg-dark/10'
            }`}
          >
            {tab === 'All' ? 'All Case Studies' : tab}
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((cs) => (
          <Card key={cs.id} hoverEffect className="flex flex-col justify-between border border-slate-100 dark:border-slate-800 hover:border-secondary/40 p-6 relative overflow-hidden group">
            <div className="absolute inset-0 border border-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="text-[9px]">
                  {cs.industry}
                </Badge>
                <span className="text-[10px] text-slate-400 font-bold font-mono">{cs.clientLabel}</span>
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
              className="w-full justify-center group cursor-pointer text-xs font-bold"
              onClick={() => setSelectedCase(cs)}
            >
              <span>View Structured Study</span>
              <ArrowUpRight className="ml-2 h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Card>
        ))}
      </section>

      {/* Technology Disclaimer Note */}
      <div className="text-center text-[10px] text-slate-400 font-mono italic">
        * Representative enterprise technologies commonly used in modern solutions.
      </div>

      {/* Case Study Detailed Modal */}
      <Modal
        isOpen={selectedCase !== null}
        onClose={() => setSelectedCase(null)}
        title={selectedCase?.title}
        className="max-w-2xl"
      >
        {selectedCase && (
          <div className="space-y-6 text-sm leading-relaxed max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/40 font-mono">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">{selectedCase.clientLabel}</span>
              <span className="text-xs text-slate-400 font-semibold">{selectedCase.industry} Industry</span>
            </div>

            {/* Structured Challenge & Architecture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-dark/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">Challenge</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedCase.challenge}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-dark/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">Architecture</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedCase.architecture}</p>
              </div>
            </div>

            {/* Implementation & Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">Implementation Phases</h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {selectedCase.implementation.map((step, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Clock className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">Verified Results</h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {selectedCase.results.map((res, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technology & Business Impact */}
            <div className="space-y-4 pt-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">Business Impact</h4>
                <div className="p-3.5 bg-slate-50 dark:bg-dark/40 border-l-2 border-accent rounded-r-lg text-xs text-slate-700 dark:text-slate-300">
                  {selectedCase.businessImpact}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 font-mono">Technology Stack</h4>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {selectedCase.technology.map((t, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 italic block font-mono">
                  * Representative enterprise technologies.
                </span>
              </div>

              {/* Anonymized Practice Lead Quote */}
              <div className="p-4 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                <p className="italic text-xs text-slate-600 dark:text-slate-400">"{selectedCase.testimonial.quote}"</p>
                <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest font-mono text-right">
                  — {selectedCase.testimonial.role}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <Button variant="secondary" onClick={() => setSelectedCase(null)} className="cursor-pointer text-xs font-bold">
                Return to Case Studies
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CaseStudies;
