import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { HeartPulse, Landmark, ShoppingBag, Factory, Truck } from 'lucide-react';

interface IndustryItem {
  id: string;
  name: string;
  desc: string;
  solutions: string[];
  compliance: string[];
  metrics: string;
  deploymentExample: string;
  tech: string[];
  icon: React.ReactNode;
}

export const Industries: React.FC = () => {
  const industriesList: IndustryItem[] = [
    {
      id: 'healthcare',
      name: 'Healthcare & Life Sciences',
      desc: 'Deploy secure medical records storage layers, streaming IoT health telemetry ingestors, and patient tracking portals.',
      solutions: ['HL7/FHIR Ingestion Pipelines', 'Patient Telemetry Dashboards', 'Predictive Diagnostics Engines'],
      compliance: ['HIPAA Compliant', 'HITECH Standard'],
      metrics: '40% acceleration in diagnostics data exchange speeds',
      deploymentExample: 'FHIR JSON telemetry databases replication across multi-AZ clusters.',
      tech: ['AWS RDS', 'Kafka', 'PostgreSQL', 'Docker'],
      icon: <HeartPulse className="h-6 w-6 text-red-500" />
    },
    {
      id: 'finance',
      name: 'Finance & Asset Management',
      desc: 'Integrate real-time transaction ledger monitors, fraud prediction algorithms, and portfolio auditing systems.',
      solutions: ['Fraud Telemetry Analyzers', 'Real-time Risk Dashboards', 'Algorithmic Arbitrage Feeds'],
      compliance: ['PCI-DSS Level 1', 'SOX Audited'],
      metrics: 'Zero connections locks on peak transaction loads (80k/s)',
      deploymentExample: 'Distributed Kafka buffer feeds syncing transactions directly into Snowflake.',
      tech: ['Snowflake', 'Apache Spark', 'AWS Kinesis', 'Go'],
      icon: <Landmark className="h-6 w-6 text-secondary" />
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      desc: 'Design automated demand prediction engines, clickstream collection pipelines, and personalized recommendations.',
      solutions: ['Clickstream Event Trackers', 'Predictive Invoicing Pipelines', 'Dynamic Pricing Engines'],
      compliance: ['GDPR Compliant', 'CCPA Compliant'],
      metrics: '28% forecasting accuracy improvement, reducing inventory stockout rates to near-zero',
      deploymentExample: 'Real-time visitor telemetry tracking database with automated Metabase charts.',
      tech: ['Python', 'PostgreSQL', 'Metabase', 'Kubernetes'],
      icon: <ShoppingBag className="h-6 w-6 text-accent" />
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Heavy Industry',
      desc: 'Deploy active machine sensor tracking nodes, predictive maintenance alerts, and supply chain telemetry buffers.',
      solutions: ['Predictive Maintenance Triggers', 'Fleet Location Maps', 'Supply Chain Ingestors'],
      compliance: ['ISO 9001 Alignment', 'SOC 2 Ready'],
      metrics: '30% decrease in unexpected assembly line hardware outages',
      deploymentExample: 'Telemetry ingestion scripts running on IoT edge nodes routing to Azure IoT Hub.',
      tech: ['Azure IoT Hub', 'Node.js', 'Wazuh', 'Terraform'],
      icon: <Factory className="h-6 w-6 text-indigo-500" />
    },
    {
      id: 'logistics',
      name: 'Logistics & Distribution',
      desc: 'Establish real-time fleet GPS tracking portals, route cost optimization models, and dispatching pipelines.',
      solutions: ['GPS IoT Telemetry Hubs', 'Route Cost Optimizers', 'Warehouse Ingest Trackers'],
      compliance: ['DOT Regulatory Standards', 'ISO 27001'],
      metrics: '14% savings in monthly fleet routing costs using optimized paths logic',
      deploymentExample: 'GPS location tracking scripts routing spatial telemetry data to PostgreSQL Spatial.',
      tech: ['PostgreSQL Spatial', 'Node.js', 'Docker', 'AWS Fargate'],
      icon: <Truck className="h-6 w-6 text-emerald-500" />
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
          We customize our core analytics frameworks, microservices engines, and security configurations to align perfectly with sector regulations.
        </p>
      </section>

      {/* Industries Grid */}
      <section className="space-y-16">
        {industriesList.map((ind, index) => (
          <div
            key={ind.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pb-12 border-b border-slate-100 dark:border-slate-850/60 ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Left Content (7/12) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg">
                  {ind.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-850 dark:text-white leading-none mb-1">
                    {ind.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {ind.compliance.map((c, idx) => (
                      <Badge key={idx} variant="success" className="text-[9px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed">
                {ind.desc}
              </p>

              {/* Success Metrics and Deployments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-dark/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Success Metric</h4>
                  <p className="text-xs font-semibold text-slate-750 dark:text-slate-350 leading-relaxed">✓ {ind.metrics}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deployment Example</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{ind.deploymentExample}</p>
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry Technology Stack</h4>
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
            <div className="lg:col-span-5 h-64 bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden flex items-center justify-center shadow-card">
              <div className="absolute inset-0 bg-secondary/5 filter blur-3xl pointer-events-none" />
              
              {/* Dynamic SVG mapping depending on industry ID */}
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
