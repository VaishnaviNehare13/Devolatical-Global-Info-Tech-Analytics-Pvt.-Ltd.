import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Users, GraduationCap, Trophy, MapPin, Loader2, Upload, FileText } from 'lucide-react';
import { careersApi } from '../../api/careers.api';
import type { Job } from '../../api/careers.api';

export const Careers: React.FC = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Application form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [github, setGithub] = useState('');
  const [coverMessage, setCoverMessage] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchActiveJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const res = await careersApi.getPublicJobs();
      if (res.success && res.data.items) {
        setJobs(res.data.items);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to load active job postings.', 'error');
    } finally {
      setIsLoadingJobs(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchActiveJobs();
  }, [fetchActiveJobs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: 'Resume size must be less than 5MB' }));
        showToast('Resume file size exceeds maximum 5MB limit.', 'error');
        return;
      }
      setErrors((prev) => ({ ...prev, resume: '' }));
      setResumeFile(file);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
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
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('applicantName', fullName.trim());
      formData.append('email', email.trim());
      if (phone.trim()) formData.append('phone', phone.trim());
      if (github.trim()) formData.append('portfolioUrl', github.trim());
      if (coverMessage.trim()) formData.append('coverMessage', coverMessage.trim());
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await careersApi.submitApplication(selectedJob.id, formData);
      if (res.success) {
        showToast(`Application submitted successfully for ${selectedJob.title}! Our talent acquisition team will review your details.`, 'success');
        setSelectedJob(null);
        setFullName('');
        setEmail('');
        setPhone('');
        setGithub('');
        setCoverMessage('');
        setResumeFile(null);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit job application. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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

        {isLoadingJobs ? (
          <div className="py-12 text-center text-slate-400 flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            <span className="text-sm">Fetching active engineering opportunities...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50 dark:bg-dark/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium">No open job positions at this moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
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
                    {job.description}
                  </p>
                  {job.salaryRange && (
                    <span className="text-[10px] font-semibold text-slate-400 block mb-6 font-mono">{job.salaryRange}</span>
                  )}
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
        )}
      </section>

      {/* Application Modal */}
      <Modal
        isOpen={selectedJob !== null}
        onClose={() => !isSubmitting && setSelectedJob(null)}
        title={`Apply: ${selectedJob?.title}`}
      >
        {selectedJob && (
          <form onSubmit={handleApply} className="space-y-4 text-left">
            <p className="text-xs text-slate-400 mb-4">{selectedJob.description}</p>
            
            <Input
              label="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Contact Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              label="GitHub / Portfolio URL (Optional)"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              disabled={isSubmitting}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Attach Resume / CV (.pdf, .doc, .docx - Max 5MB)
              </label>
              <div className="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-3 text-center bg-slate-50/50 dark:bg-dark/10">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                  {resumeFile ? (
                    <>
                      <FileText className="h-4 w-4 text-secondary" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{resumeFile.name}</span>
                      <span className="text-[10px]">({(resumeFile.size / 1024).toFixed(0)} KB)</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-slate-400" />
                      <span>Click to select PDF or Word document</span>
                    </>
                  )}
                </div>
              </div>
              {errors.resume && <p className="text-xs text-red-500 mt-1">{errors.resume}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cover Note / Message (Optional)
              </label>
              <textarea
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary/50 focus:outline-none"
                placeholder="Share relevant engineering projects or background..."
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex space-x-3">
              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                className="flex-1 justify-center cursor-pointer text-xs font-bold flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
              <Button
                variant="outline"
                disabled={isSubmitting}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedJob(null)}
              >
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
