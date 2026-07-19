import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Users, GraduationCap, Trophy } from 'lucide-react';

interface JobPosition {
  id: string;
  title: string;
  department: 'Consulting' | 'Engineering' | 'Data Science' | 'Security';
  location: string;
  salary: string;
  desc: string;
}

export const Careers: React.FC = () => {
  const { showToast } = useToast();
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  
  // Application fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const positions: JobPosition[] = [
    {
      id: 'job-1',
      title: 'Senior Enterprise Data Architect',
      department: 'Consulting',
      location: 'New York, NY (Hybrid) / Remote',
      salary: '$180,000 - $220,000 + Benefits',
      desc: 'Advise Fortune 500 stakeholders on data strategy. Design high-throughput Delta Lake partitions, Apache Spark ETL paths, and Snowflake migrations.'
    },
    {
      id: 'job-2',
      title: 'Principal Distributed Systems Engineer',
      department: 'Engineering',
      location: 'Mumbai, MH (BKC Office) / Hybrid',
      salary: '₹28,00,000 - ₹38,00,000',
      desc: 'Build secure, compliance-ready streaming ingestion models, orchestrating multi-region Kubernetes clusters and Kafka data streams.'
    },
    {
      id: 'job-3',
      title: 'Decentralized Analytics Lead',
      department: 'Data Science',
      location: 'Remote (US/EU/IN)',
      salary: '$140,000 - $170,000',
      desc: 'Evolve predictive forecasting modeling workflows. Develop client semantic dashboards and deploy scalable PyTorch clusters.'
    },
    {
      id: 'job-4',
      title: 'Security Compliance Consultant',
      department: 'Security',
      location: 'New York, NY (Hybrid)',
      salary: '$160,000 - $190,000',
      desc: 'Lead security audits. Align multi-cloud environments (AWS GovCloud) with PCI-DSS and enterprise security safeguards.'
    }
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName) newErrors.fullName = 'Full name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Validation failed. Please fill required fields.', 'error');
      return;
    }

    setErrors({});
    showToast(`Application submitted successfully for ${selectedJob?.title}! Our HR team will reach out.`, 'success');
    setSelectedJob(null);
    setFullName('');
    setEmail('');
    setGithub('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Careers</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Join Our Consulting Team
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Help leading global organizations navigate complex data landscapes. Work on large enterprise projects using modern distributed compute clusters.
        </p>
      </section>

      {/* Engineering Culture benefits */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/60 pt-12">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Engineering Culture & Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg w-fit mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Global Collaborative Teams</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Work alongside senior systems designers spanning New York and Mumbai hubs on unified codebase repositories.
            </p>
          </Card>
          
          <Card>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg w-fit mb-4">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Continuous Learning</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive fully covered budgets for cloud certifications (AWS, Snowflake, Databricks) and global analytics research forums.
            </p>
          </Card>

          <Card>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg w-fit mb-4">
              <Trophy className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Advanced Enterprise Scale</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deliver architectures handling millions of daily transactions, and help audit core pipeline security controls.
            </p>
          </Card>
        </div>
      </section>

      {/* Application Process */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/60 pt-12">
        <div className="space-y-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">// recruitment_pipeline</span>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Our Recruitment Process
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-lg font-bold text-secondary font-mono">01</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Technical Review</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Initial review of portfolio code structures and previous distributed project experiences.</p>
          </div>
          <div className="p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-lg font-bold text-secondary font-mono">02</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Architecture Case</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Design and present an auto-scaling data ingestion system blueprint to our advisory architects.</p>
          </div>
          <div className="p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-lg font-bold text-secondary font-mono">03</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Culture Fit</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Discuss engineering leadership, learning objectives, and collaboration processes.</p>
          </div>
          <div className="p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-lg font-bold text-secondary font-mono">04</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Compensation Match</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Fast review of expectations and immediate finalization of salary package terms.</p>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/60 pt-12">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Current Openings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positions.map((job) => (
            <Card key={job.id} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary" className="text-[9px]">
                    {job.department}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-bold">{job.location}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {job.desc}
                </p>
                <span className="text-[10px] font-semibold text-slate-400 block mb-6">{job.salary}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center cursor-pointer text-xs font-bold"
                onClick={() => setSelectedJob(job)}
              >
                Apply for role
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Application Modal */}
      <Modal
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        title={`Apply: ${selectedJob?.title}`}
      >
        {selectedJob && (
          <form onSubmit={handleApply} className="space-y-4">
            <p className="text-xs text-slate-400 mb-4">{selectedJob.desc}</p>
            
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              required
            />
            <Input
              label="Contact Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />
            <Input
              label="GitHub / LinkedIn URL (Optional)"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex space-x-3">
              <Button type="submit" variant="secondary" className="flex-1 justify-center cursor-pointer text-xs font-bold">
                Submit Application
              </Button>
              <Button variant="outline" className="cursor-pointer text-xs" onClick={() => setSelectedJob(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Careers;
