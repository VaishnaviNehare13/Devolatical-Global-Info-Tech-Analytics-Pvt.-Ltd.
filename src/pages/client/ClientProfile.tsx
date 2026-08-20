import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usersApi } from '../../api/users.api';
import { authApi } from '../../api/auth.api';
import type { UserProfile } from '../../types/user';
import { ApiError } from '../../types/api';
import { MfaSettings } from '../../components/auth/MfaSettings';
import { User, ShieldCheck, Lock, Sun, Moon, Save, Key } from 'lucide-react';

export const ClientProfile: React.FC = () => {
  const { showToast } = useToast();
  const { user: authUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profile Edit State
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.getMyProfile();
      if (res?.data) {
        setProfile(res.data);
        setFirstName(res.data.firstName || '');
        setLastName(res.data.lastName || '');
        setDisplayName(res.data.displayName || '');
        setPhone(res.data.phone || '');
      }
    } catch {
      const fallback = authUser && 'displayName' in authUser ? (authUser as UserProfile) : null;
      if (fallback) {
        setFirstName(fallback.firstName || '');
        setLastName(fallback.lastName || '');
        setDisplayName(fallback.displayName || '');
      }
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await usersApi.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName.trim(),
        phone: phone.trim() || null,
      });

      if (res.data) {
        setProfile(res.data);
      }
      showToast('Client profile updated successfully.', 'success');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update profile details.';
      showToast(message, 'error');
    } finally {
      setIsSavingProfile(false);
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

      showToast('Password changed successfully.', 'success');
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
    <div className="space-y-6 text-left max-w-5xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Account & Profile Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your client profile details, authentication password, and interface preferences.
        </p>
      </div>

      {isLoading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-secondary" />
                  <CardTitle>Organization & Contact Details</CardTitle>
                </div>
                <CardDescription>
                  Update your contact details displayed on project deliverables and support tickets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isSavingProfile}
                    />
                    <Input
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isSavingProfile}
                    />
                  </div>

                  <Input
                    label="Display / Organization Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={isSavingProfile}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Client Account Email
                      </label>
                      <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300">
                        {profile?.email || authUser?.email || 'client@devolatical.com'}
                      </div>
                    </div>
                    <Input
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      disabled={isSavingProfile}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={isSavingProfile}
                    className="w-full justify-center"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {isSavingProfile ? 'Saving Details...' : 'Save Profile Details'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-accent" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                  Update your client portal authentication password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    type="password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={isChangingPassword}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isChangingPassword}
                    className="w-full justify-center"
                  >
                    <Key className="h-4 w-4 mr-1.5" />
                    {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <CardTitle>Client Status & Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Account Status</span>
                  <Badge variant="success">Active (Verified)</Badge>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Access Tier</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Enterprise Portal User
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">User ID</span>
                  <span className="text-slate-400 truncate max-w-[150px]">
                    {profile?.id || '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Theme Preference Card */}
            <Card>
              <CardHeader>
                <CardTitle>Interface Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Display Mode
                    </span>
                    <span className="text-slate-400">
                      Currently using {theme === 'dark' ? 'Dark' : 'Light'} mode
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 mr-1 text-amber-400" /> Light
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-1" /> Dark
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* MFA / 2FA Settings Card */}
            <MfaSettings />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
