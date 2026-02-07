import { useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { getBlogPost, blogPosts } from "@/data/blogPosts";
import { Bot, ArrowLeft, Clock, Tag, ChevronRight, User } from "lucide-react";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const post = getBlogPost(params.slug ?? "");

  useEffect(() => {
    if (!post) setLocation("/blog");
  }, [post, setLocation]);

  if (!post) return null;

  // Related posts (same category, different slug)
  const related = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  // SEO: Set document title and meta
  useEffect(() => {
    document.title = post.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", post.metaDescription);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = post.metaDescription;
      document.head.appendChild(meta);
    }
  }, [post]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0F]/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="w-7 h-7 text-amber-400" />
            <span className="font-[Space_Grotesk] font-bold text-lg">
              <span className="text-amber-400">BOT</span>HUB
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">Domů</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-amber-400 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white truncate max-w-[200px]">{post.title}</span>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="py-12 md:py-16">
        <div className="container max-w-3xl mx-auto">
          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Zpět na blog
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" /> {post.readTime} min čtení
            </span>
            <span className="text-xs text-gray-500">{post.publishedAt}</span>
          </div>

          {/* Title */}
          <h1 className="font-[Space_Grotesk] text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 pb-8 mb-8 border-b border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{post.author}</p>
              <p className="text-xs text-gray-500">{post.authorRole}</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-invert max-w-none
            prose-headings:font-[Space_Grotesk] prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-strong:text-amber-400
            prose-blockquote:border-amber-500/30 prose-blockquote:text-gray-400 prose-blockquote:italic
            prose-li:text-gray-300
            prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
          ">
            <Streamdown>{post.content}</Streamdown>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5"
              >
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-purple-500/5 p-8 text-center">
            <h3 className="font-[Space_Grotesk] text-xl font-bold mb-2">
              Připraveni zvýšit své konverze?
            </h3>
            <p className="text-gray-400 mb-4 text-sm">
              Vyzkoušejte iBoty zdarma a uvidíte výsledky za 5 minut.
            </p>
            <Link href="/">
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer">
                Vyzkoušet ZDARMA
              </button>
            </Link>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-12 border-t border-white/5">
          <div className="container max-w-3xl mx-auto">
            <h2 className="font-[Space_Grotesk] text-xl font-bold mb-6">
              Další články
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-amber-500/20 transition-all group"
                >
                  <span className="text-xs text-amber-400 mb-2 block">{r.category}</span>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2">{r.readTime} min · {r.publishedAt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container flex items-center justify-between">
          <p className="text-xs text-gray-600">© 2026 BOTHUB.cz</p>
          <Link href="/" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </footer>
    </div>
  );
}
