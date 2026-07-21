import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { HeartPulse, Landmark, ShoppingBag, Factory, Truck, Building2, Laptop, CheckCircle2 } from 'lucide-react';

interface IndustryItem {
  id: string;
  name: string;
  challenges: string;
  approach: string;
  solutions: string[];
  outcomes: string[];
  benefits: string[];
  useCases: string[];
  tech: string[];
  icon: React.ReactNode;
}

export const Industries: React.FC = () => {
  const industriesList: IndustryItem[] = [
    {
      id: 'finance',
      name: 'Banking & Financial Services',
      challenges: 'High transaction concurrency during market volatility, legacy batch reconciliation delays, and strict financial compliance parameters.',
      approach: 'Deploy event-driven Kafka stream buffers paired with real-time analytics ledgers and zero-trust authentication boundaries.',
      solutions: [
        'Real-Time Transaction Ledgers: CDC streaming database sync.',
        'Fraud Telemetry Engines: Real-time anomaly scoring pipelines.'
      ],
      outcomes: [
        'Reconciliation processing window reduced from days to real-time streams.',
        'Zero metadata loss during high-volume trading surges.'
      ],
      benefits: [
        'Rapid ledger update times',
        'Transparent automated compliance audit logging',
        'Reduced cloud database locking'
      ],
      useCases: [
        'Credit risk prediction algorithms',
        'Automated portfolio rebalancing alerts'
      ],
      tech: ['Snowflake', 'Apache Spark', 'Kafka', 'Go', 'Python'],
      icon: <Landmark className="h-6 w-6 text-secondary" />
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Life Sciences',
      challenges: 'Data fragmentation across EHR systems, strict patient privacy parameters, and latency in clinical telemetry monitoring.',
      approach: 'Architect secure HL7/FHIR compliance-ready data pipelines feeding encrypted multi-AZ cloud data stores.',
      solutions: [
        'HL7/FHIR Ingestion Gateway: Real-time clinical record integration.',
        'Patient Telemetry Storage: Encrypted multi-AZ data warehouses.'
      ],
      outcomes: [
        'Accelerated diagnostic telemetry sharing speed across research nodes.',
        'Hardened end-to-end encryption on transport and at rest.'
      ],
      benefits: [
        'Accelerated clinical trial dataset ingestion',
        'Single clinical view for care providers',
        'Zero patient data exposure risk'
      ],
      useCases: [
        'Clinical trial anomaly predictions',
        'Real-time patient vital sign alert telemetry'
      ],
      tech: ['AWS KMS', 'Apache Spark', 'PostgreSQL', 'dbt'],
      icon: <HeartPulse className="h-6 w-6 text-red-500" />
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      challenges: 'Inventory lag causing unexpected stock-outs during peak seasonal sales and fragmented customer clickstream profiles.',
      approach: 'Integrate real-time event streaming clickstream analytics with predictive machine learning inventory sizing engines.',
      solutions: [
        'Clickstream Event Processors: Unified customer behavior profiles.',
        'Demand Forecasting Engines: Automated inventory replenishment models.'
      ],
      outcomes: [
        'Significant improvement in inventory prediction accuracy.',
        'Sub-second latency on personalized customer recommendation APIs.'
      ],
      benefits: [
        'Elimination of warehouse stock-outs',
        'Higher shopping cart order conversion rates',
        'Unified omnichannel customer data'
      ],
      useCases: [
        'Dynamic inventory restocking models',
        'Personalized recommendation engine APIs'
      ],
      tech: ['Python', 'PostgreSQL', 'Kubernetes', 'Docker'],
      icon: <ShoppingBag className="h-6 w-6 text-accent" />
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Heavy Industry',
      challenges: 'Unplanned assembly line hardware outages, supply chain delivery delays, and unmonitored sensor workloads on factory floors.',
      approach: 'Build IoT device telemetry aggregators feeding real-time anomaly detection pipelines and predictive maintenance alerts.',
      solutions: [
        'IoT Telemetry Aggregators: Continuous device telemetry monitoring.',
        'Predictive Maintenance Triggers: Machine degradation forecasts.'
      ],
      outcomes: [
        'Reduction in assembly line maintenance downtime.',
        'Sub-second device tracking metric processing.'
      ],
      benefits: [
        'Lower factory equipment replacement costs',
        'Real-time heat and vibration alert monitors',
        'Optimized supply chain routing schedules'
      ],
      useCases: [
        'Equipment degradation alert scripts',
        'Dynamic supply chain routing blueprints'
      ],
      tech: ['Azure IoT Hub', 'Terraform', 'Kubernetes', 'Go'],
      icon: <Factory className="h-6 w-6 text-indigo-500" />
    },
    {
      id: 'logistics',
      name: 'Logistics & Distribution',
      challenges: 'Elevated fuel expenses from suboptimal fleet routing, inefficient warehouse space utilization, and manual dispatch tracking.',
      approach: 'Implement spatial routing analytics algorithms and real-time cargo container tracking pipelines.',
      solutions: [
        'Spatial Route Optimizers: AI-assisted vehicle routing algorithms.',
        'Warehouse Capacity Trackers: Spatial storage volume modeling.'
      ],
      outcomes: [
        'Reduction in monthly delivery routing fuel expenses.',
        'Real-time package status visibility across distribution networks.'
      ],
      benefits: [
        'Improved driver delivery completion rates',
        'Optimized warehouse pallet stacking space',
        'Instant cargo tracking updates'
      ],
      useCases: [
        'Predictive delivery arrival time models',
        'Active container capacity optimization'
      ],
      tech: ['PostgreSQL Spatial', 'Node.js', 'Docker', 'AWS Fargate'],
      icon: <Truck className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'government',
      name: 'Government & Public Sector',
      challenges: 'Massive legacy databases, slow public disclosure response times, and strict regional cybersecurity guidelines.',
      approach: 'Migrate legacy records to secured, private cloud infrastructure with role-based governance controls.',
      solutions: [
        'Public Portal Ingestors: Legacy record indexing pipelines.',
        'Secured Storage Architecture: Hardened private cloud environments.'
      ],
      outcomes: [
        'Accelerated record query responses for public disclosure requests.',
        'Strict alignment with government system security benchmarks.'
      ],
      benefits: [
        'Secure multi-agency data sharing',
        'Lower legacy database maintenance spending',
        'Auditable administrative activity logs'
      ],
      useCases: [
        'Smart city sensor network monitoring',
        'Automated document indexing verification'
      ],
      tech: ['AWS GovCloud', 'Wazuh', 'Terraform', 'Python'],
      icon: <Building2 className="h-6 w-6 text-blue-500" />
    },
    {
      id: 'technology',
      name: 'High-Technology & Software',
      challenges: 'High API maintenance overheads, dynamic database load spikes, and complex microservices orchestration cycles.',
      approach: 'Deploy auto-scaling Kubernetes node clusters managed declaratively via Terraform with zero-trust API gateways.',
      solutions: [
        'Kubernetes Infrastructure: Fully automated orchestration.',
        'API Gateway Optimization: Cached client transaction layers.'
      ],
      outcomes: [
        'High core infrastructure availability under peak traffic load.',
        'Fast deployment pipelines for engineering teams.'
      ],
      benefits: [
        'Seamless dynamic traffic handling',
        'Sub-millisecond API response times',
        'Declarative infrastructure state tracking'
      ],
      useCases: [
        'Developer resource usage forecasting',
        'Real-time API error monitoring metrics'
      ],
      tech: ['Kubernetes', 'Go Backend', 'Prometheus', 'Terraform'],
      icon: <Laptop className="h-6 w-6 text-pink-500" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-3xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Enterprise Sectors</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Industry Solutions & Domain Expertise
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          We customize our core analytics frameworks, cloud infrastructure solutions, and custom software architectures to align with industry compliance requirements and strategic business targets.
        </p>
      </section>

      {/* Industries List */}
      <section className="space-y-16">
        {industriesList.map((ind, index) => (
          <div
            key={ind.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pb-12 border-b border-slate-100 dark:border-slate-850/60"
          >
            {/* Left Content (7/12) */}
            <div className={`lg:col-span-7 space-y-6 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg">
                  {ind.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-850 dark:text-white leading-none">
                  {ind.name}
                </h3>
              </div>

              {/* Challenge & Approach */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Business Challenge</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ind.challenges}</p>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Implementation Approach</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ind.approach}</p>
                </div>
              </div>

              {/* Benefits & Outcomes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Expected Outcomes</h4>
                  <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400">
                    {ind.outcomes.map((o, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-3.5 w-3.5 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono font-bold">Business Benefits</h4>
                  <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400">
                    {ind.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Analytics Use Cases & Tech Stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Analytics Use Cases</h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {ind.useCases.map((u, idx) => (
                      <li key={idx}>{u}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Technology Stack</h4>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {ind.tech.map((t, idx) => (
                      <Badge key={idx} variant="outline" className="text-[9px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[8.5px] text-slate-400 italic font-mono">
                    * Representative enterprise technologies.
                  </p>
                </div>
              </div>
            </div>

            {/* Right SVG Architecture Diagram (5/12) */}
            <div className={`lg:col-span-5 h-64 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden flex items-center justify-center shadow-card ${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
              <div className="absolute inset-0 bg-secondary/5 filter blur-3xl pointer-events-none" />
              
              <svg className="w-full h-full overflow-visible" viewBox="0 0 250 150">
                {/* Connection paths */}
                <path d="M 30 75 H 110 M 110 75 L 180 40 M 110 75 L 180 110" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-200 dark:text-slate-800" />
                
                {/* Moving particles */}
                <motion.circle cx="30" cy="75" r="3.5" fill="#0F62FE" animate={{ cx: [30, 110, 180], cy: [75, 75, 40] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
                <motion.circle cx="30" cy="75" r="3.5" fill="#00C2FF" animate={{ cx: [30, 110, 180], cy: [75, 75, 110] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }} />

                {/* Nodes */}
                <circle cx="30" cy="75" r="8" fill="#1e293b" stroke="#00C2FF" strokeWidth="2" />
                <text x="30" y="93" textAnchor="middle" className="text-[7px] font-mono text-slate-400" fill="currentColor">Ingestion Node</text>

                <circle cx="110" cy="75" r="8" fill="#1e293b" stroke="#0F62FE" strokeWidth="2" />
                <text x="110" y="93" textAnchor="middle" className="text-[7px] font-mono text-slate-400" fill="currentColor">Data Buffer</text>

                <circle cx="180" cy="40" r="8" fill="#1e293b" stroke="#22C55E" strokeWidth="2" />
                <text x="180" y="25" textAnchor="middle" className="text-[7px] font-mono text-slate-400" fill="currentColor">Active Cluster</text>

                <circle cx="180" cy="110" r="8" fill="#1e293b" stroke="#F59E0B" strokeWidth="2" />
                <text x="180" y="128" textAnchor="middle" className="text-[7px] font-mono text-slate-400" fill="currentColor">Backup Storage</text>
              </svg>
              
              <span className="absolute bottom-4 right-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                // sector_dataflow.diag
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Industries;
