import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Accordion } from '../../components/ui/Accordion';
import { useToast } from '../../components/ui/Toast';
import { leadsApi } from '../../api/leads.api';
import { Calendar, Mail, Clock, MapPin } from 'lucide-react';

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [scope, setScope] = useState('data-analytics');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scheduler fields
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full representative name is required';
    if (!company.trim()) newErrors.company = 'Company name is required';
    if (!email.trim()) {
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
    setIsSubmitting(true);

    try {
      await leadsApi.createLead({
        name: name.trim(),
        email: email.trim(),
        companyName: company.trim(),
        source: 'WEBSITE',
        industry:
          scope === 'data-analytics'
            ? 'Advanced Data Analytics'
            : scope === 'it-infrastructure'
            ? 'IT Infrastructure'
            : 'Custom Software',
        notes: message.trim() || null,
      });

      showToast(
        'Inquiry submitted successfully! An enterprise architect will review your scoping request.',
        'success'
      );
      setName('');
      setEmail('');
      setCompany('');
      setMessage('');
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to submit scoping request. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      showToast('Please select Date and Time slot.', 'error');
      return;
    }
    showToast(`Consultation slot booked for ${selectedDate} at ${selectedTime}. Calendar invitation dispatched.`, 'success');
    setSelectedDate('');
    setSelectedTime('');
  };

  const faqItems = [
    {
      id: 'faq-1',
      title: 'What core services does Devolatical Global offer?',
      content: 'We specialize strictly in three official areas: 1) Advanced Data Analytics (BI, Data Visualization, Predictive Analytics, Dashboards), 2) IT Infrastructure Solutions (Cloud Migration, Network Architecture, Monitoring, Secure Deployments, IT Support), and 3) Custom Software Solutions (Enterprise Web Applications, Mobile Applications, Workflow Automation, Business Software).'
    },
    {
      id: 'faq-2',
      title: 'Where is Devolatical Global headquartered?',
      content: 'Our primary headquarters and tech hub are located in Andheri West, Mumbai, Maharashtra, India.'
    },
    {
      id: 'faq-3',
      title: 'What response SLA can we expect for project scoping inquiries?',
      content: 'Our systems engineering practice responds to initial inquiry submissions within 2 business hours and can arrange direct 15-minute architecture discovery sessions.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Contact Us</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Connect with Our Architects
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Request scoping estimates, book technical discovery sessions, or submit project requirements to Devolatical Global Info-Tech & Analytics Pvt. Ltd.
        </p>
      </section>

      {/* Contact Parameter Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 dark:text-white font-bold text-sm">
            <Mail className="h-5 w-5 text-secondary" />
            <span>Official Email</span>
          </div>
          <p className="text-xs text-slate-500">Business & Tech Inquiries:</p>
          <a href="mailto:devolaticalglobalinfotech@gmail.com" className="text-xs font-semibold text-secondary hover:underline block font-mono">
            devolaticalglobalinfotech@gmail.com
          </a>
        </Card>

        <Card className="p-6 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 dark:text-white font-bold text-sm">
            <Clock className="h-5 w-5 text-accent" />
            <span>Operations Response SLA</span>
          </div>
          <p className="text-xs text-slate-500">Standard Inquiries: Under 2 Business Hours</p>
          <p className="text-xs text-slate-500">Urgent Support: 15-Minute Priority Response</p>
        </Card>

        <Card className="p-6 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 dark:text-white font-bold text-sm">
            <MapPin className="h-5 w-5 text-emerald-500" />
            <span>Registered Tech Hub</span>
          </div>
          <p className="text-xs text-slate-500">Andheri West, Mumbai</p>
          <p className="text-xs text-slate-500">Maharashtra, India</p>
        </Card>
      </div>

      {/* Main Grid: Form and Contact Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Inquiry Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800/40">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Enterprise Scoping Form</h3>
              <p className="text-xs text-slate-400 mt-1">Submit scoping requests directly to our systems engineering queue.</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Representative Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    label="Work Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Corporate Entity"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    error={errors.company}
                    required
                    disabled={isSubmitting}
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider font-mono">
                      Inquiry Scope
                    </label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-secondary"
                    >
                      <option value="data-analytics">Advanced Data Analytics (BI, Viz, Dashboards)</option>
                      <option value="it-infrastructure">IT Infrastructure Solutions (Cloud, Monitoring)</option>
                      <option value="custom-software">Custom Software Solutions (Web, Mobile, Automation)</option>
                    </select>
                  </div>
                </div>
                <TextArea
                  label="Project Scope / Technical Requirements"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="w-full justify-center text-xs font-bold py-3"
                >
                  {isSubmitting ? 'Submitting Scoping Request...' : 'Submit Scoping Request'}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Meeting Scheduler & Location Map */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scheduler Card */}
          <Card className="border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800/40">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Schedule Discovery Session</h3>
              <p className="text-xs text-slate-400 mt-1">Book a direct 15-minute slot with an architecture practice lead.</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider font-mono">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider font-mono">
                      Select Slot (IST)
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-dark border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-secondary"
                      required
                    >
                      <option value="">-- Slot --</option>
                      <option value="11:00 AM IST">11:00 AM IST</option>
                      <option value="02:30 PM IST">02:30 PM IST</option>
                      <option value="05:00 PM IST">05:00 PM IST</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" variant="outline" className="w-full justify-center text-xs font-bold">
                  <Calendar className="mr-2 h-4 w-4 text-secondary" />
                  <span>Book Calendar Slot</span>
                </Button>
              </form>
            </div>
          </Card>

          {/* Location Map Visual */}
          <Card className="h-64 flex flex-col justify-between overflow-hidden relative border border-slate-100 dark:border-slate-800 p-6">
            <div className="absolute inset-0 bg-secondary/5 filter blur-3xl pointer-events-none" />
            <div className="flex items-center space-x-2 text-slate-400 mb-2 z-10">
              <MapPin className="h-5 w-5 text-secondary" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Company Tech Hub</span>
            </div>
            
            <div className="h-28 relative flex items-center justify-center bg-slate-50 dark:bg-dark/40 border border-slate-100 dark:border-slate-850/50 rounded-xl overflow-hidden mb-2">
              <svg className="w-full h-full text-slate-250 dark:text-slate-800" viewBox="0 0 300 120" fill="none">
                <path d="M20 30 Q40 20 80 40 T150 30 T220 50 T280 20 L270 90 L210 110 L160 80 L90 100 L30 80 Z" fill="currentColor" opacity="0.15" />
                
                {/* Mumbai Pin */}
                <circle cx="160" cy="65" r="5" fill="#00C2FF" />
                <circle cx="160" cy="65" r="10" stroke="#00C2FF" strokeWidth="1" className="animate-ping" fill="none" />
                <text x="160" y="52" textAnchor="middle" className="text-[8px] font-bold text-slate-500 font-mono" fill="currentColor">Andheri West, Mumbai</text>
              </svg>
            </div>

            <div className="text-[10px] text-slate-500 flex justify-between items-center z-10 border-t border-slate-50 dark:border-slate-850/50 pt-2 font-mono">
              <span>Andheri West</span>
              <span>•</span>
              <span>Mumbai, MH</span>
              <span>•</span>
              <span>India</span>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <section className="space-y-8 border-t border-slate-100 dark:border-slate-850/50 pt-16 max-w-3xl">
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Frequently Answered Queries
        </h2>
        <Accordion items={faqItems} />
      </section>
    </div>
  );
};

export default Contact;
