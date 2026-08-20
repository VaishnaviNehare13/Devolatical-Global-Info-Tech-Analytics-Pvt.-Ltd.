import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { authApi } from '../../api/auth.api';
import { ApiError } from '../../types/api';
import { MfaSettings } from '../../components/auth/MfaSettings';
import { Settings, ShieldAlert, CheckCircle2, Lock, Key } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [systemName, setSystemName] = useState('Devolatical Global Ops Center');
  const [adminEmail, setAdminEmail] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setAdminEmail(user.email);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user) {
        await usersApi.updateMyProfile({
          displayName: systemName.trim(),
        });
      }
      showToast('Admin profile & workspace preferences saved successfully.', 'success');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update admin preferences.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please enter current password and new password.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      showToast('Admin password changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to change password. Please verify current password.';
      showToast(message, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Global System Settings</h1>
          <Badge variant="outline" className="font-mono text-xs">
            Admin Profile & Environment
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          Modify core environment identity, administrative contact points, and portal workspace features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Settings className="h-5 w-5" />
                <CardTitle>Workspace & Identity Preferences</CardTitle>
              </div>
              <CardDescription>Adjust variables that impact administrator session displays and workspace contact points.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <Input
                  label="Ops Environment System Name"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  required
                />

                <div>
                  <Input
                    label="Primary Operations Mailing Address"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Primary administrator account email from active IAM session.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span>Simulated Environment Controls</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Note: Global server-level maintenance mode and self-registration switches below are operational controls.
                  </p>
                  <div className="space-y-3 pt-1">
                    <Switch
                      checked={maintenanceMode}
                      onChange={setMaintenanceMode}
                      label="Enable Global Maintenance Mode"
                    />
                    <Switch
                      checked={allowRegistration}
                      onChange={setAllowRegistration}
                      label="Allow client self-service workspace registrations"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full justify-center text-xs font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Saving Preferences...'
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Save Admin Preferences
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Admin Change Password Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-accent mb-1">
                <Lock className="h-5 w-5" />
                <CardTitle>Admin Password & Security</CardTitle>
              </div>
              <CardDescription>Update your administrative session password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 text-left">
                <Input
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                />

                <Input
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                />

                <Input
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                />

                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={isChangingPassword}
                  className="w-full justify-center text-xs font-bold"
                >
                  <Key className="h-4 w-4 mr-1.5" />
                  {isChangingPassword ? 'Updating Password...' : 'Update Admin Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* MFA / 2FA Settings Card */}
          <MfaSettings />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
