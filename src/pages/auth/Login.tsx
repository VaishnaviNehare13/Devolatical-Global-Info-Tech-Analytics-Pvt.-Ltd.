import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { ApiError } from '../../types/api';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 2-Step MFA Login States
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA'>('CREDENTIALS');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  
  const { login, verifyMfaLogin, clearMfaChallenge } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
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
    setIsSubmitting(true);

    try {
      const res = await login({ email, password });
      if (res.mfaRequired) {
        setStep('MFA');
        showToast('Two-Factor Authentication required. Enter code from your app.', 'info');
      } else if (res.destination) {
        showToast('Authentication successful. Access granted.', 'success');
        navigate(res.destination, { replace: true });
      }
    } catch (err: unknown) {
      const errorMessage =
        ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify your credentials.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = mfaCode.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setMfaError('Please enter a valid 6-digit numeric verification code.');
      showToast('Invalid TOTP code format. Must be 6 digits.', 'error');
      return;
    }

    setMfaError(null);
    setIsVerifyingMfa(true);

    try {
      const { destination } = await verifyMfaLogin(cleanCode);
      showToast('MFA verification successful. Access granted.', 'success');
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const message =
        ApiError.isApiError(err)
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Invalid or expired 6-digit code. Please check your app.';
      setMfaError(message);
      showToast(message, 'error');
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const handleBackToCredentials = () => {
    clearMfaChallenge();
    setStep('CREDENTIALS');
    setMfaCode('');
    setMfaError(null);
  };

  const handleSsoNotice = (provider: string) => {
    showToast(`${provider} SSO authentication is managed by your enterprise administrator.`, 'info');
  };

  return (
    <div className="space-y-6 text-left">
      {step === 'CREDENTIALS' ? (
        <>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="secondary" className="text-[8.5px] tracking-wide uppercase font-mono py-0.5">
                <ShieldCheck className="h-3 w-3 mr-1 text-secondary" />
                Enterprise RBAC
              </Badge>
              <Badge variant="outline" className="text-[8.5px] tracking-wide uppercase font-mono py-0.5 text-slate-400">
                End-to-End Encrypted Gateway
              </Badge>
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Secure Portal Authorization
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your verified enterprise credentials to access your portal.
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                required
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3.5 top-[2.4rem] h-4 w-4 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <Link
                to="/maintenance"
                className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
              className="w-full py-3 justify-center text-xs font-bold"
            >
              {isSubmitting ? 'Authenticating Credentials...' : 'Authenticate Credentials'}
            </Button>
          </form>

          {/* SSO Authentication Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Enterprise SSO
            </span>
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSsoNotice('Okta Verify')}
              disabled={isSubmitting}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-center cursor-pointer transition-colors"
            >
              Okta Verify
            </button>
            <button
              type="button"
              onClick={() => handleSsoNotice('Azure AD')}
              disabled={isSubmitting}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-center cursor-pointer transition-colors"
            >
              Azure AD
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-400 leading-normal font-mono">
            * Role-Based Access Control (RBAC) & Enterprise Security Active.
          </div>

          <div className="text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-4">
            Don't have a portal account?{' '}
            <Link to="/register" className="font-semibold text-secondary hover:underline">
              Request Access
            </Link>
          </div>
        </>
      ) : (
        /* STEP 2: MFA Verification Challenge Screen */
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[8.5px] tracking-wide uppercase font-mono py-0.5">
                <KeyRound className="h-3 w-3 mr-1 text-secondary" />
                Step 2 of 2
              </Badge>
              <Badge variant="outline" className="text-[8.5px] tracking-wide uppercase font-mono py-0.5 text-emerald-500">
                2FA Protected Account
              </Badge>
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Two-Factor Authentication
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the 6-digit security code from your authenticator app (Google Authenticator, Authy, etc.).
            </p>
          </div>

          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                6-Digit Security Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={mfaCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setMfaCode(val);
                  setMfaError(null);
                }}
                error={mfaError || undefined}
                disabled={isVerifyingMfa}
                autoFocus
                required
                className="text-center font-mono text-xl tracking-widest font-bold py-3"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              disabled={isVerifyingMfa || mfaCode.length !== 6}
              className="w-full py-3 justify-center text-xs font-bold"
            >
              {isVerifyingMfa ? 'Verifying Security Code...' : 'Verify Code & Sign In'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleBackToCredentials}
              disabled={isVerifyingMfa}
              className="w-full py-2.5 justify-center text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Credentials Sign-In
            </Button>
          </form>

          <div className="p-3 bg-slate-50 dark:bg-dark/50 border border-slate-200/80 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 leading-relaxed font-mono">
            💡 Having trouble? Ensure your device time is synchronized with network standard time.
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
