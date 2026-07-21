import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Shield, Key, AlertTriangle } from 'lucide-react';

export const AdminSecurity: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Security & Access Gates</h1>
        <p className="text-sm text-slate-500">
          Verify SSO configurations, cryptographic keys, and firewall threat statistics.
        </p>
      </div>

      {/* Security Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3 text-secondary mb-4">
            <Shield className="h-6 w-6" />
            <h4 className="font-bold text-slate-800 dark:text-white">Security Infrastructure</h4>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Verify active certificates and security boundaries currently deployed.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">End-to-End Encryption</Badge>
            <Badge variant="success">MFA Protected</Badge>
            <Badge variant="success">Zero-Trust Active</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 text-accent mb-4">
            <Key className="h-6 w-6" />
            <h4 className="font-bold text-slate-800 dark:text-white">SSO / SAML Keys</h4>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Manage corporate identity providers (Okta, Active Directory, PingFederate).
          </p>
          <Badge variant="secondary">3 Active Connections</Badge>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 text-danger mb-4">
            <AlertTriangle className="h-6 w-6" />
            <h4 className="font-bold text-slate-800 dark:text-white">Threat Shield</h4>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Firewall report details blocking 23k malicious request logs today.
          </p>
          <Badge variant="danger">Threat Level: Low</Badge>
        </Card>
      </div>

      {/* Details Box */}
      <Card>
        <CardHeader>
          <CardTitle>Global Cryptographic Parameters</CardTitle>
          <CardDescription>System-wide SSL and hashing details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 font-mono text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">SSL Certificate:</span>
            <span className="text-slate-500 dark:text-slate-400">Let's Encrypt Wildcard (Active)</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 font-mono text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Symmetric Hashing Algorithm:</span>
            <span className="text-slate-500 dark:text-slate-400">AES-256-GCM Hardware-bound</span>
          </div>
          <div className="flex justify-between font-mono text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">IAM Session Timeout:</span>
            <span className="text-slate-500 dark:text-slate-400">15 Minutes Inactive limit</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminSecurity;
