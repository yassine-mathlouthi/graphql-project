import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ADD_GAME } from '../graphql/mutations';
import { GET_GAMES, GET_STUDIOS } from '../graphql/queries';

export default function AddGame() {
  const navigate = useNavigate();
  const { data: studiosData, loading: studiosLoading } = useQuery(GET_STUDIOS);

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    studioId: '',
    genres: '',
    imageUrl: '',
  });

  const [addGame, { loading, error }] = useMutation(ADD_GAME, {
    refetchQueries: [{ query: GET_GAMES }],
    onCompleted: () => {
      navigate('/');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addGame({
      variables: {
        title: formData.title,
        year: parseInt(formData.year, 10),
        studioId: formData.studioId,
        genres: formData.genres.split(',').map(g => g.trim()).filter(Boolean),
        imageUrl: formData.imageUrl.trim() || null,
      }
    });
  };

  if (studiosLoading) return <div>Loading initial data...</div>;

  return (
    <div className="max-w-2xl mx-auto border border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Add New Project</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new game into the database schema.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            Error: {error.message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
              Title
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none transition-colors"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Release Year
              </label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none transition-colors"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Studio
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none bg-white transition-colors"
                value={formData.studioId}
                onChange={(e) => setFormData(prev => ({ ...prev, studioId: e.target.value }))}
              >
                <option value="" disabled>Select Studio...</option>
                {studiosData?.studios.map(studio => (
                  <option key={studio.id} value={studio.id}>
                    {studio.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
              Genres (Comma separated)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Action, RPG, Fantasy"
              className="w-full p-3 border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none transition-colors"
              value={formData.genres}
              onChange={(e) => setFormData(prev => ({ ...prev, genres: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 border border-gray-300 focus:border-gray-900 focus:ring-0 outline-none transition-colors"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            />
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-widest text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors uppercase tracking-widest text-sm"
          >
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
