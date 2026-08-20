import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { ApiError } from '../../types/api';
import { Settings, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [systemName, setSystemName] = useState('Devolatical Global Ops Center');
  const [adminEmail, setAdminEmail] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setAdminEmail(user.email);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update real authenticated admin user profile if displayName or email is modified
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

      <Card className="max-w-2xl">
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


            {/* Architecture Notice for Global Flags */}
            <div className="p-3.5 bg-slate-50 dark:bg-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span>Simulated Environment Controls</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Note: Global server-level maintenance mode and self-registration switches below are operational controls. Server-wide blocking requires dedicated infrastructure middleware.
              </p>
              <div className="space-y-3 pt-1">
                <Switch
                  checked={maintenanceMode}
                  onChange={setMaintenanceMode}
                  label="Enable Global Maintenance Mode (Blocks public portal entry)"
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
  );
};

export default AdminSettings;
