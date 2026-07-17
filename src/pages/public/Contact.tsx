import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Accordion } from '../../components/ui/Accordion';
import { useToast } from '../../components/ui/Toast';
import { Calendar, Map } from 'lucide-react';

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [scope, setScope] = useState('data-analytics');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Scheduler fields
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = 'Full representative name is required';
    if (!company) newErrors.company = 'Company name is required';
    if (!email) {
      newErrors.email = 'Work email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid work email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Validation failed. Please correct form entries.', 'error');
      return;
    }

    setErrors({});
    showToast('Inquiry submitted successfully. An architect will reach out within 2 hours.', 'success');
    setName('');
    setEmail('');
    setCompany('');
    setMessage('');
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      showToast('Please select Date and Time slot.', 'error');
      return;
    }
    showToast(`Consultation slot booked for ${selectedDate} at ${selectedTime}. Calendar invite dispatched.`, 'success');
    setSelectedDate('');
    setSelectedTime('');
  };

  const faqItems = [
    {
      id: 'faq-1',
      title: 'What compliance standards are active on Devolatical systems?',
      content: 'Our entire ingestion infrastructure, databases, and portals are SOC 2 Type II certified. All customer data stores deploy AES-256 TLS/SSL encryption natively and comply fully with HIPAA and GDPR requirements.'
    },
    {
      id: 'faq-2',
      title: 'Do you offer 24/7 engineering operations support?',
      content: 'Yes. Our global engineering hub in MumbaiBKC BKC operates 24/7/365 telemetry monitoring logs, providing dedicated technical accounts support with active SLA response times under 15 minutes.'
    },
    {
      id: 'faq-3',
      title: 'What cloud hosting providers do your architectures support?',
      content: 'We support all major cloud vendors, specializing in Amazon Web Services (AWS Advanced tier), Microsoft Azure, Google Cloud Platform (GCP), and hybrid database environments using Snowflake and Databricks.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Contact Us</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Connect with our Architects
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Request system estimates, book technical discovery sessions, or query regulatory compliance parameters.
        </p>
      </section>

      {/* Main Grid: Form and Contact Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Inquiry Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Inquiry Form</CardTitle>
              <CardDescription>File technical requests straight to our engineering sales queue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Representative Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Work Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Corporate Entity"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    error={errors.company}
                    required
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Inquiry Scope
                    </label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      <option value="data-analytics">Advanced Data Analytics</option>
                      <option value="ai-ml">AI & Machine Learning</option>
                      <option value="custom-software">Custom Software Dev</option>
                      <option value="security">SOC 2 / Security Auditing</option>
                    </select>
                  </div>
                </div>
                <TextArea
                  label="Architectural Goals / Project Scope Description"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" variant="secondary" className="w-full justify-center">
                  Submit Project Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact info & Scheduler */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scheduler Card */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Discovery Session</CardTitle>
              <CardDescription>Book a direct 15-minute slot with a principal system architect.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Select Time Slot
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white"
                      required
                    >
                      <option value="">-- Choose Slot --</option>
                      <option value="10:00 AM EST">10:00 AM EST</option>
                      <option value="02:00 PM EST">02:00 PM EST</option>
                      <option value="04:00 PM EST">04:00 PM EST</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" variant="outline" className="w-full justify-center">
                  <Calendar className="mr-2 h-4 w-4 text-secondary" />
                  <span>Book Calendar Slot</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map Representation */}
          <Card className="h-64 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 bg-secondary/5 filter blur-2xl pointer-events-none" />
            <div className="p-4 relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center space-x-2 text-slate-400">
                <Map className="h-5 w-5 text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider">Office Maps Location</span>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-800 dark:text-white">Suite 4200, 1 World Trade Center</p>
                <p>New York, NY 10007, USA</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-800/80 pt-16 max-w-3xl">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Frequently Answered Queries
        </h2>
        <Accordion items={faqItems} />
      </section>
    </div>
  );
};
export default Contact;
