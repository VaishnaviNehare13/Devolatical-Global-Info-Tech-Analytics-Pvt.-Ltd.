import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { HeartPulse, Landmark, ShoppingBag, Factory, GraduationCap, Truck } from 'lucide-react';

interface IndustryItem {
  name: string;
  desc: string;
  solutions: string[];
  compliance: string[];
  icon: React.ReactNode;
}

export const Industries: React.FC = () => {
  const industriesList: IndustryItem[] = [
    {
      name: 'Healthcare & Life Sciences',
      desc: 'Deploy secure medical records storage layers, streaming IoT health telemetry ingestors, and patient tracking views.',
      solutions: ['HL7/FHIR Ingestion Pipelines', 'Patient Telemetry Dashboards', 'Predictive Diagnostics Engines'],
      compliance: ['HIPAA Compliant', 'HITECH Standard'],
      icon: <HeartPulse className="h-6 w-6 text-red-500" />
    },
    {
      name: 'Finance & Asset Management',
      desc: 'Integrate real-time transaction ledger monitors, fraud prediction algorithms, and portfolio auditing systems.',
      solutions: ['Fraud Telemetry Analyzers', 'Real-time Risk Dashboards', 'Algorithmic Arbitrage Feeds'],
      compliance: ['PCI-DSS Level 1', 'SOX Audited'],
      icon: <Landmark className="h-6 w-6 text-secondary" />
    },
    {
      name: 'Retail & E-commerce',
      desc: 'Design automated demand prediction engines, clickstream collection pipelines, and personalized recommendations systems.',
      solutions: ['Clickstream Event Trackers', 'Predictive Invoicing Pipelines', 'Dynamic Pricing Engines'],
      compliance: ['GDPR Compliant', 'CCPA Compliant'],
      icon: <ShoppingBag className="h-6 w-6 text-accent" />
    },
    {
      name: 'Manufacturing & Supply Chain',
      desc: 'Deploy active machine sensor tracking nodes, predictive maintenance triggers, and logistics fleet mapping logs.',
      solutions: ['Predictive Maintenance Triggers', 'Fleet Location Maps', 'Supply Chain Ingestors'],
      compliance: ['ISO 9001 Alignment', 'SOC 2 Verified'],
      icon: <Factory className="h-6 w-6 text-indigo-500" />
    },
    {
      name: 'Education & EdTech',
      desc: 'Provide student metric trackers, virtual learning management databases, and analytics dashboards.',
      solutions: ['Student Performance Analytics', 'Virtual Ingestion Dashboards', 'LMS Data Connectors'],
      compliance: ['FERPA Compliant', 'COPPA Compliant'],
      icon: <GraduationCap className="h-6 w-6 text-amber-500" />
    },
    {
      name: 'Logistics & Distribution',
      desc: 'Deploy real-time fleet GPS ingestors, cost optimization planners, and route planning dashboards.',
      solutions: ['GPS IoT Telemetry Hubs', 'Route Cost Optimizers', 'Warehouse Ingest Trackers'],
      compliance: ['DOT Regulatory Standards', 'ISO 27001'],
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
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {industriesList.map((ind) => (
          <Card key={ind.name} hoverEffect className="p-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg">
                    {ind.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-white leading-none">
                    {ind.name}
                  </h3>
                </div>
                <div className="flex space-x-1.5">
                  {ind.compliance.map((c, idx) => (
                    <Badge key={idx} variant="success" className="text-[9px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed">
                {ind.desc}
              </p>

              {/* Solutions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Deployments
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {ind.solutions.map((sol, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2 flex-shrink-0" />
                      <span>{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};
export default Industries;
