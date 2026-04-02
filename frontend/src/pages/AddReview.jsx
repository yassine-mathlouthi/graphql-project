import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ADD_REVIEW } from '../graphql/mutations';
import { GET_GAME } from '../graphql/queries';
import { ArrowLeft } from 'lucide-react';

export default function AddReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  const [addReview, { loading, error }] = useMutation(ADD_REVIEW, {
    refetchQueries: [{ query: GET_GAME, variables: { id } }],
    onCompleted: () => {
      navigate(`/game/${id}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addReview({
      variables: {
        gameId: id,
        rating: parseInt(formData.rating, 10),
        comment: formData.comment,
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        to={`/game/${id}`} 
        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest gap-2 group mb-8"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Project
      </Link>

      <div className="border border-gray-200 bg-white">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">Add Performance Review</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-3 border border-gray-200 bg-gray-50 text-sm text-gray-700">
            Reviews are submitted anonymously. You can share feedback without displaying your identity.
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
              Error: {error.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Rating (1-5)
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none bg-white transition-colors"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Observation / Comment
              </label>
              <textarea
                required
                rows={4}
                className="w-full p-3 border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none transition-colors resize-y"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gray-900 text-white font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors uppercase tracking-widest text-sm"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
