import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { useToast } from '../../components/ui/Toast';
import { Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Work email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid work email format';
    }

    if (!password) {
      newErrors.password = 'Authentication password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Security password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Validation failed. Please correct form entries.', 'error');
      return;
    }

    setErrors({});
    
    // Redirect logic: admin@devolatical.com goes to Admin Panel, others go to Client Portal
    if (email.toLowerCase().includes('admin')) {
      showToast('Welcome, Administrator. Authorization verified.', 'success');
      navigate('/admin');
    } else {
      showToast('Welcome back, client partner. Workspace active.', 'success');
      navigate('/portal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Secure Portal Authorization
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter credentials to access your enterprise workspace environment.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <Input
            type="email"
            label="Work Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            className="pl-10"
          />
          <Mail className="absolute left-3.5 top-4 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            type="password"
            label="Security Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            className="pl-10"
          />
          <Lock className="absolute left-3.5 top-4 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember this system"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Link
            to="/maintenance"
            className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="secondary" className="w-full py-3 justify-center">
          Authenticate Credentials
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-4">
        Don't have an enterprise account?{' '}
        <Link to="/register" className="font-semibold text-secondary hover:underline">
          Request Workspace Access
        </Link>
      </div>
    </div>
  );
};
export default Login;
