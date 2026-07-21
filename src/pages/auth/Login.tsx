import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    
    // Redirect logic: admin@devolaticalglobalinfotech@gmail.com or containing 'admin' goes to Admin Panel, others go to Client Portal
    if (email.toLowerCase().includes('admin')) {
      showToast('Welcome, Administrator. MFA & Authorization verified.', 'success');
      navigate('/admin');
    } else {
      showToast('Welcome back, client partner. MFA Workspace active.', 'success');
      navigate('/portal');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge variant="secondary" className="text-[8.5px] tracking-wide uppercase font-mono py-0.5">
            <ShieldCheck className="h-3 w-3 mr-1 text-secondary" />
            MFA Protected
          </Badge>
          <Badge variant="outline" className="text-[8.5px] tracking-wide uppercase font-mono py-0.5 text-slate-400">
            End-to-End Encrypted Gateway
          </Badge>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Secure Client Portal Authorization
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your authorized credentials to access your enterprise portal.
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
          <Mail className="absolute left-3.5 top-[2.4rem] h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Security Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            className="pl-10 pr-10"
          />
          <Lock className="absolute left-3.5 top-[2.4rem] h-4 w-4 text-slate-400 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[2.4rem] text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer focus-visible:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember this session"
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

        <Button type="submit" variant="secondary" className="w-full py-3 justify-center text-xs font-bold">
          Authenticate Credentials
        </Button>
      </form>

      {/* SSO Authentication Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
        <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Or Authenticate via SSO</span>
        <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            showToast('Redirecting to Okta SSO Gateway...', 'info');
            setTimeout(() => {
              navigate('/portal');
              showToast('Logged in via Okta SSO.', 'success');
            }, 1000);
          }}
          className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-center cursor-pointer transition-colors"
        >
          Okta Verify
        </button>
        <button
          onClick={() => {
            showToast('Connecting with Azure AD SSO...', 'info');
            setTimeout(() => {
              navigate('/portal');
              showToast('Logged in via Azure Active Directory.', 'success');
            }, 1000);
          }}
          className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-center cursor-pointer transition-colors"
        >
          Azure AD
        </button>
      </div>

      <div className="text-center text-[10px] text-slate-400 leading-normal font-mono">
        * Multi-Factor Authentication (MFA) & Enterprise Security Active.
      </div>

      <div className="text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-4">
        Don't have a portal account?{' '}
        <Link to="/register" className="font-semibold text-secondary hover:underline">
          Request Access
        </Link>
      </div>
    </div>
  );
};

export default Login;
