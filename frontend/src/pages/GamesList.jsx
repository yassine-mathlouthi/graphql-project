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
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Database Index</h1>
          <p className="text-gray-500 mt-1">Listing all available projects from the current schema.</p>
        </div>
        <div className="text-sm font-semibold text-gray-500">
          Showing {games.length} of {gameCount} record(s) 
        </div>
      </div>

      <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900" />
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              <SlidersHorizontal size={14} /> Refine View
            </span>
            <h2 className="text-lg font-bold text-gray-900">Filter and Sort Projects</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Genre</span>
              <select
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                className="min-w-[170px] h-11 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-shadow"
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
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sort by</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="min-w-[170px] h-11 px-3 border border-gray-300 rounded-md bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-shadow"
              >
                <option value="title">Title</option>
                <option value="year">Year</option>
              </select>
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Direction</span>
              <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setOrder('asc')}
                  className={`h-9 px-3 rounded flex items-center gap-1 text-sm font-semibold transition-colors ${
                    order === 'asc'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowUp size={15} /> Up
                </button>
                <button
                  type="button"
                  onClick={() => setOrder('desc')}
                  className={`h-9 px-3 rounded flex items-center gap-1 text-sm font-semibold transition-colors ${
                    order === 'desc'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-200'
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
              className="h-11 px-4 self-end border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
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
            className="group block border border-gray-200 bg-white hover:border-gray-900 hover:shadow-[4px_4px_0_0_#111827] transition-all flex flex-col"
          >
            {game.imageUrl ? (
              <img 
                src={game.imageUrl} 
                alt={game.title} 
                className="w-full aspect-[4/3] object-cover border-b border-gray-200"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center border-b border-gray-200 text-gray-400">
                <span className="text-sm font-semibold uppercase tracking-widest">No Image</span>
              </div>
            )}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:underline decoration-2 underline-offset-4">
                    {game.title}
                  </h2>
                  <span className="p-1 rounded bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors shrink-0 ml-2">
                    <ChevronRight size={18} />
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-2 font-medium">
                    <Calendar size={16} className="text-gray-400" /> {game.year}
                  </span>
                  <span className="flex items-center gap-2 font-medium">
                    <Building size={16} className="text-gray-400" /> {game.studio.name}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {game.genres.map(genre => (
                  <span 
                    className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-800 uppercase tracking-widest"
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
        <div className="flex justify-center items-center gap-2 pt-6 border-t border-gray-200">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-2 flex items-center gap-1 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
            className="p-2 flex items-center gap-1 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
