import React, { useState, useEffect, useCallback } from 'react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usersApi } from '../../api/users.api';
import { authApi } from '../../api/auth.api';
import type { UserProfile } from '../../types/user';
import { ApiError } from '../../types/api';
import {
  User,
  ShieldCheck,
  Lock,
  Sun,
  Moon,
  Save,
  Key,
} from 'lucide-react';

export const EmployeeProfile: React.FC = () => {
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

  // Notification Preferences State
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [taskAssignments, setTaskAssignments] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, prefRes] = await Promise.allSettled([
        usersApi.getMyProfile(),
        usersApi.getMyPreferences(),
      ]);

      if (res.status === 'fulfilled' && res.value?.data) {
        setProfile(res.value.data);
        setFirstName(res.value.data.firstName || '');
        setLastName(res.value.data.lastName || '');
        setDisplayName(res.value.data.displayName || '');
        setPhone(res.value.data.phone || '');
      }

      if (prefRes.status === 'fulfilled' && prefRes.value?.data) {
        setEmailAlerts(prefRes.value.data.emailNotifications ?? true);
        setTaskAssignments(prefRes.value.data.pushNotifications ?? true);
      }
    } catch {
      // Fallback to authUser context
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

  const handleToggleEmailAlerts = async (val: boolean) => {
    setEmailAlerts(val);
    try {
      await usersApi.updateMyPreferences({ emailNotifications: val });
      showToast('Notification preference updated in database.', 'success');
    } catch {
      showToast('Failed to save preference to server.', 'error');
    }
  };

  const handleToggleTaskAssignments = async (val: boolean) => {
    setTaskAssignments(val);
    try {
      await usersApi.updateMyPreferences({ pushNotifications: val });
      showToast('Push notification preference updated in database.', 'success');
    } catch {
      showToast('Failed to save preference to server.', 'error');
    }
  };


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
      showToast('Personal information updated successfully.', 'success');
    } catch (err: unknown) {
      const message = ApiError.isApiError(err)
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update profile information.';
      showToast(message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please enter your current password and new password.', 'error');
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

      showToast('Security password successfully changed.', 'success');
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
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Account & Security Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your personal details, workspace appearance preferences, and authentication credentials.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Personal Profile Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-secondary" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>
                  Update your contact info displayed across assigned sprint tickets and project directories.
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
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={isSavingProfile}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Work Email Address
                      </label>
                      <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300">
                        {profile?.email || authUser?.email || 'employee@devolatical.com'}
                      </div>
                    </div>
                    <Input
                      label="Phone Number (Optional)"
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
                    {isSavingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password / Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-accent" />
                  <CardTitle>Security & Authentication</CardTitle>
                </div>
                <CardDescription>
                  Update your enterprise password. Must be at least 8 characters with upper/lowercase and symbols.
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

          {/* Right Column: Account Details & Workspace Preferences */}
          <div className="lg:col-span-5 space-y-6">
            {/* Account Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <CardTitle>Account Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-500">Account State</span>
                  <Badge variant="success">Active (Verified)</Badge>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-500">Assigned Role</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile?.roles?.map((r) => (typeof r === 'string' ? r : r?.name || r?.code || '')).filter(Boolean).join(', ') || 'Employee'}
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 font-mono">
                  <span className="text-slate-500">User ID</span>
                  <span className="text-slate-400 truncate max-w-[160px]">
                    {profile?.id || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Member Since</span>
                  <span className="text-slate-400">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Workspace Preferences</CardTitle>
                <CardDescription>Custom styling and localization for your session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Visual Interface Theme
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

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Default Timezone
                    </span>
                    <span className="text-slate-400 font-mono">Asia/Kolkata (IST +05:30)</span>
                  </div>
                  <Badge variant="outline">UTC +5:30</Badge>
                </div>

                <div className="space-y-3 pt-1">
                  <Switch
                    checked={emailAlerts}
                    onChange={handleToggleEmailAlerts}
                    label="Email notifications for task updates"
                  />
                  <Switch
                    checked={taskAssignments}
                    onChange={handleToggleTaskAssignments}
                    label="Push notifications for new project milestones"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
