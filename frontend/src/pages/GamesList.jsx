import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_GAMES } from '../graphql/queries';
import { Calendar, Building, ChevronRight, Hash } from 'lucide-react';

export default function GamesList() {
  const { data, loading, error } = useQuery(GET_GAMES);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Database Index</h1>
          <p className="text-gray-500 mt-1">Listing all available projects from the current schema.</p>
        </div>
        <div className="text-sm font-semibold text-gray-500">
          {data.games.length} record(s) 
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.games.map(game => (
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
    </div>
  );
}
