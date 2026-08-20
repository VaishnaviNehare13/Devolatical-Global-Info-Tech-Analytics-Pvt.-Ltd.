import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import { authApi } from '../../api/auth.api';
import type { MfaStatusResponseData, MfaSetupResponseData } from '../../types/auth';
import { ApiError } from '../../types/api';
import { ShieldCheck, ShieldAlert, QrCode, CheckCircle2, RefreshCw } from 'lucide-react';


export const MfaSettings: React.FC = () => {
  const { showToast } = useToast();

  const [statusData, setStatusData] = useState<MfaStatusResponseData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  // Enable / Setup Modal State
  const [setupModalOpen, setSetupModalOpen] = useState<boolean>(false);
  const [setupData, setSetupData] = useState<MfaSetupResponseData | null>(null);
  const [isInitiatingSetup, setIsInitiatingSetup] = useState<boolean>(false);
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Disable Modal State
  const [disableModalOpen, setDisableModalOpen] = useState<boolean>(false);
  const [disablePassword, setDisablePassword] = useState<string>('');
  const [disableCode, setDisableCode] = useState<string>('');
  const [isDisabling, setIsDisabling] = useState<boolean>(false);

  const fetchMfaStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await authApi.getMfaStatus();
      if (res.data) {
        setStatusData(res.data);
      }
    } catch {
      setStatusData({ enabled: false, enabledAt: null });
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchMfaStatus();
  }, [fetchMfaStatus]);

  const handleStartSetup = async () => {
    setIsInitiatingSetup(true);
    try {
      const res = await authApi.setupMfa();
      if (res.data) {
        setSetupData(res.data);
        setVerifyCode('');
        setSetupModalOpen(true);
      }
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to initiate MFA setup.';
      showToast(message, 'error');
    } finally {
      setIsInitiatingSetup(false);
    }
  };

  const handleConfirmEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = verifyCode.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      showToast('Please enter a valid 6-digit numeric TOTP code.', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      await authApi.verifyMfa({ code: cleanCode });
      showToast('Two-Factor Authentication successfully enabled on your account.', 'success');
      setSetupModalOpen(false);
      setSetupData(null);
      setVerifyCode('');
      await fetchMfaStatus();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to verify TOTP code. Please check your authenticator app.';
      showToast(message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword.trim() && !disableCode.trim()) {
      showToast('Please provide your current password or a 6-digit TOTP code to disable MFA.', 'error');
      return;
    }

    setIsDisabling(true);
    try {
      await authApi.disableMfa({
        password: disablePassword.trim() || undefined,
        code: disableCode.trim() || undefined,
      });
      showToast('Two-Factor Authentication disabled.', 'info');
      setDisableModalOpen(false);
      setDisablePassword('');
      setDisableCode('');
      await fetchMfaStatus();
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to disable MFA. Please verify your credentials.';
      showToast(message, 'error');
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              <CardTitle>Two-Factor Authentication (MFA)</CardTitle>
            </div>
            {isLoadingStatus ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <Badge variant={statusData?.enabled ? 'success' : 'outline'}>
                {statusData?.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            )}
          </div>
          <CardDescription>
            Add an extra layer of security using Time-based One-Time Passwords (TOTP) from Google Authenticator, Authy, or 1Password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingStatus ? (
            <Skeleton className="h-12 w-full" />
          ) : statusData?.enabled ? (
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>MFA Protection Active</span>
                </div>
                {statusData.enabledAt && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Enabled on {new Date(statusData.enabledAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Your portal account is protected with TOTP authentication. You will be prompted for a 6-digit verification code whenever signing in.
              </p>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDisablePassword('');
                    setDisableCode('');
                    setDisableModalOpen(true);
                  }}
                  className="text-xs text-danger hover:bg-red-50 dark:hover:bg-red-950/30 border-slate-200 dark:border-slate-800"
                >
                  Disable Two-Factor Authentication
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-dark/50 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span>Account Protection Recommendation</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Protect your portal session from unauthorized credential compromise by configuring an authenticator app.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleStartSetup}
                disabled={isInitiatingSetup}
                className="text-xs font-bold"
              >
                {isInitiatingSetup ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Generating Secret...
                  </>
                ) : (
                  <>
                    <QrCode className="h-3.5 w-3.5 mr-1.5" />
                    Enable Two-Factor Authentication
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: MFA Setup & QR Code Verification */}
      <Modal
        isOpen={setupModalOpen}
        onClose={() => {
          setSetupModalOpen(false);
          setSetupData(null);
        }}
        title="Setup Two-Factor Authentication"
      >
        {setupData && (
          <form onSubmit={handleConfirmEnable} className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              Scan the QR code below using your authenticator app (Google Authenticator, Authy, or 1Password).
            </p>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm mx-auto max-w-[220px]">
              <img
                src={setupData.qrCodeUrl}
                alt="MFA QR Code"
                className="h-44 w-44 object-contain"
              />
            </div>

            {/* Manual Entry Secret */}
            <div className="p-3 bg-slate-50 dark:bg-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Manual Setup Key (If QR Scan Unavailable)
              </span>
              <code className="text-xs font-mono font-bold text-secondary break-all block">
                {setupData.secret}
              </code>
            </div>

            {/* 6-Digit Code Verification Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter 6-Digit Code from App
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={isVerifying}
                className="text-center font-mono text-lg tracking-widest font-bold"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSetupModalOpen(false);
                  setSetupData(null);
                }}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={isVerifying || verifyCode.length !== 6}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Enable MFA'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: Disable MFA Confirmation */}
      <Modal
        isOpen={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        title="Disable Two-Factor Authentication"
      >
        <form onSubmit={handleConfirmDisable} className="space-y-4 text-left">
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                Disable Security Safeguard?
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Disabling 2FA reduces account security. Enter your current password or a 6-digit TOTP code to confirm.
              </p>
            </div>
          </div>

          <Input
            type="password"
            label="Current Password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            placeholder="Enter account password"
            disabled={isDisabling}
          />

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              OR
            </span>
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
          </div>

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            label="6-Digit TOTP Code"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            disabled={isDisabling}
            className="font-mono"
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDisableModalOpen(false)}
              disabled={isDisabling}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={isDisabling || (!disablePassword && disableCode.length !== 6)}
            >
              {isDisabling ? 'Disabling...' : 'Confirm Disable MFA'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MfaSettings;
