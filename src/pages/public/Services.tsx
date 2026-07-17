import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Database, BarChart2, Cpu, Code, Cloud, Shield, ArrowUpRight } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface ServiceDetail {
  id: string;
  name: string;
  desc: string;
  benefits: string[];
  tech: string[];
  deliverables: string[];
  icon: React.ReactNode;
}

export const Services: React.FC = () => {
  const { showToast } = useToast();
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  const servicesList: ServiceDetail[] = [
    {
      id: 'data-analytics',
      name: 'Advanced Data Analytics',
      desc: 'Provision streaming analytics, complex ETL data warehouses, and custom ingestion schema migrations.',
      benefits: ['Reduced processing costs by 30%', '99.9% ingestion pipeline uptime', 'Real-time telemetry syncing'],
      tech: ['Apache Spark', 'Snowflake', 'AWS Kinesis', 'dbt'],
      deliverables: ['Custom ingestion scripts', 'ETL flow configurations', 'Data catalog mappings'],
      icon: <Database className="h-6 w-6 text-secondary" />
    },
    {
      id: 'bi',
      name: 'Business Intelligence',
      desc: 'Formulate responsive corporate analytics panels, KPI tracking sheets, and automated report feeds.',
      benefits: ['Consolidated data views', 'Eliminated manually compiled reports', 'Actionable executive insights'],
      tech: ['Tableau', 'Power BI', 'Metabase', 'SQL Server'],
      deliverables: ['Interactive dashboard pages', 'Automated email alerts', 'Custom query views'],
      icon: <BarChart2 className="h-6 w-6 text-accent" />
    },
    {
      id: 'ai-ml',
      name: 'AI & Machine Learning',
      desc: 'Deploy custom predictive modelling engines, classification systems, and natural language structures.',
      benefits: ['Automated support ticket routing', 'Enhanced prediction accuracies', 'Optimized client workflows'],
      tech: ['TensorFlow', 'PyTorch', 'Python', 'OpenAI APIs'],
      deliverables: ['Trained ML models', 'RESTful inference API endpoints', 'Model audit papers'],
      icon: <Cpu className="h-6 w-6 text-indigo-500" />
    },
    {
      id: 'custom-software',
      name: 'Custom Software Development',
      desc: 'Design modular microservices architectures, robust database layers, and premium client portals.',
      benefits: ['Complete ownership of source code', 'Highly customizable operations', 'Uncapped scalability'],
      tech: ['React.js', 'Node.js', 'Go', 'PostgreSQL'],
      deliverables: ['Clean GitHub repositories', 'Deployment Dockerfiles', 'RESTful API catalogs'],
      icon: <Code className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'cloud',
      name: 'Cloud Infrastructure & Migration',
      desc: 'Kubernetes environment setup, multi-cloud hosting configurations, and serverless architectures.',
      benefits: ['Zero-downtime migrations', 'Automatic server scaling parameters', 'Standardized configurations'],
      tech: ['AWS', 'Terraform', 'Kubernetes', 'Docker'],
      deliverables: ['Infrastructure as Code (IaC) files', 'K8s cluster configurations', 'Cost optimization reports'],
      icon: <Cloud className="h-6 w-6 text-cyan-500" />
    },
    {
      id: 'cybersec',
      name: 'Cyber Security & Auditing',
      desc: 'Penetration testing evaluations, network threat tracking systems, and SOC 2 compliance readiness.',
      benefits: ['Identified security vulnerabilities', 'Secured sensitive client information', 'Full regulatory alignments'],
      tech: ['Wazuh', 'Kali Linux', 'Auth0', 'Cloudflare WAF'],
      deliverables: ['Vulnerability assessment reports', 'SSO/SAML configs', 'Audit readiness checklist'],
      icon: <Shield className="h-6 w-6 text-red-500" />
    }
  ];

  const handleConsultation = (serviceName: string) => {
    setSelectedService(null);
    showToast(`Inquiry request received for ${serviceName}. Booking calendars sent.`, 'success');
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
          <Card key={service.id} hoverEffect className="flex flex-col justify-between h-full">
            <div>
              <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg w-fit mb-4">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {service.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                {service.desc}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center group mt-auto cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              <span>Learn Specifications</span>
              <ArrowUpRight className="ml-2 h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Card>
        ))}
      </section>

      {/* Details Modal */}
      <Modal
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name}
      >
        {selectedService && (
          <div className="space-y-6 text-sm">
            <p className="text-slate-500 leading-relaxed">{selectedService.desc}</p>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Benefits */}
              <div>
                <h4 className="font-bold text-slate-850 dark:text-white mb-2 uppercase tracking-wide text-xs">
                  Key Benefits
                </h4>
                <ul className="space-y-1 text-xs text-slate-500 list-disc list-inside">
                  {selectedService.benefits.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div>
                <h4 className="font-bold text-slate-850 dark:text-white mb-2 uppercase tracking-wide text-xs">
                  Supported Stack
                </h4>
                <ul className="space-y-1 text-xs text-slate-500 list-disc list-inside">
                  {selectedService.tech.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <h4 className="font-bold text-slate-850 dark:text-white mb-2 uppercase tracking-wide text-xs">
                Active Deliverables
              </h4>
              <ul className="space-y-1 text-xs text-slate-500 list-disc list-inside">
                {selectedService.deliverables.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Footer CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex space-x-3">
              <Button
                variant="secondary"
                className="flex-1 justify-center cursor-pointer"
                onClick={() => handleConsultation(selectedService.name)}
              >
                Request Custom Consultation
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer"
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
