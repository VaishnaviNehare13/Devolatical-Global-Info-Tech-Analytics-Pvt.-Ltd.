import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Users, GraduationCap, Trophy, MapPin } from 'lucide-react';

interface JobPosition {
  id: string;
  title: string;
  department: 'Data Analytics' | 'IT Infrastructure' | 'Custom Software' | 'Architecture';
  location: string;
  salary: string;
  desc: string;
}

export const Careers: React.FC = () => {
  const { showToast } = useToast();
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  
  // Application form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const positions: JobPosition[] = [
    {
      id: 'job-1',
      title: 'Senior Enterprise Data Architect',
      department: 'Data Analytics',
      location: 'Andheri West, Mumbai (Hybrid / Remote)',
      salary: 'Competitive Enterprise Package',
      desc: 'Architect high-throughput Spark ETL pipelines, Delta Lake lakehouses, and Snowflake data warehouse schemas.'
    },
    {
      id: 'job-2',
      title: 'Principal Cloud Infrastructure Engineer',
      department: 'IT Infrastructure',
      location: 'Andheri West, Mumbai (Hybrid / Remote)',
      salary: 'Competitive Enterprise Package',
      desc: 'Design zero-downtime multi-cloud migration frameworks, Terraform IaC templates, and Kubernetes clusters.'
    },
    {
      id: 'job-3',
      title: 'Senior Custom Software Developer',
      department: 'Custom Software',
      location: 'Andheri West, Mumbai (Hybrid / Remote)',
      salary: 'Competitive Enterprise Package',
      desc: 'Build scalable web applications, REST/gRPC API microservices, and reactive React + TypeScript interfaces.'
    },
    {
      id: 'job-4',
      title: 'Enterprise Solution Architect',
      department: 'Architecture',
      location: 'Andheri West, Mumbai (Hybrid / Remote)',
      salary: 'Competitive Enterprise Package',
      desc: 'Lead strategic technical audits, design end-to-end digital ecosystem blueprints, and govern system security.'
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
      showToast('Validation failed. Please correct form entries.', 'error');
      return;
    }

    setErrors({});
    showToast(`Application submitted successfully for ${selectedJob?.title}! Our team will review your application.`, 'success');
    setSelectedJob(null);
    setFullName('');
    setEmail('');
    setGithub('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-3xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Careers & Talent</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Engineering Culture & Career Growth
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Join Devolatical Global Info-Tech & Analytics Pvt. Ltd. at our Tech Hub in Andheri West, Mumbai. Work on large enterprise projects using modern distributed compute systems and cloud architectures.
        </p>
      </section>

      {/* Engineering Culture Benefits */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/60 pt-12">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Culture & Professional Growth
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-3 bg-secondary/10 text-secondary rounded-lg w-fit mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Collaborative Engineering</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Work alongside senior systems designers and software architects on high-performance codebase repositories.
            </p>
          </Card>
          
          <Card>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg w-fit mb-4">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Continuous Learning</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive fully covered budgets for technical certifications (AWS, Snowflake, Azure, Databricks) and research programs.
            </p>
          </Card>

          <Card>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg w-fit mb-4">
              <Trophy className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Large Enterprise Scale</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Build and deploy systems designed to handle millions of daily telemetry streams and complex workflow automations.
            </p>
          </Card>
        </div>
      </section>

      {/* Recruitment Process */}
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
            <p className="text-xs text-slate-500 leading-relaxed">Evaluation of engineering experience, code cleanliness, and architectural background.</p>
          </div>
          <div className="p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-lg font-bold text-secondary font-mono">02</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Architecture Review</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Design and present an enterprise data or cloud pipeline blueprint during a technical discussion.</p>
          </div>
          <div className="p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-lg font-bold text-secondary font-mono">03</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Team Fit Discussion</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Discuss engineering values, collaboration tools, and continuous learning goals.</p>
          </div>
          <div className="p-5 bg-slate-50/50 dark:bg-dark/10 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-lg font-bold text-secondary font-mono">04</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Finalization</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Fast-track compensation alignment and onboarding scheduling.</p>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/60 pt-12">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Current Open Roles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positions.map((job) => (
            <Card key={job.id} className="flex flex-col justify-between p-6 border border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary" className="text-[9px]">
                    {job.department}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-bold font-mono flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-secondary" />
                    {job.location}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {job.desc}
                </p>
                <span className="text-[10px] font-semibold text-slate-400 block mb-6 font-mono">{job.salary}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center cursor-pointer text-xs font-bold"
                onClick={() => setSelectedJob(job)}
              >
                Apply for Role
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
          <form onSubmit={handleApply} className="space-y-4 text-left">
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
              label="GitHub / Portfolio URL (Optional)"
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
