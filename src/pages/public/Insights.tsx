import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, ChevronLeft, ChevronRight, BookOpen, Share2, Eye, TrendingUp } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface ArticleItem {
  id: string;
  title: string;
  category: 'Cloud' | 'Data Science' | 'Security';
  summary: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  views: string;
}

export const Insights: React.FC = () => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Cloud' | 'Data Science' | 'Security'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const articles: ArticleItem[] = [
    {
      id: 'art-1',
      title: 'Scaling Apache Spark Ingestion: Ingestion Limits and Optimizations',
      category: 'Data Science',
      summary: 'Learn how to optimize partition indexes and connection pooling thresholds to support workloads exceeding 50k events per second.',
      date: '2026-07-15',
      readTime: '6 min read',
      author: 'Vikram Mehta',
      authorRole: 'Chief Technology Officer',
      views: '1.2k views'
    },
    {
      id: 'art-2',
      title: 'Achieving SOC 2 Compliance on AWS: A Complete Security Guide',
      category: 'Security',
      summary: 'Discover key IAM security configurations, automatic trace logs audits, and database encryption rules required for compliance.',
      date: '2026-07-02',
      readTime: '8 min read',
      author: 'Marcus Vance',
      authorRole: 'Chief Security Officer',
      views: '940 views'
    },
    {
      id: 'art-3',
      title: 'Kubernetes Multi-Cloud Scaling: High Availability Orchestration',
      category: 'Cloud',
      summary: 'Set up cross-region DNS mappings, virtual private networks (VPN), and cluster setups across AWS and Azure environments.',
      date: '2026-06-20',
      readTime: '10 min read',
      author: 'Sarah Jenkins',
      authorRole: 'Chief Executive Officer',
      views: '2.1k views'
    },
    {
      id: 'art-4',
      title: 'Designing Lakehouse Architectures with Delta Lake and dbt',
      category: 'Data Science',
      summary: 'Standardize schema definitions and model analytics metrics using dbt pipelines feeding Delta Lake formats.',
      date: '2026-06-05',
      readTime: '7 min read',
      author: 'Vikram Mehta',
      authorRole: 'Chief Technology Officer',
      views: '800 views'
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

  const handleRead = (title: string) => {
    showToast(`Loading full document briefing for: ${title}`, 'info');
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`Link copied for: ${title}`, 'success');
  };

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
                onClick={() => handleRead(featuredArticle.title)}
              >
                Read Featured
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-slate-100 dark:border-slate-850/50 pb-6">
        {/* Categories */}
        <div className="flex space-x-2">
          {(['All', 'Cloud', 'Data Science', 'Security'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-secondary text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
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
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {art.summary}
                </p>
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
                      onClick={() => handleRead(art.title)}
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
              <p className="text-xs text-slate-650 dark:text-slate-350 hover:text-secondary cursor-pointer leading-snug">
                1. Achieving SOC 2 Compliance on AWS: A Complete Security Guide
              </p>
              <p className="text-xs text-slate-650 dark:text-slate-350 hover:text-secondary cursor-pointer leading-snug">
                2. Kubernetes Multi-Cloud Scaling: High Availability Orchestration
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
    </div>
  );
};
export default Insights;
