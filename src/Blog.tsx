import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BLOG_POSTS, BlogPost } from './blogData';
import { Search, Clock, User, Calendar, ArrowRight, ArrowLeft, Tag, BookOpen, CheckCircle, ChevronRight, Share2, Award, Sparkles } from 'lucide-react';
import SEO from './components/SEO';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const postSlug = searchParams.get('post');
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync selected post with URL query param
  useEffect(() => {
    if (postSlug) {
      const found = BLOG_POSTS.find(p => p.slug === postSlug || p.id === postSlug);
      if (found) {
        setSelectedPost(found);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setSelectedPost(null);
    }
  }, [postSlug]);

  const categories = ['All', 'Technical', 'Fitness', 'Mental Game', 'Tactical', 'Gear & Safety', 'Tryout Prep'];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesQuery = searchQuery.trim() === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
    setSearchParams({ post: post.slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClosePost = () => {
    setSelectedPost(null);
    setSearchParams({});
  };

  const handleShare = (post: BlogPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#141416] text-white pt-28 sm:pt-36 pb-20 font-sans selection:bg-[#D62828] selection:text-white">
      <SEO 
        title="Training Insights & Articles | Challengers Volleyball Academy"
        description="Expert volleyball advice, technical drill breakdowns, match nutrition guides, and mental conditioning from Head Coach Wilson Mathew."
      />

      {/* Decorative Gradient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#D62828]/15 blur-[160px] rounded-full" />
        <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-[#F9BC00]/10 blur-[160px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">

        {/* ── BREADCRUMB & BACK BUTTON ── */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest">
            <NavLink to="/" className="hover:text-yellow transition-colors">Home</NavLink>
            <span>/</span>
            <span className="text-white">Insights &amp; Articles</span>
            {selectedPost && (
              <>
                <span>/</span>
                <span className="text-yellow truncate max-w-[180px] sm:max-w-xs">{selectedPost.title}</span>
              </>
            )}
          </div>

          {selectedPost && (
            <button
              onClick={handleClosePost}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Articles</span>
            </button>
          )}
        </div>

        {/* ── FULL ARTICLE VIEW IF ACTIVE ── */}
        <AnimatePresence mode="wait">
          {selectedPost ? (
            <motion.article
              key={selectedPost.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto bg-[#1B1B1D] border border-white/10 rounded-3xl p-6 sm:p-10 md:p-14 shadow-2xl mb-16"
            >
              {/* Category & Metadata */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3.5 py-1 rounded-full bg-[#D62828] text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  {selectedPost.category}
                </span>
                <span className="text-white/50 text-xs font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-yellow" />
                  {selectedPost.date}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/50 text-xs font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow" />
                  {selectedPost.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-white leading-tight mb-6 tracking-tight">
                {selectedPost.title}
              </h1>

              {/* Author Strip */}
              <div className="flex items-center justify-between border-y border-white/10 py-4 mb-8">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#D62828]/20 border border-[#D62828]/40 flex items-center justify-center text-yellow font-black text-sm">
                    {selectedPost.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{selectedPost.author}</div>
                    <div className="text-xs text-white/50 font-medium">{selectedPost.authorRole}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleShare(selectedPost)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-bold text-white/80 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-yellow" />
                  <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
                </button>
              </div>

              {/* Featured Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-10 border border-white/10 shadow-2xl">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Key Takeaways Box */}
              {selectedPost.keyTakeaways && selectedPost.keyTakeaways.length > 0 && (
                <div className="bg-white/5 border border-yellow/30 rounded-2xl p-6 sm:p-8 mb-10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-yellow font-condensed font-black text-sm uppercase tracking-widest mb-4">
                    <Award className="w-4 h-4" />
                    <span>Coach's Key Takeaways</span>
                  </div>
                  <ul className="space-y-3">
                    {selectedPost.keyTakeaways.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/90 font-medium leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-yellow shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Paragraphs */}
              <div className="space-y-6 text-base sm:text-lg text-white/85 leading-relaxed font-sans font-light">
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Author Signoff & Training CTA */}
              <div className="mt-12 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-red-950/40 to-black/40 p-6 sm:p-8 rounded-2xl border border-red-500/20">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-yellow font-black text-[10px] uppercase tracking-widest block">Ready to Train on Court?</span>
                  <h4 className="text-lg font-serif font-black text-white">Join Head Coach Wilson's Batches</h4>
                  <p className="text-xs text-white/70 max-w-sm">From beginners to competitive juniors — enroll in court sessions across Fremont, Manteca, Mountain House &amp; San Jose.</p>
                </div>
                <NavLink
                  to="/register"
                  className="px-6 py-3 rounded-full bg-[#D62828] hover:bg-yellow hover:text-[#1B1B1D] text-white font-condensed font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shrink-0"
                >
                  Enroll In Coaching &rarr;
                </NavLink>
              </div>
            </motion.article>
          ) : (
            /* ── BLOG CATALOG / OVERVIEW VIEW ── */
            <div>
              {/* Header Section */}
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D62828]/20 border border-[#D62828]/40 text-yellow text-[10px] font-black uppercase tracking-widest mb-4">
                  <Sparkles className="w-3 h-3 text-yellow" />
                  <span>Academy Knowledge Base</span>
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-condensed font-black text-white uppercase tracking-tight leading-none mb-4">
                  A Few Things <span className="font-serif italic text-yellow lowercase">we've learned.</span>
                </h1>
                <p className="text-white/70 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
                  Volleyball mechanics, nutritional timing, mental toughness, and tactical insights curated by Head Coach Wilson Mathew and the coaching staff.
                </p>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 bg-[#1B1B1D] p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                        selectedCategory === cat
                          ? 'bg-[#D62828] text-white shadow-lg'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative min-w-[240px] sm:min-w-[280px]">
                  <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles & drills..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-yellow transition-all"
                  />
                </div>
              </div>

              {/* Grid of Articles */}
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredPosts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      onClick={() => handleOpenPost(post)}
                      className="group bg-[#1B1B1D] border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-yellow/50 transition-all duration-300 shadow-xl cursor-pointer hover:-translate-y-1.5"
                    >
                      <div>
                        {/* Thumbnail Image Container */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1D] via-transparent to-transparent opacity-80" />
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-md bg-[#D62828] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                              {post.category}
                            </span>
                          </div>

                          {/* Read Time */}
                          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[10px] font-bold text-white/80 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3 text-yellow" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="p-6 sm:p-7">
                          <div className="text-[11px] font-condensed font-black tracking-widest text-yellow uppercase mb-2">
                            {post.date}
                          </div>
                          <h3 className="text-xl sm:text-2xl font-serif font-black text-white group-hover:text-yellow transition-colors leading-tight mb-3">
                            {post.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-white/70 font-medium leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 sm:px-7 pb-6 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-white/60">
                        <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <User className="w-3.5 h-3.5 text-yellow shrink-0" />
                          <span className="truncate">{post.author}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-yellow group-hover:translate-x-1 transition-transform">
                          <span>Read</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                  <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No articles found</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto mb-4">
                    Try searching for different keywords or select a different category filter.
                  </p>
                  <button
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="px-4 py-2 rounded-full bg-[#D62828] text-white text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
