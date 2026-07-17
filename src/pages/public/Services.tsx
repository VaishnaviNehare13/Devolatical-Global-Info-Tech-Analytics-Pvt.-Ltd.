import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Database, BarChart2, Cpu, Code, Cloud, Shield, ArrowUpRight, Clock } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface ServiceDetail {
  id: string;
  name: string;
  desc: string;
  businessValue: string;
  technicalOverview: string;
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
      id: 'data-analytics',
      name: 'Advanced Data Analytics',
      desc: 'Provision real-time streaming analytics, complex ETL data lakehouses, and high-volume ingestion schemas.',
      businessValue: 'Reduces operational data pipeline costs by 34% on average while increasing insights resolution times.',
      technicalOverview: 'Orchestrates Apache Spark streaming pipelines on auto-scaling compute clusters targeting unified Snowflake and Delta Lake storage systems.',
      benefits: ['Sub-10ms data availability latencies', 'Elimination of connection pooling bottlenecks', 'Fully audited SOC 2 compliant storage'],
      tech: ['Apache Spark', 'Snowflake', 'AWS Kinesis', 'dbt'],
      architectureDesc: 'Decoupled storage and compute layers leveraging multi-AZ AWS clusters with integrated Apache Kafka buffering streams.',
      process: ['Pipeline Ingestion Audit', 'Lakehouse Schema Modeling', 'ETL Cluster Provisioning', 'Telemetry Validation'],
      deliverables: ['Custom ingestion terraform code', 'dbt modeling scripts', 'Real-time performance dashboards'],
      outcomes: ['Near-zero data loss during network splits', 'Automated partition pruning for faster queries', 'Single source of truth for business reporting'],
      timeline: '4 - 6 Weeks Deployment',
      icon: <Database className="h-6 w-6 text-secondary animate-pulse" />
    },
    {
      id: 'bi',
      name: 'Business Intelligence',
      desc: 'Formulate responsive corporate analytics panels, executive KPI tracking systems, and automated reports.',
      businessValue: 'Eliminates manually compiled reports, freeing up to 20 hours per week for business analysts.',
      technicalOverview: 'Custom BI layer deployments mapping relational databases and Snowflake datastores directly to clean, cached visualizations.',
      benefits: ['Unified data dashboards for operations', 'Automated email alerts on anomaly detection', 'Role-based access controls for security'],
      tech: ['Tableau', 'Power BI', 'Metabase', 'SQL Server'],
      architectureDesc: 'Direct-query architectures utilizing high-performance columnar caching layers to prevent database locks.',
      process: ['Stakeholder Goal Mapping', 'Semantic Layer Design', 'Dashboard Prototyping', 'User Clearance Gate setup'],
      deliverables: ['Responsive dashboard layouts', 'Auto-refresh script configs', 'KPI measurement frameworks'],
      outcomes: ['Real-time visual monitoring of corporate revenue', 'SLA threshold alerts on telemetry indicators', 'Granular visual drill-down controls'],
      timeline: '3 - 5 Weeks Deployment',
      icon: <BarChart2 className="h-6 w-6 text-accent" />
    },
    {
      id: 'ai-ml',
      name: 'AI & Machine Learning',
      desc: 'Deploy custom predictive modeling engines, NLP classification models, and generative intelligence layers.',
      businessValue: 'Automates manual sorting operations to reduce customer ticket response times by 45%.',
      technicalOverview: 'Custom ML model building, training pipelines, and inference API integrations leveraging Kubernetes GPU clusters.',
      benefits: ['Automated predictive classification', 'Anomaly identification on streaming data', 'Real-time natural language query support'],
      tech: ['TensorFlow', 'PyTorch', 'Python', 'OpenAI APIs'],
      architectureDesc: 'Scalable model deployment layers utilizing RESTful API endpoints secured by OAuth 2.0 gates.',
      process: ['Data Labeling & Audit', 'Model Training & Selection', 'API Endpoint Deployment', 'A/B testing trials'],
      deliverables: ['Trained model binary weights', 'Deployment helm charts', 'Model drift warning logs'],
      outcomes: ['Accurate demand forecasting parameters', 'Secured automated decision gates', 'Dynamic NLP query engines'],
      timeline: '8 - 12 Weeks Deployment',
      icon: <Cpu className="h-6 w-6 text-indigo-500" />
    },
    {
      id: 'custom-software',
      name: 'Custom Software Development',
      desc: 'Design modular microservices architectures, secure backend services, and high-fidelity portals.',
      businessValue: 'Provides 100% intellectual property ownership, bypassing restrictive third-party SaaS subscription costs.',
      technicalOverview: 'React/TypeScript applications built alongside scalable Golang/Go backend APIs on PostgreSQL datastores.',
      benefits: ['Total codebase custom tailoring', 'Uncapped user scaling capabilities', 'SOC-2 compliant code security'],
      tech: ['React.js', 'Node.js', 'Go', 'PostgreSQL'],
      architectureDesc: 'Containerized microservices running on AWS Fargate clusters connected via gRPC communication protocols.',
      process: ['UI/UX Design Alignment', 'Microservices API Mapping', 'Granular Code Development', 'Penetrative Audit reviews'],
      deliverables: ['Production ready source repositories', 'Automated CI/CD YAML configurations', 'API documentation catalog'],
      outcomes: ['High-performance responsive portal UI', 'Auto-scaling backend routes', 'Isolated database schemas'],
      timeline: '6 - 10 Weeks Deployment',
      icon: <Code className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'cloud',
      name: 'Cloud Infrastructure & Migration',
      desc: 'Kubernetes environment provisioning, multi-cloud setups, and Infrastructure as Code automation.',
      businessValue: 'Maintains zero-downtime migrations while reducing cloud spending averages by 28%.',
      technicalOverview: 'Terraform-driven configurations to establish secure VPC networks, Kubernetes clusters, and storage buckets.',
      benefits: ['Declarative infrastructure control', '99.99% system availability targets', 'Automated cloud budgeting rules'],
      tech: ['AWS', 'Terraform', 'Kubernetes', 'Docker'],
      architectureDesc: 'Multi-region failover network clusters deploying load balancers and RDS database replications.',
      process: ['Cloud Environment Auditing', 'IaC Blueprint Construction', 'Pilot Stage Migrations', 'Production DNS Shift'],
      deliverables: ['Terraform script repositories', 'Helm package configurations', 'Security network diagrams'],
      outcomes: ['Zero-downtime global cutover', 'Standardized environment configurations', 'Auto-recovery node rules'],
      timeline: '6 - 8 Weeks Deployment',
      icon: <Cloud className="h-6 w-6 text-cyan-500" />
    },
    {
      id: 'cybersec',
      name: 'Cyber Security & Auditing',
      desc: 'Active penetration testing, compliance preparedness audits, and network protection panels.',
      businessValue: 'Prevents security breach exposures and readies companies for SOC 2 Type II audits quickly.',
      technicalOverview: 'Network firewall inspections, SSO/SAML integrations, vulnerability logs, and encryption audits.',
      benefits: ['Identified security vulnerabilities', 'Fully encrypted sensitive client database', 'Active network defense controls'],
      tech: ['Wazuh', 'Kali Linux', 'Auth0', 'Cloudflare WAF'],
      architectureDesc: 'Edge networks utilizing Cloudflare WAF layers alongside containerized intrusion logging systems.',
      process: ['External Pentesting audits', 'IAM Compliance Mapping', 'Security Firewall Setup', 'Employee Security Trainings'],
      deliverables: ['Vulnerability assessment reports', 'Edge configurations blueprints', 'SOC 2 auditing checklist'],
      outcomes: ['Hardened enterprise APIs gates', 'Okta SSO user credentials integrations', 'Real-time threat tracking maps'],
      timeline: '4 - 6 Weeks Deployment',
      icon: <Shield className="h-6 w-6 text-red-500" />
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
          Enterprise Systems Engineering
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
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
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
            {/* Overview */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Overview</h4>
              <p className="text-slate-600 dark:text-slate-400">{selectedService.desc}</p>
            </div>

            {/* Technical Scope */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Technical Execution</h4>
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
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Supported Stack</h4>
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
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-450 list-disc list-inside">
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
