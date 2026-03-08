import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Eye, EyeOff, Pencil, Image, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ImageUpload from '@/components/common/ImageUpload';

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
  is_published: boolean | null;
  views: number;
  created_at: string;
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'guide', tags: '', author: 'Indus Tours', is_published: false });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) { toast({ title: "Title and content required", variant: "destructive" }); return; }
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = { ...form, slug, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };

    if (editingPost) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editingPost.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Post updated!" });
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Post created!" });
    }
    setShowForm(false);
    setEditingPost(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'guide', tags: '', author: 'Indus Tours', is_published: false });
    fetchPosts();
  };

  const togglePublish = async (post: BlogPost) => {
    await supabase.from('blog_posts').update({ is_published: !post.is_published }).eq('id', post.id);
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    await supabase.from('blog_posts').delete().eq('id', id);
    toast({ title: "Post deleted" });
    fetchPosts();
  };

  const editPost = (post: BlogPost) => {
    setEditingPost(post);
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content, image_url: post.image_url || '', category: post.category || 'guide', tags: (post.tags || []).join(', '), author: post.author || 'Indus Tours', is_published: post.is_published || false });
    setShowForm(true);
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Blog Posts ({posts.length})</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingPost(null); setForm({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'guide', tags: '', author: 'Indus Tours', is_published: false }); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Post title" className="w-full bg-muted rounded-lg px-4 py-2 text-sm outline-none" />
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="URL slug (auto-generated)" className="w-full bg-muted rounded-lg px-4 py-2 text-sm outline-none" />
            <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Short excerpt" className="w-full bg-muted rounded-lg px-4 py-2 text-sm outline-none" />
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Full content..." rows={8} className="w-full bg-muted rounded-lg px-4 py-2 text-sm outline-none resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-muted rounded-lg px-4 py-2 text-sm outline-none">
                <option value="guide">Guide</option>
                <option value="tips">Tips</option>
                <option value="story">Story</option>
                <option value="news">News</option>
                <option value="culture">Culture</option>
              </select>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="bg-muted rounded-lg px-4 py-2 text-sm outline-none" />
            </div>
            <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} label="Cover Image" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
                Publish immediately
              </label>
              <button onClick={handleSubmit} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium ml-auto">
                {editingPost ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {posts.map(post => (
          <Card key={post.id} className="border-0 shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              {post.image_url && <img src={post.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Badge className={`text-[10px] ${post.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'} border-0`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.views} views</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => togglePublish(post)} className="p-2 hover:bg-muted rounded-lg" title={post.is_published ? 'Unpublish' : 'Publish'}>
                  {post.is_published ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                </button>
                <button onClick={() => editPost(post)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4 text-blue-400" /></button>
                <button onClick={() => deletePost(post.id)} className="p-2 hover:bg-muted rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
