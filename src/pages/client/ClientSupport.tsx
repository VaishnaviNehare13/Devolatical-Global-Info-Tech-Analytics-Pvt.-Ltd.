import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import { clientPortalApi, type ClientTicketItem } from '../../api/client-portal.api';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface TicketRecord {
  id: string;
  subject: string;
  severity: string;
  status: string;
  updatedAt: string;
}

export const ClientSupport: React.FC = () => {
  const { showToast } = useToast();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tickets, setTickets] = useState<ClientTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientPortalApi.getTickets();
      if (res.data) {
        setTickets(res.data);
      }
    } catch {
      setError('Failed to fetch support tickets log.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Subject and Description are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await clientPortalApi.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority: severity.toUpperCase(),
      });

      showToast('Support ticket filed successfully. Engineering notified.', 'success');
      setSubject('');
      setDescription('');
      await fetchTickets();
    } catch (_err: unknown) {
      showToast('Failed to file support ticket. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayData: TicketRecord[] = tickets.map((tck) => ({
    id: tck.id.slice(0, 8).toUpperCase(),
    subject: tck.subject,
    severity: tck.priority || 'MEDIUM',
    status: tck.status || 'OPEN',
    updatedAt: new Date(tck.updatedAt || tck.createdAt).toLocaleDateString(),
  }));

  const columns = [
    { key: 'id' as keyof TicketRecord, header: 'Ticket Ref' },
    { key: 'subject' as keyof TicketRecord, header: 'Subject Title' },
    {
      key: 'severity' as keyof TicketRecord,
      header: 'Severity',
      render: (row: TicketRecord) => {
        const variants: Record<string, 'danger' | 'warning' | 'outline'> = {
          HIGH: 'danger',
          CRITICAL: 'danger',
          High: 'danger',
          MEDIUM: 'warning',
          Medium: 'warning',
          LOW: 'outline',
          Low: 'outline',
        };
        return <Badge variant={variants[row.severity] || 'warning'}>{row.severity}</Badge>;
      },
    },
    {
      key: 'status' as keyof TicketRecord,
      header: 'Status',
      render: (row: TicketRecord) => {
        const variants: Record<string, 'secondary' | 'success' | 'outline'> = {
          OPEN: 'secondary',
          Open: 'secondary',
          RESOLVED: 'success',
          Resolved: 'success',
          CLOSED: 'outline',
          Closed: 'outline',
        };
        return <Badge variant={variants[row.status] || 'secondary'}>{row.status}</Badge>;
      },
    },
    { key: 'updatedAt' as keyof TicketRecord, header: 'Last Update' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Support & Helpdesk</h1>
          <p className="text-sm text-slate-500">
            File high-priority support tickets and monitor active developer resolutions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-amber-800 dark:text-amber-200 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchTickets}>
            Retry
          </Button>
        </div>
      )}

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
                disabled={isSubmitting}
              />
              <TextArea
                label="Error Description / Trace Logs"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Ticket Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                >
                  <option value="High">High (Service Disruption)</option>
                  <option value="Medium">Medium (General Bug/Config)</option>
                  <option value="Low">Low (Inquiry/Request)</option>
                </select>
              </div>
              <Button type="submit" variant="secondary" disabled={isSubmitting} className="w-full justify-center">
                {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
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
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <DataTable columns={columns} data={displayData} searchKey="subject" rowsPerPage={5} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default ClientSupport;
