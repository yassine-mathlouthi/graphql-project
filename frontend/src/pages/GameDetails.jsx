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
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
          {game.title}
        </h1>
        
        <div className="flex gap-4 items-center mt-6 text-sm font-semibold text-gray-700 bg-gray-100 p-4 border-l-4 border-gray-900">
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

      <div className="border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-gray-400" />
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
