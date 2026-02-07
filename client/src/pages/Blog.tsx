import { useState } from "react";
import { Link } from "wouter";
import { blogPosts } from "@/data/blogPosts";
import { Bot, ArrowRight, Clock, Tag, ChevronRight } from "lucide-react";

export default function Blog() {
  const categories = Array.from(new Set(blogPosts.map((p) => p.category)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? blogPosts.filter((p) => p.category === activeCategory)
    : blogPosts;

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
            <span className="text-white">Blog</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 md:py-20">
        <div className="container text-center">
          <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">
            Blog
          </span>
          <h1 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold mb-4">
            Novinky ze světa{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              AI chatbotů
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Tipy, strategie a případové studie pro maximální ROI s iBoty.
          </p>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
                !activeCategory
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-white/5 text-gray-400 border border-white/5 hover:border-white/10"
              }`}
            >
              Vše
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-white/5 text-gray-400 border border-white/5 hover:border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="pb-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-amber-500/20 transition-all duration-300"
              >
                {/* Gradient header */}
                <div className="h-40 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tag className="w-7 h-7 text-amber-400" />
                  </div>
                </div>

                <div className="p-6">
                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" /> {post.readTime} min
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{post.publishedAt}</span>
                    <span className="flex items-center gap-1 text-sm text-amber-400 group-hover:gap-2 transition-all">
                      Číst <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="container text-center">
          <h2 className="font-[Space_Grotesk] text-2xl font-bold mb-4">
            Připraveni vyzkoušet iBoty?
          </h2>
          <p className="text-gray-400 mb-6">
            Začněte zdarma a zvyšte své konverze o 42 %.
          </p>
          <Link href="/">
            <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer">
              Vyzkoušet ZDARMA
            </button>
          </Link>
        </div>
      </section>

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
