import { useState } from 'react';
import { Link } from 'react-router';
import { articles } from '../data/mockData';
import { FileText, TrendingUp, Target, Users, Calendar, Clock } from 'lucide-react';

type Category = 'all' | 'Tactical Analysis' | 'Scouting' | 'Data Analysis' | 'Transfer Analysis';

export function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const categories: Category[] = ['all', 'Tactical Analysis', 'Scouting', 'Data Analysis', 'Transfer Analysis'];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter((article) => article.category === selectedCategory);

  const categoryIcons: Record<string, any> = {
    'Tactical Analysis': Target,
    'Scouting': Users,
    'Data Analysis': TrendingUp,
    'Transfer Analysis': FileText,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">Football Analysis & Insights</h1>
        <p className="text-sm text-[#8B93A7]">Expert tactical breakdowns, scouting reports, and data-driven analysis</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category !== 'all' ? categoryIcons[category] : null;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-[#00D084] text-white'
                  : 'bg-[#141D2B] text-[#8B93A7] hover:text-white border border-[#1E2D3D] hover:border-[#00D084]'
              }`}
            >
              {Icon && <Icon className="size-4" />}
              {category === 'all' ? 'All Articles' : category}
            </button>
          );
        })}
      </div>

      {/* Featured Article */}
      {filteredArticles.length > 0 && selectedCategory === 'all' && (
        <Link
          to={`/news/${filteredArticles[0].id}`}
          className="block bg-[#141D2B] rounded-lg border border-[#1E2D3D] hover:border-[#00D084] transition-all overflow-hidden group"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div className="aspect-video lg:aspect-square overflow-hidden rounded-lg bg-[#0F1928]">
              <img
                src={filteredArticles[0].image}
                alt={filteredArticles[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-[#00D084]/10 text-[#00D084] rounded-full text-xs font-medium">
                  Featured
                </span>
                <span className="px-3 py-1 bg-[#141D2B] text-[#8B93A7] rounded-full text-xs">
                  {filteredArticles[0].category}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-[#00D084] transition-colors">
                {filteredArticles[0].title}
              </h2>
              <p className="text-[#8B93A7] mb-4 line-clamp-3">{filteredArticles[0].excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-[#8B93A7]">
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  {filteredArticles[0].author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  {new Date(filteredArticles[0].date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {filteredArticles[0].readTime}
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Articles Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">
            {selectedCategory === 'all' ? 'Latest Articles' : selectedCategory}
          </h2>
          <span className="text-sm text-[#8B93A7]">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.slice(selectedCategory === 'all' ? 1 : 0).map((article) => {
            const Icon = categoryIcons[article.category];
            return (
              <Link
                key={article.id}
                to={`/news/${article.id}`}
                className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] hover:border-[#00D084] transition-all overflow-hidden group"
              >
                <div className="aspect-video overflow-hidden bg-[#0F1928]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00D084]/10 text-[#00D084] rounded text-xs font-medium">
                      {Icon && <Icon className="size-3" />}
                      {article.category}
                    </span>
                    <span className="text-xs text-[#8B93A7]">{article.readTime}</span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-[#00D084] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#8B93A7] line-clamp-2 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[#8B93A7] pt-3 border-t border-[#1E2D3D]">
                    <span>{article.author}</span>
                    <span>
                      {new Date(article.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 bg-[#141D2B] rounded-lg border border-[#1E2D3D]">
          <FileText className="size-12 mx-auto text-[#8B93A7] mb-3" />
          <p className="text-[#8B93A7]">No articles found in this category</p>
        </div>
      )}

      {/* Categories Overview */}
      <div className="bg-[#141D2B] rounded-lg border border-[#1E2D3D] p-6">
        <h3 className="font-semibold mb-4">Browse by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Tactical Analysis', 'Scouting', 'Data Analysis', 'Transfer Analysis'] as const).map((cat) => {
            const Icon = categoryIcons[cat];
            const count = articles.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="bg-[#0F1928] rounded-lg p-4 border border-[#1E2D3D] hover:border-[#00D084] transition-all text-left group"
              >
                <Icon className="size-6 text-[#00D084] mb-2" />
                <div className="font-medium text-sm mb-1 group-hover:text-[#00D084] transition-colors">
                  {cat}
                </div>
                <div className="text-xs text-[#8B93A7]">{count} article{count !== 1 ? 's' : ''}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}