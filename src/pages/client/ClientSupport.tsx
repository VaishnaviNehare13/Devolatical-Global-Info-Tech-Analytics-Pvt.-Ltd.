import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';

interface TicketRecord {
  id: string;
  subject: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Resolved' | 'Closed';
  updatedAt: string;
}

export const ClientSupport: React.FC = () => {
  const { showToast } = useToast();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');

  const [tickets, setTickets] = useState<TicketRecord[]>([
    { id: 'TCK-4819', subject: 'Snowflake analytics pipeline latency spikes', severity: 'High', status: 'Open', updatedAt: '2026-07-16' },
    { id: 'TCK-3210', subject: 'Establish staging SSO SAML access configurations', severity: 'Medium', status: 'Resolved', updatedAt: '2026-06-12' },
    { id: 'TCK-2104', subject: 'AWS cloud billing export automation adjustments', severity: 'Low', status: 'Closed', updatedAt: '2026-05-01' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      showToast('Subject and Description are required', 'error');
      return;
    }

    const newTicket: TicketRecord = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      severity: severity as any,
      status: 'Open',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setTickets([newTicket, ...tickets]);
    showToast('Support ticket filed successfully. Engineering notified.', 'success');
    setSubject('');
    setDescription('');
  };

  const columns = [
    { key: 'id' as keyof TicketRecord, header: 'Ticket ID' },
    { key: 'subject' as keyof TicketRecord, header: 'Subject Title' },
    {
      key: 'severity' as keyof TicketRecord,
      header: 'Severity',
      render: (row: TicketRecord) => {
        const variants = {
          High: 'danger' as const,
          Medium: 'warning' as const,
          Low: 'outline' as const
        };
        return <Badge variant={variants[row.severity]}>{row.severity}</Badge>;
      }
    },
    {
      key: 'status' as keyof TicketRecord,
      header: 'Status',
      render: (row: TicketRecord) => {
        const variants = {
          Open: 'secondary' as const,
          Resolved: 'success' as const,
          Closed: 'outline' as const
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    },
    { key: 'updatedAt' as keyof TicketRecord, header: 'Last Update' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Support & Helpdesk</h1>
        <p className="text-sm text-slate-500">
          File high-priority support tickets and monitor active developer resolutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket form */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>File Support Ticket</CardTitle>
            <CardDescription>File requests straight to the dev ops queue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ticket Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <TextArea
                label="Error Description / Trace Logs"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Ticket Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                >
                  <option value="High">High (Service Disruption)</option>
                  <option value="Medium">Medium (General Bug/Config)</option>
                  <option value="Low">Low (Inquiry/Request)</option>
                </select>
              </div>
              <Button type="submit" variant="secondary" className="w-full justify-center">
                Submit Support Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tickets Grid */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Support Logs</CardTitle>
            <CardDescription>Active and historical ticket resolutions.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={tickets} searchKey="subject" rowsPerPage={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default ClientSupport;
