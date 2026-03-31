import { useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { GET_GAME } from '../graphql/queries';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';

export default function GameDetails() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_GAME, {
    variables: { id }
  });

  if (loading) return <div>Loading records...</div>;
  if (error) return <div>Error retrieving data: {error.message}</div>;

  const { game } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest gap-2 group mb-8"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Index
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          {game.imageUrl && (
            <img
              src={game.imageUrl}
              alt={game.title} 
              className="w-full md:w-64 lg:w-80 rounded-lg shadow-sm border border-gray-200"
            />
          )}

          <div className="flex-1 mt-0 md:mt-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-6">
              {game.title}
            </h1>

            <div className="flex flex-wrap gap-4 items-center text-sm font-semibold text-gray-700 bg-gray-100 p-4 border-l-4 border-gray-900">
              <span className="uppercase tracking-widest bg-white border border-gray-200 px-3 py-1">
                {game.year}
              </span>
              <span className="text-gray-400">/</span>
              <span>{game.studio.name}</span>
              <span className="text-gray-400">/</span>
              <div className="flex gap-1">
                {game.genres.join(', ')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
            <MessageSquare size={24} />
            Performance Reviews
          </h2>
          <span className="text-sm font-mono text-gray-500">
            Records: {game.reviews.length}
          </span>
        </div>
        
        {game.reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium italic">
            No audits available for this record.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {game.reviews.map(review => (
              <li key={review.id} className="p-6 transition-colors hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex text-yellow-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          fill={i < review.rating ? "currentColor" : "transparent"} 
                          className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <p className="text-gray-800 leading-relaxed font-medium">
                      "{review.comment}"
                    </p>
                  </div>
                  <span className="text-xs font-mono text-gray-400">#{review.id}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-8 border-t border-gray-200">
        <Link 
          to={`/game/${game.id}/add-review`}
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-colors uppercase tracking-widest text-sm"
        >
          Add New Review
        </Link>
      </div>
    </div>
  );
}
