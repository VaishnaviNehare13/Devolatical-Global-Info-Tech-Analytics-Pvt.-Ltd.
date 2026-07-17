import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Heart, Coffee, Cpu } from 'lucide-react';

interface JobPosition {
  id: string;
  title: string;
  department: 'Engineering' | 'Data Science' | 'Product' | 'Security';
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
      title: 'Senior Distributed Systems Architect',
      department: 'Engineering',
      location: 'New York, NY (Hybrid) / Remote',
      salary: '$180,000 - $220,000 + Equity',
      desc: 'Orchestrate high-throughput stream ingestion platforms using Apache Spark, Kafka, and Kubernetes integrations.'
    },
    {
      id: 'job-2',
      title: 'Principal Data Engineer',
      department: 'Data Science',
      location: 'Mumbai, MH (BKC Office) / Hybrid',
      salary: '₹28,00,000 - ₹38,00,000 + Equity',
      desc: 'Build secure, SOC 2 compliant ETL schemas, Snowflake ingestion models, and dbt analytics pipelines.'
    },
    {
      id: 'job-3',
      title: 'SaaS Frontend Architect',
      department: 'Engineering',
      location: 'Remote (US/EU/IN)',
      salary: '$140,000 - $170,000 + Equity',
      desc: 'Lead engineering for our Client Portal and Admin Dashboard UIs using React, TypeScript, and Tailwind CSS.'
    },
    {
      id: 'job-4',
      title: 'Cloud Security Pentester',
      department: 'Security',
      location: 'New York, NY (Hybrid)',
      salary: '$160,000 - $190,000',
      desc: 'Evaluate cloud network layers, run automated auditing reports, and design WAF configurations.'
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
          Build the Future of Analytics
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Join our global engineering team building multi-million-dollar technology ecosystems. We offer robust benefits, high scaling potentials, and cutting-edge projects.
        </p>
      </section>

      {/* Benefits */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Why Engineers Join Devolatical Global
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg w-fit mb-4">
              <Heart className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Premium Healthcare</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete medical, dental, and vision insurance policies covering employee dependents.
            </p>
          </Card>
          
          <Card>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg w-fit mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Latest Tech Gears</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Work with top-tier Apple Macbook Pro models, premium monitors, and custom home office setup budgets.
            </p>
          </Card>

          <Card>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg w-fit mb-4">
              <Coffee className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Continuous Learning</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Uncapped budgets for technical conferences, AWS/Snowflake certifications, and academic training programs.
            </p>
          </Card>
        </div>
      </section>

      {/* Open Positions */}
      <section className="space-y-8">
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
                className="w-full justify-center cursor-pointer"
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
              label="GitHub Profile URL (Optional)"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex space-x-3">
              <Button type="submit" variant="secondary" className="flex-1 justify-center cursor-pointer">
                Submit Application
              </Button>
              <Button variant="outline" className="cursor-pointer" onClick={() => setSelectedJob(null)}>
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
