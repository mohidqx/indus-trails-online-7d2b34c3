import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, ArrowRight, Search, Tag } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  tags: string[] | null;
  author: string | null;
  views: number;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
    setIsLoading(false);
  };

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];

  const filtered = posts.filter(p => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 pb-16">
          <button onClick={() => setSelectedPost(null)} className="text-primary text-sm mb-6 hover:underline">← Back to Blog</button>
          {selectedPost.image_url && (
            <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-6" />
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">{selectedPost.category}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(selectedPost.created_at).toLocaleDateString()}</span>
            <span>{selectedPost.author}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{selectedPost.title}</h1>
          <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedPost.content.replace(/\n/g, '<br />') }} />
          {selectedPost.tags && selectedPost.tags.length > 0 && (
            <div className="flex gap-2 mt-8 flex-wrap">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-3">Travel Blog & Guides</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Expert tips, destination guides, and travel stories from the heart of Northern Pakistan</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat!)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No articles found</p>
            <p className="text-sm mt-2">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                onClick={() => setSelectedPost(post)}
                className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <MapPin className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.ceil(post.content.length / 1000)} min read</span>
                  </div>
                  <h2 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center text-primary text-xs font-medium">
                    Read More <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
