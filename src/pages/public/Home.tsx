import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Server, Code, CheckCircle, ShieldCheck, Layers } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CustomGlobe } from '../../components/common/CustomGlobe';
import { AnalyticsDashboard } from '../../components/common/AnalyticsDashboard';

// Count-up helper component
const Counter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ target, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.abs(Math.floor(totalMiliseconds / end));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime || 1);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}{suffix}</span>;
};

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'infrastructure' | 'software'>('analytics');

  return (
    <div className="space-y-24 pb-20 text-left">
      {/* 1. Hero Section */}
      <section className="relative pt-10 md:pt-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading, Tagline, Text, CTAs */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-secondary/15 text-secondary dark:bg-secondary/25 uppercase tracking-widest font-mono">
              Devolatical Global Info-Tech & Analytics
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight leading-none">
              Empowering Growth Through <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Advanced Analytics</span> & Smart Technology
            </h1>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              We build scalable digital ecosystems that drive data-backed business transformations. We specialize in Advanced Data Analytics, IT Infrastructure Solutions, and Custom Software Engineering.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center text-xs font-bold">
                <span>Schedule Consultation</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto justify-center text-xs font-bold">
                Explore Official Capabilities
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Globe & Surrounding Metrics */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="w-full max-w-[500px]">
            <CustomGlobe />
          </div>
        </div>
      </section>

      {/* 2. Anonymized Enterprise Sectors Banner */}
      <section className="bg-slate-900 py-8 overflow-hidden text-slate-400 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            // Enterprise Sectors Consulted
          </span>
          <div className="flex flex-wrap items-center gap-6 justify-center">
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-200 tracking-wide">
              FINANCIAL INSTITUTIONS
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-200 tracking-wide">
              HEALTHCARE PROVIDERS
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-200 tracking-wide">
              MANUFACTURING ENTERPRISES
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-200 tracking-wide">
              RETAIL ORGANIZATIONS
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-200 tracking-wide">
              GOVERNMENT AGENCIES
            </span>
          </div>
        </div>
      </section>

      {/* 3. Interactive Data Storytelling & Analytics Visuals */}
      <section className="px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">
            Interactive Enterprise Visuals
          </span>
          <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            Data Storytelling & System Architecture Visuals
          </h2>
          <p className="text-sm text-slate-500">
            Real-time analytics storytelling showcasing pipeline throughput, infrastructure topology, and workflow automation.
          </p>
          
          {/* Interactive visual selector tabs */}
          <div className="flex justify-center space-x-2 pt-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              KPI & BI Dashboards
            </button>
            <button
              onClick={() => setActiveTab('infrastructure')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'infrastructure'
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Cloud Infrastructure Diagrams
            </button>
            <button
              onClick={() => setActiveTab('software')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'software'
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Workflow Automation Flow
            </button>
          </div>
        </div>

        {/* Tab Visual Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            
            {activeTab === 'infrastructure' && (
              <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-card space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-secondary" />
                    <span className="font-bold text-sm text-slate-850 dark:text-white">Cloud Infrastructure Architecture</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">AWS / Azure Hybrid Blueprint</span>
                </div>
                
                {/* SVG Architecture Diagram */}
                <div className="h-56 relative bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 340 160">
                    <path d="M 40 80 H 120 M 120 80 L 220 40 M 120 80 L 220 120 M 220 40 H 300 M 220 120 H 300" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-700" strokeDasharray="3 3" />
                    
                    {/* Pulsing data packets */}
                    <motion.circle cx="40" cy="80" r="3.5" fill="#00C2FF" animate={{ cx: [40, 120, 220, 300], cy: [80, 80, 40, 40] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} />
                    <motion.circle cx="40" cy="80" r="3.5" fill="#0F62FE" animate={{ cx: [40, 120, 220, 300], cy: [80, 80, 120, 120] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 1.7 }} />

                    {/* Nodes */}
                    <rect x="15" y="62" width="50" height="36" rx="6" fill="#1e293b" stroke="#00C2FF" strokeWidth="1.5" />
                    <text x="40" y="84" textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-mono font-bold">VPC Gateway</text>

                    <rect x="100" y="62" width="50" height="36" rx="6" fill="#1e293b" stroke="#0F62FE" strokeWidth="1.5" />
                    <text x="125" y="84" textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-mono font-bold">Load Balancer</text>

                    <rect x="200" y="22" width="50" height="36" rx="6" fill="#1e293b" stroke="#22C55E" strokeWidth="1.5" />
                    <text x="225" y="44" textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-mono font-bold">Compute Nodes</text>

                    <rect x="200" y="102" width="50" height="36" rx="6" fill="#1e293b" stroke="#F59E0B" strokeWidth="1.5" />
                    <text x="225" y="124" textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-mono font-bold">Replica Store</text>
                  </svg>
                </div>
              </Card>
            )}

            {activeTab === 'software' && (
              <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-card space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-indigo-500" />
                    <span className="font-bold text-sm text-slate-850 dark:text-white">Workflow Automation Flow</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Microservice Pipeline</span>
                </div>

                <div className="h-56 relative bg-slate-50 dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 340 160">
                    <path d="M 30 80 Q 90 20 170 80 T 310 80" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
                    
                    <motion.circle cx="30" cy="80" r="4" fill="#6366F1" animate={{ cx: [30, 170, 310] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

                    <circle cx="30" cy="80" r="12" fill="#1e293b" stroke="#6366F1" strokeWidth="2" />
                    <text x="30" y="83" textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-mono font-bold">Trigger</text>

                    <circle cx="170" cy="80" r="12" fill="#1e293b" stroke="#00C2FF" strokeWidth="2" />
                    <text x="170" y="83" textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-mono font-bold">Process</text>

                    <circle cx="310" cy="80" r="12" fill="#1e293b" stroke="#22C55E" strokeWidth="2" />
                    <text x="310" y="83" textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-mono font-bold">Sync</text>
                  </svg>
                </div>
              </Card>
            )}
          </div>

          {/* Right Text Description */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">
              Enterprise Solution Architecture
            </span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              Data-Backed Business Transformations
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              We audit system latency, optimize compute infrastructure, and construct scalable software pipelines designed for reliable performance under peak enterprise loads.
            </p>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-secondary mr-2.5 flex-shrink-0" />
                <span>Modern Delta Lake & Cloud Data Warehouse blueprints.</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-secondary mr-2.5 flex-shrink-0" />
                <span>High-availability multi-region cloud deployment blueprints.</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-secondary mr-2.5 flex-shrink-0" />
                <span>Automated workflow pipelines and custom enterprise web platforms.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Statistics Grid */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <Card>
            <h3 className="text-4xl font-extrabold text-primary dark:text-white font-heading">
              <Counter target={20} suffix="+" />
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Sectors Consulted</p>
          </Card>
          <Card>
            <h3 className="text-4xl font-extrabold text-primary dark:text-white font-heading">
              <Counter target={100} suffix="+" />
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Enterprise Projects</p>
          </Card>
          <Card>
            <h3 className="text-4xl font-extrabold text-primary dark:text-white font-heading">
              <Counter target={500} suffix="+" />
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Pipelines Deployed</p>
          </Card>
          <Card>
            <h3 className="text-4xl font-extrabold text-primary dark:text-white font-heading">
              <Counter target={99} suffix="%" />
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Retention Rate</p>
          </Card>
        </div>
      </section>

      {/* 5. Official Core Offerings Showcase */}
      <section className="px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Our 3 Core Offerings</span>
          <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            Official Services & Capabilities
          </h2>
          <p className="text-sm text-slate-400">
            Organized strictly around our core company offerings to deliver data-backed transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service 1 */}
          <Card hoverEffect className="flex flex-col justify-between p-6 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="p-3 bg-secondary/10 text-secondary w-fit rounded-lg mb-4">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2">
                Advanced Data Analytics
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Turn complex datasets into actionable business returns.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />Business Intelligence</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />Data Visualization</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />Predictive Analytics</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />Automated Reporting</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />Analytics Dashboards</li>
              </ul>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/services">
                <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                  Explore Analytics
                </Button>
              </Link>
            </div>
          </Card>

          {/* Service 2 */}
          <Card hoverEffect className="flex flex-col justify-between p-6 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="p-3 bg-accent/10 text-accent w-fit rounded-lg mb-4">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2">
                IT Infrastructure Solutions
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Build resilient, secure, and scalable cloud environments.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />Cloud Migration</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />Network Architecture</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />Infrastructure Monitoring</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />Secure Deployments</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />IT Support</li>
              </ul>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/services">
                <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                  Explore Infrastructure
                </Button>
              </Link>
            </div>
          </Card>

          {/* Service 3 */}
          <Card hoverEffect className="flex flex-col justify-between p-6 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="p-3 bg-indigo-500/10 text-indigo-500 w-fit rounded-lg mb-4">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2">
                Custom Software Solutions
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Engineered high-performance software tailored for business growth.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />Enterprise Web Applications</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />Mobile Applications</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />Workflow Automation</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />Business Software</li>
              </ul>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/services">
                <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                  Explore Software
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. Enterprise Competence Callout */}
      <section className="px-6 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800/80 pt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex items-start space-x-4">
          <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <Layers className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white">Engineering Methodology</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We employ structured consulting frameworks across discovery, architectural blueprinting, modern execution, and active governance.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white">Enterprise Security & Compliance</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our architectures implement end-to-end encryption, multi-factor authentication, and secure access boundaries natively.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
