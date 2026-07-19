import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Search, ChevronLeft, ChevronRight, BookOpen, Share2, Eye, TrendingUp, Clock, User, Hash } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

type TrackCategory = 
  | 'Data Strategy'
  | 'Data Governance'
  | 'Cloud Analytics'
  | 'Business Intelligence'
  | 'Artificial Intelligence'
  | 'Machine Learning'
  | 'Data Engineering'
  | 'Digital Transformation'
  | 'Enterprise Architecture';

interface ArticleItem {
  id: string;
  title: string;
  category: TrackCategory;
  summary: string;
  content: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  views: string;
  tags: string[];
  relatedTopics: string[];
}

export const Insights: React.FC = () => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | TrackCategory>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  const articles: ArticleItem[] = [
    {
      id: 'art-1',
      title: 'Scaling Apache Spark Ingestion: Ingestion Limits and Optimizations',
      category: 'Data Engineering',
      summary: 'Learn how to optimize partition indexes and connection pooling thresholds to support workloads exceeding 50k events per second.',
      content: 'Distributed partition alignments and memory parameter modifications are critical when processing workloads scaling beyond 50,000 active telemetry streams per second. This technical briefing details how we optimized Apache Spark data pipelines by adjusting executor limits, partition thresholds, and connection pools. By decoupling staging layers using Apache Kafka buffers, we achieved sub-10ms ledger sync intervals under real-world performance benchmarks. We recommend deploying dynamic worker allocation triggers to prevent executor resource locks during peak clickstream events.',
      date: '2026-07-15',
      readTime: '6 min read',
      author: 'Systems Engineering Group',
      authorRole: 'Principal Engineering Advisory',
      views: '1.2k views',
      tags: ['Spark', 'ETL', 'Real-Time'],
      relatedTopics: ['Ingestion Buffers', 'Partition Pruning']
    },
    {
      id: 'art-2',
      title: 'Achieving Compliance Readiness on AWS: A Complete Security Guide',
      category: 'Data Governance',
      summary: 'Discover key IAM security configurations, automatic trace logs audits, and database encryption rules required for compliance.',
      content: 'Establishing a compliance-ready security framework on Amazon Web Services requires strict auditing of identity controls, access roles, and database encryption patterns. In this guide, we review how to automate audit logging across VPC endpoints, restrict database queries using IAM keys, and configure Wazuh and Cloudflare WAF layers at the edge to secure multi-tenant SaaS software architectures. We also outline automated compliance drift alert scripts that check IAM privilege bounds on a daily cycle.',
      date: '2026-07-02',
      readTime: '8 min read',
      author: 'Compliance & Audit Group',
      authorRole: 'Security Consulting Team',
      views: '940 views',
      tags: ['AWS', 'IAM', 'Security'],
      relatedTopics: ['Audit Logs', 'Compliance Drift']
    },
    {
      id: 'art-3',
      title: 'Kubernetes Multi-Cloud Scaling: High Availability Orchestration',
      category: 'Enterprise Architecture',
      summary: 'Set up cross-region DNS mappings, virtual private networks (VPN), and cluster setups across AWS and Azure environments.',
      content: 'Configuring high-availability clusters spanning separate cloud environments (AWS EKS and Azure AKS) introduces cross-region latency challenges. This analysis details our blueprint for cross-cloud virtual networks (VPN), high-throughput Kafka buffering streams, and automated geo-DNS failover logic. The resulting infrastructure maintains 99.99% availability limits under peak mock trading traffic. Multi-cluster federation scripts automate workload failover processes seamlessly when cloud providers experience regional splits.',
      date: '2026-06-20',
      readTime: '10 min read',
      author: 'Enterprise Architecture Lead',
      authorRole: 'Principal Infrastructure Architect',
      views: '2.1k views',
      tags: ['Kubernetes', 'Multi-Cloud', 'K8s'],
      relatedTopics: ['Failover Logic', 'Cluster Federation']
    },
    {
      id: 'art-4',
      title: 'Designing Lakehouse Architectures with Delta Lake and dbt',
      category: 'Cloud Analytics',
      summary: 'Standardize schema definitions and model analytics metrics using dbt pipelines feeding Delta Lake formats.',
      content: 'Delta Lake and dbt provide a standardized semantic layer to model complex financial metrics. This paper walks through building a multi-hop (Bronze-Silver-Gold) ingestion lakehouse. We show how to write clean, modular dbt transformation scripts that run on Snowflake to prevent connection bottlenecks and maintain strict data catalogs. Furthermore, we outline metadata pruning policies that reduce overall parquet directory file overheads in Amazon S3 buckets.',
      date: '2026-06-05',
      readTime: '7 min read',
      author: 'Systems Engineering Group',
      authorRole: 'Principal Engineering Advisory',
      views: '800 views',
      tags: ['Delta Lake', 'dbt', 'Snowflake'],
      relatedTopics: ['Semantic Layers', 'Metadata Pruning']
    },
    {
      id: 'art-5',
      title: 'Semantic Layer Mapping in Modern Business Intelligence',
      category: 'Business Intelligence',
      summary: 'Map raw telemetry models directly to optimized Power BI models using declarative dbt rules.',
      content: 'BI platforms require clean, cached semantic layers to execute aggregations without causing locks on transactional nodes. In this briefing, we outline how we construct unified caching schemas on Snowflake, expose metric definitions using dbt Semantic Layer directives, and configure direct query caching speeds to keep executive dashboards responsive.',
      date: '2026-05-28',
      readTime: '5 min read',
      author: 'Strategy & Advisory Practice',
      authorRole: 'Managing Partners',
      views: '710 views',
      tags: ['Power BI', 'Semantic Layer', 'dbt'],
      relatedTopics: ['Executive BI', 'Query Caching']
    },
    {
      id: 'art-6',
      title: 'Evolving Business Values: The Data Strategy Handbook',
      category: 'Data Strategy',
      summary: 'Evolve IT operations into strategic business outcome channels via structured data ownership schemas.',
      content: 'Data strategy maps direct pathways between physical database pipelines and high-level business revenue. We define target operating frameworks that assign stewardship roles, establish unified data dictionaries, and outline multi-year cloud investments to consolidate system footprints.',
      date: '2026-05-14',
      readTime: '9 min read',
      author: 'Strategy & Advisory Practice',
      authorRole: 'Managing Partners',
      views: '640 views',
      tags: ['Data Strategy', 'Governance', 'Consulting'],
      relatedTopics: ['Value Stream', 'Operating Models']
    }
  ];

  // Featured spotlight article (first item in array)
  const featuredArticle = articles[0];

  // Filtering Logic
  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredArticles.length / 3);
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * 3, currentPage * 3);

  const handleRead = (article: ArticleItem) => {
    showToast(`Loading full document briefing...`, 'info');
    setSelectedArticle(article);
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`Link copied for: ${title}`, 'success');
  };

  const categoriesList: ('All' | TrackCategory)[] = [
    'All',
    'Data Strategy',
    'Data Governance',
    'Cloud Analytics',
    'Business Intelligence',
    'Artificial Intelligence',
    'Machine Learning',
    'Data Engineering',
    'Digital Transformation',
    'Enterprise Architecture'
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 text-left">
      {/* Page Header */}
      <section className="space-y-4 max-w-2xl">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Insights Blog</span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
          Enterprise Technical Briefings
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Deep analysis papers covering distributed database engines, cybersecurity configurations, and multi-cloud scaling procedures.
        </p>
      </section>

      {/* Featured Spotlight Banner */}
      {searchQuery === '' && activeCategory === 'All' && (
        <section className="p-8 bg-slate-900 text-white rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-secondary/15 filter blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-[10px]">FEATURED BRIEFING</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{featuredArticle.date}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-white tracking-tight leading-tight">
              {featuredArticle.title}
            </h2>
            <p className="text-sm text-slate-350 leading-relaxed">
              {featuredArticle.summary}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800/80 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-xs">
                VM
              </div>
              <div>
                <p className="text-xs font-bold text-white">{featuredArticle.author}</p>
                <p className="text-[10px] text-slate-400">{featuredArticle.authorRole}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 font-mono">{featuredArticle.readTime}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRead(featuredArticle)}
              >
                Read Featured
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-6 border-b border-slate-100 dark:border-slate-855/55 pb-6">
        {/* Categories tabs wrap */}
        <div className="flex flex-wrap gap-2">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-secondary text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-slate-50/50 dark:bg-dark/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 self-end">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search briefings..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-secondary transition-colors"
          />
        </div>
      </div>

      {/* Main Grid: Articles and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Article Feed */}
        <div className="lg:col-span-8 space-y-6">
          {paginatedArticles.length > 0 ? (
            paginatedArticles.map((art) => (
              <Card key={art.id} hoverEffect className="p-6 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary" className="text-[9px]">
                    {art.category}
                  </Badge>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center"><Eye className="h-3.5 w-3.5 mr-1" /> {art.views}</span>
                    <span>•</span>
                    <span>{art.date}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2 leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {art.summary}
                </p>

                {/* Display Tags */}
                <div className="flex flex-wrap gap-1 mb-6">
                  {art.tags.map((tg, idx) => (
                    <Badge key={idx} variant="outline" className="text-[8.5px] py-0.2">
                      #{tg.toLowerCase()}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-850/50">
                  <div className="flex flex-col text-[10px] text-slate-400">
                    <span className="font-bold text-slate-650 dark:text-slate-300">By {art.author}</span>
                    <span>{art.authorRole}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleShare(art.title, e)}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs"
                      onClick={() => handleRead(art)}
                    >
                      Read Briefing
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-slate-400">No articles matched your criteria.</p>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-6">
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Newsletters and Trending */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trending Card */}
          <Card className="p-6 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-slate-400 pb-2 border-b border-slate-50 dark:border-slate-850/50">
              <TrendingUp className="h-4 w-4 text-secondary animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Trending Briefings</span>
            </div>
            <div className="space-y-3">
              <p
                onClick={() => handleRead(articles[1])}
                className="text-xs text-slate-650 dark:text-slate-350 hover:text-secondary cursor-pointer leading-snug"
              >
                1. Achieving Compliance Readiness on AWS: A Complete Security Guide
              </p>
              <p
                onClick={() => handleRead(articles[2])}
                className="text-xs text-slate-650 dark:text-slate-350 hover:text-secondary cursor-pointer leading-snug"
              >
                2. Kubernetes Multi-Cloud Scaling: High Availability Orchestration
              </p>
              <p
                onClick={() => handleRead(articles[4])}
                className="text-xs text-slate-650 dark:text-slate-350 hover:text-secondary cursor-pointer leading-snug"
              >
                3. Semantic Layer Mapping in Modern Business Intelligence
              </p>
            </div>
          </Card>

          {/* Newsletter subscription */}
          <Card className="bg-primary text-white p-6 relative overflow-hidden border border-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/20 filter blur-2xl pointer-events-none" />
            <BookOpen className="h-8 w-8 text-accent mb-4" />
            <h4 className="font-bold text-lg mb-2">Subscribe to Briefings</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Get our comprehensive research updates delivered straight to your operations inbox weekly.
            </p>
            <input
              type="email"
              placeholder="workemail@corporate.com"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-xs placeholder-white/50 text-white outline-none focus:border-accent mb-4"
            />
            <Button
              variant="secondary"
              className="w-full justify-center cursor-pointer text-xs"
              onClick={() => showToast('Subscribed to briefings newsletter!', 'success')}
            >
              Subscribe Briefs
            </Button>
          </Card>
        </div>
      </div>

      {/* Article Reader Modal */}
      <Modal
        isOpen={selectedArticle !== null}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title}
        className="max-w-2xl"
      >
        {selectedArticle && (
          <div className="space-y-5 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-semibold border-b border-slate-50 dark:border-slate-805/40 pb-3">
              <span className="flex items-center"><User className="h-4 w-4 mr-1 text-secondary" /> By {selectedArticle.author} ({selectedArticle.authorRole})</span>
              <span>•</span>
              <span className="flex items-center"><Clock className="h-4 w-4 mr-1 text-accent" /> {selectedArticle.readTime}</span>
              <span>•</span>
              <span>Published: {selectedArticle.date}</span>
            </div>

            {/* Content text */}
            <div className="text-slate-600 dark:text-slate-450 text-sm space-y-4">
              <p>{selectedArticle.content}</p>

              {/* Related Topics list inside reader */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                  <Hash className="h-3.5 w-3.5 text-secondary mr-1" />
                  Related Analysis Topics
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedArticle.relatedTopics.map((topic, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px]">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-slate-805/40">
              <Button
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => setSelectedArticle(null)}
              >
                Close Reader
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Insights;
