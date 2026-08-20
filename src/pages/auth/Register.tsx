import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { useToast } from '../../components/ui/Toast';
import { Building, User, Mail } from 'lucide-react';
import { leadsApi } from '../../api/leads.api';
import { ApiError } from '../../types/api';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [terms, setTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!company.trim()) newErrors.company = 'Company name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Work email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid work email format';
    }

    if (!terms) {
      newErrors.terms = 'You must agree to the Security Charter';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Validation failed. Please correct form entries.', 'error');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await leadsApi.createLead({
        name: name.trim(),
        companyName: company.trim(),
        email: email.trim(),
        source: 'WEBSITE',
        priority: 'HIGH',
        notes: `Workspace access requested via Public Register page for enterprise corporate entity "${company.trim()}".`,
      });

      showToast('Workspace request submitted successfully. Our team will review your inquiry.', 'success');
      navigate('/login');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to submit workspace request. Please try again.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Request Workspace Access
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Provision a secure client partnership dashboard for your enterprise.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            label="Full Representative Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
            className="pl-10"
          />
          <User className="absolute left-3.5 top-4 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            type="text"
            label="Enterprise Corporate Entity"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            error={errors.company}
            required
            className="pl-10"
          />
          <Building className="absolute left-3.5 top-4 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            type="email"
            label="Authorized Work Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            className="pl-10"
          />
          <Mail className="absolute left-3.5 top-4 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex flex-col space-y-1.5">
          <Checkbox
            label="I accept the System Security Charter & Data Privacy Guidelines"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            error={errors.terms}
          />
        </div>

        <Button type="submit" variant="secondary" className="w-full py-3 justify-center" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting Request...' : 'Request Workspace Credentials'}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-4">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-secondary hover:underline">
          Authorize Session
        </Link>
      </div>
    </div>
  );
};
export default Register;
