import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Database, BarChart2, Cpu, Code, Cloud, Shield, ArrowUpRight, Clock, GitMerge, Layers, FileText } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface ServiceDetail {
  id: string;
  name: string;
  desc: string; // Business Challenge
  businessValue: string;
  technicalOverview: string; // Our Solution
  benefits: string[];
  tech: string[];
  architectureDesc: string;
  process: string[];
  deliverables: string[];
  outcomes: string[];
  timeline: string;
  icon: React.ReactNode;
}

export const Services: React.FC = () => {
  const { showToast } = useToast();
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  const servicesList: ServiceDetail[] = [
    {
      id: 'data-strategy',
      name: 'Data Strategy & Advisory',
      desc: 'Organizations struggle to align their technical data pipelines with high-level corporate growth goals, resulting in fragmented storage tools and lost strategic value.',
      businessValue: 'Establishes clear metrics framework and maps data value streams to cut infrastructure spends by up to 25%.',
      technicalOverview: 'We assess operational data maturity gaps, construct clear technical roadmaps, and configure target operating models for enterprise stakeholders.',
      benefits: ['Business-IT operational alignment', 'Consolidated tool footprints', 'Maturity gaps analysis reports'],
      tech: ['Maturity Matrices', 'Value Stream Maps', 'Strategic Playbooks'],
      architectureDesc: 'Strategic frameworks mapping executive key performance indicators directly to distributed ingestion assets.',
      process: ['Maturity Assessment', 'Stakeholder Mapping', 'Gap Analysis', 'Strategic Blueprinting'],
      deliverables: ['Target Operating Model blueprint', 'Data capability matrix', 'Consolidated tooling plan'],
      outcomes: ['Defined ownership guidelines', 'Strategic multi-year investment plans', 'Accelerated decision structures'],
      timeline: '4 - 6 Weeks Assessment',
      icon: <FileText className="h-6 w-6 text-secondary animate-pulse" />
    },
    {
      id: 'data-architecture',
      name: 'Enterprise Data Architecture',
      desc: 'Legacy databases create rigid data silos that fail under high concurrent query loads and block modern real-time application pipelines.',
      businessValue: 'Improves distributed query latency thresholds and decouples computing layers to prevent database locking.',
      technicalOverview: 'We design unified semantic schemas, multi-hop lakehouse structures (Bronze-Silver-Gold), and scalable partition indexes.',
      benefits: ['Sub-second reporting lookups', 'Dynamic computing isolation pools', 'High schema structure flexibility'],
      tech: ['Snowflake', 'Databricks Delta Lake', 'dbt', 'ER Studio'],
      architectureDesc: 'Decoupled multi-cloud storage networks employing columnar formats and automated compute auto-scaling thresholds.',
      process: ['Schema Integrity Auditing', 'Lakehouse Model Design', 'Indexing optimizations', 'Load validation trials'],
      deliverables: ['Semantic layer schemas', 'Partition index code templates', 'Data architecture blueprint'],
      outcomes: ['Reduced read/write conflict rates', 'Lower data scanning costs', 'Robust database load recovery'],
      timeline: '6 - 8 Weeks Blueprint',
      icon: <Layers className="h-6 w-6 text-accent" />
    },
    {
      id: 'data-engineering',
      name: 'Data Engineering & ETL',
      desc: 'Manual file transfers and slow batches cause critical pipeline delays, leading to stale telemetry and missed alert signals.',
      businessValue: 'Transforms overnight processing into real-time streams, reducing sync latency from hours to milliseconds.',
      technicalOverview: 'We construct high-availability Apache Spark ingestion scripts, automated Airflow DAG paths, and streaming Kafka queues.',
      benefits: ['Continuous streaming pipelines', 'Fault-tolerant ingestion networks', 'Self-healing worker nodes configurations'],
      tech: ['Apache Spark', 'Apache Airflow', 'Kafka', 'Python'],
      architectureDesc: 'Multi-AZ Kubernetes worker node clusters handling stream ingestions decoupled from storage targets via buffering layers.',
      process: ['Ingestion source mapping', 'ETL pipeline coding', 'Orchestration setup', 'Stress validation test'],
      deliverables: ['Production Airflow DAG files', 'Spark deployment helm configs', 'Ingestion scaling codes'],
      outcomes: ['Zero-downtime ledger ingestion runs', 'Auto-recovery on network timeout checks', 'Standardized source file conversions'],
      timeline: '8 - 10 Weeks Integration',
      icon: <Database className="h-6 w-6 text-indigo-500" />
    },
    {
      id: 'data-governance',
      name: 'Data Governance & Risk Management',
      desc: 'Lack of tracking ownership results in poor data quality, compliance drift risks, and high vulnerability to regulatory penalties.',
      businessValue: 'Protects business integrity, limits legal liability risks, and aligns storage models with privacy best practices.',
      technicalOverview: 'We deploy automated data catalog catalogs, assign clear data stewardship guidelines, and configure audit logging networks.',
      benefits: ['Automatic data lineage discovery', 'Enforced encryption policies', 'Stewardship responsibility maps'],
      tech: ['Collibra', 'Apache Atlas', 'AWS Lake Formation', 'IAM Controls'],
      architectureDesc: 'Role-based access architectures leveraging automated column-level mask policies and auditing logs.',
      process: ['Privacy policy auditing', 'Catalog registry integration', 'IAM authorization setup', 'Audit verification test'],
      deliverables: ['Data Catalog configuration scripts', 'Data lineage flow charts', 'Role governance guidelines'],
      outcomes: ['Hardened access credentials setup', 'Clean, searchable data directory', 'Zero unmapped databases in staging'],
      timeline: '5 - 7 Weeks Setup',
      icon: <Shield className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'data-integration',
      name: 'Enterprise Data Integration',
      desc: 'Fragmented SaaS platforms and legacy ERP systems fail to sync client telemetry, creating conflicting operational dashboards.',
      businessValue: 'Unifies client datasets to establish a single operational truth, preventing billing and sales coordination mistakes.',
      technicalOverview: 'We design high-frequency webhooks, robust REST/gRPC API bridges, and standardized CDC replication pipelines.',
      benefits: ['Unified system sync pipelines', 'Sub-minute platform sync margins', 'Consolidated client profiles schema'],
      tech: ['MuleSoft', 'gRPC APIs', 'Fivetran', 'AWS Lambda'],
      architectureDesc: 'Event-driven serverless synchronization layers utilizing Kafka brokers to queue platform updates.',
      process: ['API capability mappings', 'Integration gateway coding', 'CDC trigger activations', 'Data validation checks'],
      deliverables: ['Custom API gateway codes', 'Fivetran connector configurations', 'Data mapping schemas'],
      outcomes: ['Synchronized multi-platform accounts', 'Reduced manual sync efforts', 'Instant account update alerts'],
      timeline: '6 - 8 Weeks Deployment',
      icon: <GitMerge className="h-6 w-6 text-cyan-500" />
    },
    {
      id: 'bi',
      name: 'Business Intelligence & BI',
      desc: 'Business stakeholders struggle to make informed decisions due to slow, manually compiled spreadsheets and stale dashboard views.',
      businessValue: 'Enables interactive visual forecasting, eliminating up to 20 hours of manual report compilation weekly.',
      technicalOverview: 'We deploy enterprise-grade semantic layers, Tableau server caching policies, and clean reporting drill-downs.',
      benefits: ['Interactive revenue tracking dashboards', 'Anomaly alert mail triggers', 'Self-service analytics layers'],
      tech: ['Tableau', 'Power BI', 'SQL Server Analysis', 'dbt semantic layer'],
      architectureDesc: 'Direct-query cached architectures utilizing high-performance memory blocks to bypass database stress.',
      process: ['Goal metrics mapping', 'Semantic model design', 'Dashboard layout design', 'User access checks'],
      deliverables: ['Production dashboard layout configs', 'Drill-down schema parameters', 'Metrics training manual'],
      outcomes: ['Faster executive decision metrics', 'Transparent KPI tracking runs', 'Reduced ad-hoc SQL query load'],
      timeline: '4 - 6 Weeks Dashboarding',
      icon: <BarChart2 className="h-6 w-6 text-red-500" />
    },
    {
      id: 'ai-ml',
      name: 'AI & Machine Learning Consulting',
      desc: 'Organizations cannot scale operations effectively without predictive modeling capabilities, leading to slow classification runs and high manual sorting times.',
      businessValue: 'Automates manual screening tasks to drop customer resolution times by 45% using advanced LLMs.',
      technicalOverview: 'We configure PyTorch model training pipelines, predictive clustering scripts, and custom LLM agent systems.',
      benefits: ['Predictive sorting capability', 'Anomaly detection algorithms', 'Natural language data queries'],
      tech: ['TensorFlow', 'PyTorch', 'Python', 'Hugging Face'],
      architectureDesc: 'GPU-backed inference worker pools exposed via secure REST endpoints under JWT access permissions.',
      process: ['Data tagging & validation', 'Model train iterations', 'Inference pipeline setup', 'A/B drift test evaluations'],
      deliverables: ['Trained model deployment codes', 'Inference deployment Helm plans', 'Model tracking dashboards'],
      outcomes: ['Accurate customer churn predictions', 'Dynamic data categorizations', 'Optimized sorting systems'],
      timeline: '8 - 12 Weeks Deployment',
      icon: <Cpu className="h-6 w-6 text-yellow-500" />
    },
    {
      id: 'cloud-analytics',
      name: 'Cloud Analytics Migration',
      desc: 'On-premises legacy data appliances cause high maintenance overheads, rigid resource sizing, and network performance splits.',
      businessValue: 'Drives cloud elasticity benefits, shrinking total hardware maintenance costs by up to 30%.',
      technicalOverview: 'We engineer secure VPC networks, terraform-backed compute nodes, and zero-downtime data migration scripts.',
      benefits: ['Elastic scaling storage limits', '99.99% system availability paths', 'IaC standardized deployments'],
      tech: ['AWS EMR', 'Azure Synapse', 'Terraform', 'Snowflake'],
      architectureDesc: 'Multi-region VPC clouds deploying secure database replication pipelines (e.g. AWS DMS).',
      process: ['Source appliance audit', 'Target cloud environment coding', 'Database staging syncs', 'Production DNS migration'],
      deliverables: ['Infrastructure Terraform codes', 'Network setup diagrams', 'Migration validation scripts'],
      outcomes: ['Zero-downtime storage cutover', 'Consolidated cloud costs control', 'Hardened database security settings'],
      timeline: '8 - 10 Weeks Transition',
      icon: <Cloud className="h-6 w-6 text-purple-500" />
    },
    {
      id: 'modern-data-platforms',
      name: 'Modern Data Platforms',
      desc: 'Rigid query tools prevent analysts from blending structured records with unstructured logs, creating fractured reports.',
      businessValue: 'Consolidates all unstructured and structured business records under a single governance standard.',
      technicalOverview: 'We deploy open-format lakehouse engines, Delta tables, and secure parquet directory partition layouts.',
      benefits: ['Unified format structures', 'ACID transactions support', 'Flexible schema enforcement'],
      tech: ['Delta Lake', 'Apache Iceberg', 'Trino', 'AWS Athena'],
      architectureDesc: 'Open table format architectures decoupling query engines (Trino) from object storage buckets (S3).',
      process: ['Staging format audits', 'Delta engine installations', 'Partition optimizations', 'Query validation checks'],
      deliverables: ['Trino configuration profiles', 'Data partition script assets', 'Performance benchmark charts'],
      outcomes: ['Faster analytics query execution', 'Consolidated storage standards', 'Lower infrastructure footprints'],
      timeline: '6 - 8 Weeks Implementation',
      icon: <Database className="h-6 w-6 text-pink-500" />
    },
    {
      id: 'digital-transformation',
      name: 'Digital Transformation Consulting',
      desc: 'Traditional industries struggle to navigate digitizations, leading to manual paper-based errors and slower customer deliveries.',
      businessValue: 'Modernizes business procedures to accelerate cycle throughput and grow overall client satisfaction metrics.',
      technicalOverview: 'We consult on customer portal setups, modern API-driven backends, and paperless database operations.',
      benefits: ['Automated operational pipelines', 'Mobile accessibility support', 'Enhanced security validations'],
      tech: ['React.js', 'Go API Backend', 'PostgreSQL', 'Docker'],
      architectureDesc: 'Modern three-tier B2B portal architecture integrating SSO authentications and automated database syncing.',
      process: ['Process value mapping', 'Portal UI prototyping', 'Secure database design', 'Deployment integrations'],
      deliverables: ['Production B2B React code base', 'API route specifications', 'User experience mappings'],
      outcomes: ['High customer portal retention', 'Fully automated ordering workflows', 'Modernized business identity'],
      timeline: '10 - 12 Weeks Execution',
      icon: <Code className="h-6 w-6 text-orange-500" />
    }
  ];

  const handleConsultation = (serviceName: string) => {
    setSelectedService(null);
    showToast(`Request for custom consultation on ${serviceName} logged successfully.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Our Capabilities</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Enterprise Systems & Advisory
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Devolatical Global delivers scalable technical services designed specifically to handle complex data, secure hosting, and modern application development.
        </p>
      </section>

      {/* Services Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesList.map((service) => (
          <Card key={service.id} hoverEffect className="flex flex-col justify-between h-full border border-slate-100 dark:border-slate-800 hover:border-secondary/50 p-6 relative overflow-hidden group">
            {/* Hover border glow animation */}
            <div className="absolute inset-0 border border-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
            
            <div>
              <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg w-fit mb-4 group-hover:scale-105 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2 group-hover:text-secondary transition-colors">
                {service.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                {service.desc}
              </p>
              
              {/* Business Value Highlight on Card */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-dark/40 border-l-2 border-accent rounded-r-lg text-[11px] text-slate-600 dark:text-slate-400">
                <strong>Business Value:</strong> {service.businessValue}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-850/50">
              <span className="text-[10px] font-mono font-semibold text-slate-400 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-slate-450" />
                {service.timeline}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="justify-center group cursor-pointer text-xs"
                onClick={() => setSelectedService(service)}
              >
                <span>Specifications</span>
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </Card>
        ))}
      </section>

      {/* Details Modal */}
      <Modal
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name}
        className="max-w-2xl"
      >
        {selectedService && (
          <div className="space-y-6 text-sm leading-relaxed max-h-[75vh] overflow-y-auto pr-1">
            {/* Business Challenge */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Business Challenge</h4>
              <p className="text-slate-600 dark:text-slate-400">{selectedService.desc}</p>
            </div>

            {/* Our Solution */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Our Solution</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs bg-slate-50 dark:bg-dark/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {selectedService.technicalOverview}
              </p>
            </div>

            {/* Architecture description */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Architecture Model</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">{selectedService.architectureDesc}</p>
            </div>

            {/* Core details mapping grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Process */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Implementation Process</h4>
                <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400">
                  {selectedService.process.map((step, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-4 h-4 rounded-full bg-secondary/10 text-secondary text-[9px] font-bold flex items-center justify-center mr-2 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Key Technologies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedService.tech.map((t, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Outcomes & Deliverables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Active Deliverables</h4>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-450 list-disc list-inside">
                  {selectedService.deliverables.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Expected Outcomes</h4>
                <ul className="space-y-1 text-xs text-slate-650 dark:text-slate-400 list-disc list-inside">
                  {selectedService.outcomes.map((o, idx) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Consultation Actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <Button
                variant="secondary"
                className="flex-grow justify-center cursor-pointer text-xs"
                onClick={() => handleConsultation(selectedService.name)}
              >
                Request Custom Consultation
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer text-xs"
                onClick={() => setSelectedService(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Services;
