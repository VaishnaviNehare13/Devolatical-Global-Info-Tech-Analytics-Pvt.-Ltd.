import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { HeartPulse, Landmark, ShoppingBag, Factory, Truck, Building2, GraduationCap, Laptop } from 'lucide-react';

interface IndustryItem {
  id: string;
  name: string;
  challenges: string;
  solutions: string[];
  outcomes: string[];
  useCases: string[];
  tech: string[];
  icon: React.ReactNode;
}

export const Industries: React.FC = () => {
  const industriesList: IndustryItem[] = [
    {
      id: 'healthcare',
      name: 'Healthcare & Life Sciences',
      challenges: 'Strict regulatory frameworks (HIPAA/HITECH), data fragmentation across EHR networks, and latency issues in streaming telemetry sensors.',
      solutions: [
        'HL7/FHIR Ingestion Pipelines: Real-time patient records streaming.',
        'Unified Data Storage: High-security multi-AZ clinical warehouses.'
      ],
      outcomes: [
        '40% faster diagnostic telemetry sharing speed.',
        'Zero metadata integrity loss during multi-system data merges.'
      ],
      useCases: [
        'Clinical trial anomaly predictions.',
        'Real-time bedside patient vital tracking alerts.'
      ],
      tech: ['Snowflake', 'Apache Spark', 'AWS KMS', 'dbt'],
      icon: <HeartPulse className="h-6 w-6 text-red-500" />
    },
    {
      id: 'finance',
      name: 'Banking & Financial Services',
      challenges: 'Vulnerability to fraud vectors, legacy batch reconciliation delays, and complex international financial compliance benchmarks.',
      solutions: [
        'Fraud Telemetry Analyzers: Sub-second anomaly tracking pipelines.',
        'Real-Time Ledgers: Distributed streaming CDC synchronization.'
      ],
      outcomes: [
        'Reconciliation processing window reduced from 24 hours to under 3 minutes.',
        'High compliance verification readiness with automated audit trails.'
      ],
      useCases: [
        'Credit scoring prediction scripts.',
        'Algorithmic portfolio balance adjustments.'
      ],
      tech: ['Snowflake', 'Apache Spark', 'Kafka', 'Go'],
      icon: <Landmark className="h-6 w-6 text-secondary" />
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      challenges: 'Unpredictable customer churn, stock shortages from inventory lag, and fragmented tracking across multi-channel transactions.',
      solutions: [
        'Clickstream Event Analytics: Consolidated customer action profiles.',
        'Demand Forecasting: Automated inventory sizing algorithms.'
      ],
      outcomes: [
        '28% inventory accuracy improvement.',
        'Silos consolidated into a single e-commerce telemetry source.'
      ],
      useCases: [
        'Dynamic cart-abandonment trigger models.',
        'Personalized recommenders feeding directly from delta lake stores.'
      ],
      tech: ['Python', 'PostgreSQL', 'Metabase', 'Docker'],
      icon: <ShoppingBag className="h-6 w-6 text-accent" />
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Heavy Industry',
      challenges: 'Unexpected factory outages, supply chain delivery blocks, and unmonitored hardware workloads on assembly lines.',
      solutions: [
        'IoT Telemetry Aggregators: Continuous device telemetry monitoring.',
        'Predictive Maintenance Triggers: Machine degradation forecasts.'
      ],
      outcomes: [
        '30% reduction in assembly line maintenance downtime.',
        'Lower device tracking script execution latency.'
      ],
      useCases: [
        'Equipment heat and speed anomaly models.',
        'Dynamic supply chain routing blueprints.'
      ],
      tech: ['Azure IoT Hub', 'Terraform', 'Kubernetes', 'Go'],
      icon: <Factory className="h-6 w-6 text-indigo-500" />
    },
    {
      id: 'logistics',
      name: 'Logistics & Distribution',
      challenges: 'Fuel waste from inefficient delivery routes, warehouse space waste, and manual shipment dispatching errors.',
      solutions: [
        'Route Cost Optimizers: AI spatial routing models.',
        'Warehouse Capacity Trackers: Spatial storage volume modeling.'
      ],
      outcomes: [
        '14% reduction in monthly delivery routing fuel expenses.',
        'Real-time package status visibility across systems.'
      ],
      useCases: [
        'Predictive delivery date models.',
        'Active container load capacity analytics.'
      ],
      tech: ['PostgreSQL Spatial', 'Node.js', 'Docker', 'AWS Fargate'],
      icon: <Truck className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'government',
      name: 'Government & Public Sector',
      challenges: 'Massive legacy databases, public information disclosure timelines, and tight regional cybersecurity requirements.',
      solutions: [
        'Public Portal Ingestors: Legacy record indexing pipelines.',
        'Secured Storage: Hardened private government clouds.'
      ],
      outcomes: [
        'Accelerated record query responses for public requests.',
        'High compliance with federal system security benchmarks.'
      ],
      useCases: [
        'Smart city sensor network monitoring.',
        'Automated document verification pipeline scripts.'
      ],
      tech: ['AWS GovCloud', 'Wazuh', 'Terraform', 'Python'],
      icon: <Building2 className="h-6 w-6 text-blue-500" />
    },
    {
      id: 'education',
      name: 'Higher Education',
      challenges: 'Student retention dropouts, uncoordinated department budgets, and fragmented learning management registries.',
      solutions: [
        'Student Success Trackers: Early warning dropout predictors.',
        'Consolidated Databases: Unified student records storage.'
      ],
      outcomes: [
        'Improved administrative retention monitoring speed.',
        'Siloed registries consolidated under unified data catalogs.'
      ],
      useCases: [
        'Optimal course size selection analytics.',
        'Departmental expenditure forecasting models.'
      ],
      tech: ['PostgreSQL', 'Tableau', 'dbt', 'AWS Lambda'],
      icon: <GraduationCap className="h-6 w-6 text-orange-500" />
    },
    {
      id: 'technology',
      name: 'High-Technology & Software',
      challenges: 'High SaaS API maintenance overheads, database load spikes, and manual microservices orchestration cycles.',
      solutions: [
        'Kubernetes Infrastructure: Fully automated orchestration.',
        'API Gateway Optimization: Cached client transaction layers.'
      ],
      outcomes: [
        '99.99% core infrastructure availability under peak traffic load.',
        'Simplified developer workflows through automated deployments.'
      ],
      useCases: [
        'Developer usage forecasting engines.',
        'Real-time API error monitoring and metrics logs.'
      ],
      tech: ['Kubernetes', 'Go Backend', 'Prometheus', 'Terraform'],
      icon: <Laptop className="h-6 w-6 text-pink-500" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Sectors Served</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Enterprise Industry Solutions
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          We customize our core analytics frameworks, governance systems, and cloud strategies to align perfectly with industry compliance guidelines and business targets.
        </p>
      </section>

      {/* Industries Grid */}
      <section className="space-y-16">
        {industriesList.map((ind, index) => (
          <div
            key={ind.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pb-12 border-b border-slate-100 dark:border-slate-850/60`}
          >
            {/* Left Content (7/12) */}
            <div className={`lg:col-span-7 space-y-6 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg">
                  {ind.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-850 dark:text-white leading-none">
                  {ind.name}
                </h3>
              </div>

              {/* Challenges */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Business Challenge</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {ind.challenges}
                </p>
              </div>

              {/* Solutions & Outcomes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Our Solutions</h4>
                  <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400 list-disc list-inside">
                    {ind.solutions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Outcomes</h4>
                  <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400 list-disc list-inside">
                    {ind.outcomes.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Analytics Use Cases</h4>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {ind.useCases.map((u, idx) => (
                    <li key={idx}>{u}</li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key Technology Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {ind.tech.map((t, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      {t}
                    </Badge>
                  ))}
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
              
              <span className="absolute bottom-4 right-4 text-[9px] font-mono font-bold text-slate-400">
                // active_dataflow.diag
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Industries;
