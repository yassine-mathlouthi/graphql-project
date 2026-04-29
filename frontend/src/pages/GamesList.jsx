import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_GAMES } from '../graphql/queries';
import {
  Calendar,
  Building,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from 'lucide-react';

export default function GamesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [genreCatalog, setGenreCatalog] = useState([]);
  const limit = 9; // Perfect for a 3-column grid layout

  const genre = selectedGenre === 'all' ? null : selectedGenre;

  const { data, loading, error, previousData } = useQuery(GET_GAMES, {
    variables: { page: currentPage, limit, genre, sortBy, order },
    fetchPolicy: 'cache-and-network',
  });

  // Use previousData while loading new pages to prevent flickering
  const currentData = data || previousData;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, sortBy, order]);

  useEffect(() => {
    if (!currentData?.games?.length) {
      return;
    }

    setGenreCatalog(prev => {
      const next = new Set(prev);
      currentData.games.forEach(game => {
        game.genres.forEach(genreName => next.add(genreName));
      });

      const sorted = Array.from(next).sort((a, b) => a.localeCompare(b));
      if (sorted.length === prev.length && sorted.every((name, index) => name === prev[index])) {
        return prev;
      }

      return sorted;
    });
  }, [currentData?.games]);

  if (loading && !currentData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-44 bg-gray-200 border border-gray-300 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded">
        <strong>Error: </strong> {error.message}
      </div>
    );
  }

  const { games, gameCount } = currentData;
  const totalPages = Math.ceil(gameCount / limit);

  return (
    <div className="space-y-8 pb-10">
      <section className="atlas-hero-panel overflow-hidden">
        <div className="atlas-hero-grid" />
        <div className="relative p-6 md:p-8 lg:p-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="atlas-kicker">
              <Sparkles size={14} />
              Live Gaming Archive
            </span>
            <div>
              <h1 className="atlas-display text-4xl md:text-5xl lg:text-6xl text-[var(--atlas-ink)] leading-[0.92]">
                Discover worlds, studios, and player verdicts in one arena.
              </h1>
              <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-[var(--atlas-muted)]">
                Atlas now feels like a game vault: browse standout releases, filter by genre, and dive into live community reviews with a stronger arcade-catalog energy.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:min-w-[320px]">
            <div className="atlas-stat-card">
              <p className="atlas-stat-label">Visible now</p>
              <p className="atlas-stat-value">{games.length}</p>
            </div>
            <div className="atlas-stat-card">
              <p className="atlas-stat-label">In archive</p>
              <p className="atlas-stat-value">{gameCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="atlas-panel relative overflow-hidden">
        <div className="atlas-panel-topper" />
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--atlas-muted)]">
              <SlidersHorizontal size={14} /> Refine View
            </span>
            <h2 className="text-lg font-bold text-[var(--atlas-ink)]">Filter and Sort Games</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--atlas-muted)]">Genre</span>
              <select
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                className="atlas-select-control"
              >
                <option value="all">All genres</option>
                {genreCatalog.map(genreName => (
                  <option key={genreName} value={genreName}>
                    {genreName}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--atlas-muted)]">Sort by</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="atlas-select-control"
              >
                <option value="title">Title</option>
                <option value="year">Year</option>
              </select>
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--atlas-muted)]">Direction</span>
              <div className="flex items-center gap-2 rounded-[1rem] border border-[var(--atlas-line)] bg-[rgba(255,255,255,0.56)] p-1">
                <button
                  type="button"
                  onClick={() => setOrder('asc')}
                  className={`h-9 px-3 rounded flex items-center gap-1 text-sm font-semibold transition-colors ${
                    order === 'asc'
                      ? 'bg-[var(--atlas-ink)] text-[var(--atlas-surface)] shadow-sm'
                      : 'text-[var(--atlas-muted)] hover:bg-[rgba(200,100,59,0.08)]'
                  }`}
                >
                  <ArrowUp size={15} /> Up
                </button>
                <button
                  type="button"
                  onClick={() => setOrder('desc')}
                  className={`h-9 px-3 rounded flex items-center gap-1 text-sm font-semibold transition-colors ${
                    order === 'desc'
                      ? 'bg-[var(--atlas-ink)] text-[var(--atlas-surface)] shadow-sm'
                      : 'text-[var(--atlas-muted)] hover:bg-[rgba(200,100,59,0.08)]'
                  }`}
                >
                  <ArrowDown size={15} /> Down
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedGenre('all');
                setSortBy('title');
                setOrder('asc');
              }}
              className="atlas-ghost-button h-11 px-4 self-end"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <Link 
            key={game.id} 
            to={`/game/${game.id}`}
            className="group atlas-game-card flex flex-col"
          >
            {game.imageUrl ? (
              <img 
                src={game.imageUrl} 
                alt={game.title} 
                className="w-full aspect-[4/3] object-cover border-b border-[rgba(255,255,255,0.08)]"
              />
            ) : (
              <div className="w-full aspect-[4/3] atlas-game-card-fallback">
                <div className="text-center">
                  <Trophy size={28} className="mx-auto mb-3 text-[var(--atlas-accent)]" />
                  <span className="text-sm font-semibold uppercase tracking-widest text-[var(--atlas-muted)]">No Key Art</span>
                </div>
              </div>
            )}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-[var(--atlas-surface)] group-hover:text-[var(--atlas-glow)] transition-colors">
                    {game.title}
                  </h2>
                  <span className="atlas-game-card-arrow shrink-0 ml-2">
                    <ChevronRight size={18} />
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 text-sm text-[rgba(234,239,255,0.76)]">
                  <span className="flex items-center gap-2 font-medium">
                    <Calendar size={16} className="text-[var(--atlas-accent)]" /> {game.year}
                  </span>
                  <span className="flex items-center gap-2 font-medium">
                    <Building size={16} className="text-[var(--atlas-accent)]" /> {game.studio.name}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {game.genres.map(genre => (
                  <span 
                    className="atlas-genre-chip"
                    key={genre}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6 border-t border-[var(--atlas-line)]">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="atlas-page-button px-3"
          >
            <ChevronLeft size={18} /> Prev
          </button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-10 h-10 flex items-center justify-center border font-semibold rounded transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-[var(--atlas-accent)] text-[#160e1f] border-[var(--atlas-accent)] shadow-[0_0_18px_rgba(122,247,255,0.22)]'
                      : 'bg-[rgba(255,255,255,0.58)] text-[var(--atlas-muted)] border-[var(--atlas-line)] hover:bg-[rgba(122,247,255,0.08)]'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="atlas-page-button px-3"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
