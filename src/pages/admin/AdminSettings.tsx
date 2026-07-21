import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { useToast } from '../../components/ui/Toast';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [systemName, setSystemName] = useState('Devolatical Global Ops Center');
  const [adminEmail, setAdminEmail] = useState('devolaticalglobalinfotech@gmail.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Global settings updated and sync\'d across active clusters.', 'success');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Global System Settings</h1>
        <p className="text-sm text-slate-500">
          Modify core environment naming, maintenance thresholds, and portal registry features.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>Adjust variables that impact server operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <Input
              label="Ops Environment System Name"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              required
            />
            <Input
              label="Primary Operations Mailing Address"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col space-y-4">
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

            <Button type="submit" variant="secondary" className="w-full justify-center text-xs font-bold">
              Apply System Configurations
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminSettings;
