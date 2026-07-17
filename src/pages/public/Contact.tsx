import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { Accordion } from '../../components/ui/Accordion';
import { useToast } from '../../components/ui/Toast';
import { Calendar, Mail, Clock, AlertTriangle, Globe } from 'lucide-react';

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
      content: 'Our entire ingestion infrastructure, databases, and portals are designed around SOC 2 and ISO 27001 guidelines. All customer data stores deploy AES-256 TLS/SSL encryption natively and comply with HIPAA and GDPR requirements.'
    },
    {
      id: 'faq-2',
      title: 'Do you offer 24/7 engineering operations support?',
      content: 'Yes. Our global engineering hub in Mumbai BKC operates 24/7/365 telemetry monitoring logs, providing dedicated technical accounts support with active SLA response times under 15 minutes.'
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

      {/* Contact parameter widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 dark:text-white font-bold text-sm">
            <Mail className="h-5 w-5 text-secondary" />
            <span>Communications Hub</span>
          </div>
          <p className="text-xs text-slate-500">Sales Inquiries: <span className="font-semibold text-slate-700 dark:text-slate-350">inquire@devolatical.com</span></p>
          <p className="text-xs text-slate-500">Tech Support: <span className="font-semibold text-slate-700 dark:text-slate-350">support@devolatical.com</span></p>
        </Card>

        <Card className="p-6 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 dark:text-white font-bold text-sm">
            <Clock className="h-5 w-5 text-accent" />
            <span>Business Operations</span>
          </div>
          <p className="text-xs text-slate-500">Sales: 9:00 AM - 6:00 PM EST (Mon-Fri)</p>
          <p className="text-xs text-slate-500">Engineering: 24/7/365 Telemetry monitoring</p>
        </Card>

        <Card className="p-6 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 dark:text-white font-bold text-sm">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Priority Emergency Pager</span>
          </div>
          <p className="text-xs text-slate-500">Urgent SLA incident report line:</p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">+1 (800) 555-DEVO</p>
        </Card>
      </div>

      {/* Main Grid: Form and Contact Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Inquiry Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800/40">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Enterprise Inquiry Form</h3>
              <p className="text-xs text-slate-400 mt-1">File technical requests straight to our engineering sales queue.</p>
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
                <Button type="submit" variant="secondary" className="w-full justify-center text-xs">
                  Submit Project Request
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Contact info & Scheduler */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scheduler Card */}
          <Card className="border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800/40">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Schedule Discovery Session</h3>
              <p className="text-xs text-slate-400 mt-1">Book a direct 15-minute slot with a principal system architect.</p>
            </div>
            <div className="p-6">
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
                <Button type="submit" variant="outline" className="w-full justify-center text-xs">
                  <Calendar className="mr-2 h-4 w-4 text-secondary" />
                  <span>Book Calendar Slot</span>
                </Button>
              </form>
            </div>
          </Card>

          {/* Interactive World Map SVG representation */}
          <Card className="h-64 flex flex-col justify-between overflow-hidden relative border border-slate-100 dark:border-slate-800 p-6">
            <div className="absolute inset-0 bg-secondary/5 filter blur-3xl pointer-events-none" />
            <div className="flex items-center space-x-2 text-slate-400 mb-4 z-10">
              <Globe className="h-5 w-5 text-secondary" />
              <span className="text-xs font-bold uppercase tracking-wider">Office Regional Presence</span>
            </div>
            
            {/* Minimalist World Map with glowing points */}
            <div className="h-28 relative flex items-center justify-center bg-slate-50 dark:bg-dark/40 border border-slate-100 dark:border-slate-850/50 rounded-xl overflow-hidden mb-4">
              <svg className="w-full h-full text-slate-250 dark:text-slate-800" viewBox="0 0 300 120" fill="none">
                {/* Simulated continents outlines */}
                <path d="M20 30 Q40 20 80 40 T150 30 T220 50 T280 20 L270 90 L210 110 L160 80 L90 100 L30 80 Z" fill="currentColor" opacity="0.15" />
                
                {/* Glowing Office Pins */}
                {/* NY Pin */}
                <circle cx="65" cy="45" r="4" fill="#0F62FE" />
                <circle cx="65" cy="45" r="8" stroke="#0F62FE" strokeWidth="1" className="animate-ping" fill="none" />
                <text x="65" y="35" textAnchor="middle" className="text-[7px] font-bold text-slate-500 font-mono" fill="currentColor">New York (HQ)</text>

                {/* Mumbai BKC Pin */}
                <circle cx="210" cy="70" r="4" fill="#00C2FF" />
                <circle cx="210" cy="70" r="8" stroke="#00C2FF" strokeWidth="1" className="animate-ping" fill="none" />
                <text x="210" y="60" textAnchor="middle" className="text-[7px] font-bold text-slate-500 font-mono" fill="currentColor">Mumbai BKC</text>
              </svg>
            </div>

            <div className="text-[10px] text-slate-500 flex justify-between items-center z-10 border-t border-slate-50 dark:border-slate-850/50 pt-3">
              <span>New York (HQ)</span>
              <span className="text-slate-400 font-mono">•</span>
              <span>Mumbai Tech Hub</span>
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
