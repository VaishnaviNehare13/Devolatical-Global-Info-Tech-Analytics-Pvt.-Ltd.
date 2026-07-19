import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Zap, Cpu, CheckCircle, Award, Target } from 'lucide-react';
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
  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-10 md:pt-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading, Text, CTAs */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-secondary/15 text-secondary dark:bg-secondary/25 uppercase tracking-widest">
              ★ Enterprise Data & Analytics Consulting
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight leading-none">
              Evolving Enterprise Decisions with <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Data Strategies</span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              We guide global organizations through digital transformations. We consult on data strategy, modern cloud platform migrations, and AI-driven business intelligence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center">
                <span>Request Consultation</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto justify-center">
                Our Capabilities
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

      {/* 2. Trusted Clients Ticker */}
      <section className="bg-slate-900 py-10 overflow-hidden text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Consulting with global organizations
          </span>
          <div className="flex flex-wrap items-center gap-8 justify-center opacity-60">
            <span className="font-heading font-extrabold text-base text-white tracking-widest uppercase">VERTEX SYSTEMS</span>
            <span className="font-heading font-extrabold text-base text-white tracking-widest uppercase">AETHER FINANCIAL</span>
            <span className="font-heading font-extrabold text-base text-white tracking-widest uppercase">NOVA HEALTHCARE</span>
            <span className="font-heading font-extrabold text-base text-white tracking-widest uppercase">NEXUS LOGISTICS</span>
          </div>
        </div>
      </section>

      {/* 3. Interactive Analytics Dashboard (Home Showcase) */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <AnalyticsDashboard />
        </div>
        <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">
            Decision Intelligence
          </span>
          <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            Accelerate Business Performance via Analytics
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Our consulting teams audit data architecture latency to build optimal semantic layers. We automate data catalogs to verify compliance and consistency.
          </p>
          <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
              <span>Modern Snowflake and Delta Lake storage blueprints.</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
              <span>Data catalog and classification governance tools.</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
              <span>Multi-region data distribution routing setups.</span>
            </li>
          </ul>
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
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Enterprise Clients</p>
          </Card>
          <Card>
            <h3 className="text-4xl font-extrabold text-primary dark:text-white font-heading">
              <Counter target={500} suffix="+" />
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Platforms Deployed</p>
          </Card>
          <Card>
            <h3 className="text-4xl font-extrabold text-primary dark:text-white font-heading">
              <Counter target={99} suffix="%" />
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Retention Rate</p>
          </Card>
        </div>
      </section>

      {/* 5. Core Services Showcase */}
      <section className="px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Our Capabilities</span>
          <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            Consulting Expertise Areas
          </h2>
          <p className="text-sm text-slate-400">
            We deliver technical advisory spanning strategic data frameworks, machine learning, and multi-cloud platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hoverEffect>
            <div className="p-3 bg-secondary/10 text-secondary w-fit rounded-lg mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Data Strategy & Governance</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define target data operating models, metadata classifications, and master data ownership plans to reduce ingestion silos.
            </p>
          </Card>

          <Card hoverEffect>
            <div className="p-3 bg-indigo-500/10 text-indigo-500 w-fit rounded-lg mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">AI & Decision Intelligence</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Integrate advanced forecasting neural networks, custom LLM agents, and semantic lookup databases to optimize corporate workflows.
            </p>
          </Card>

          <Card hoverEffect>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 w-fit rounded-lg mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Modern Data Platforms & Cloud</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Architect scalable Delta Lake structures on multi-cloud environments (AWS, Azure) managed declaratively using Terraform code.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. Research & System Competence */}
      <section className="px-6 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800/80 pt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex items-start space-x-4">
          <div className="p-3.5 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <Award className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white">Active Research & Advisory Contributions</h4>
            <p className="text-sm text-slate-450 leading-relaxed">
              Our consultants are active contributors to major open-source data standards bodies and publish peer-reviewed technical blueprints regularly.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <Target className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white">Decentralized Systems Competency</h4>
            <p className="text-sm text-slate-450 leading-relaxed">
              We design frameworks and deploy workloads across all major cloud environments, aligning storage with secure engineering best practices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
