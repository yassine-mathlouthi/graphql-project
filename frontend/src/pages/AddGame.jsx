import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { ADD_GAME } from '../graphql/mutations';
import { GET_GAMES, GET_STUDIOS } from '../graphql/queries';
import { ShieldAlert } from 'lucide-react';
import { useAuthSession } from '../auth/useAuthSession';

export default function AddGame() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthSession();
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

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto atlas-panel overflow-hidden">
        <div className="atlas-panel-topper" />
        <div className="p-8 text-center space-y-4">
          <ShieldAlert size={34} className="mx-auto text-[var(--atlas-ink)]" />
          <h1 className="text-2xl font-black text-[var(--atlas-ink)] atlas-display">Admin Access Required</h1>
          <p className="text-[var(--atlas-muted)] max-w-md mx-auto">
            Only administrator accounts can add, update, or delete games. Open the session menu to register or sign in.
          </p>
          <Link
            to="/"
            className="atlas-ghost-button inline-flex items-center px-5 py-2.5"
          >
            Return to Games Index
          </Link>
        </div>
      </div>
    );
  }

  if (studiosLoading) return <div>Loading initial data...</div>;

  return (
    <div className="max-w-2xl mx-auto atlas-panel overflow-hidden">
      <div className="atlas-panel-topper" />
      <div className="p-6 border-b border-[var(--atlas-line)] bg-[linear-gradient(135deg,rgba(122,247,255,0.08),rgba(255,77,166,0.08))]">
        <h1 className="text-3xl font-bold text-[var(--atlas-ink)] atlas-display">Add New Game</h1>
        <p className="text-sm text-[var(--atlas-muted)] mt-1">Capture a new title, its studio, and the genre trail it belongs to.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-[rgba(230,114,57,0.08)] text-[#8b3417] border border-[rgba(166,57,18,0.2)] text-sm font-medium rounded-2xl">
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
              className="atlas-input"
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
                className="atlas-input"
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
                className="atlas-input"
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
              className="atlas-input"
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
              className="atlas-input"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            />
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[var(--atlas-line)] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 font-semibold text-[var(--atlas-muted)] hover:text-[var(--atlas-ink)] transition-colors uppercase tracking-widest text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="atlas-primary-button"
          >
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
