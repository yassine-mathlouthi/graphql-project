import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GET_GAME } from '../graphql/queries';
import { REVIEW_ADDED } from '../graphql/subscriptions';
import { DELETE_GAME, UPDATE_GAME } from '../graphql/mutations';
import { ArrowLeft, Star, MessageSquare, Trash2, PencilLine, Save, X } from 'lucide-react';
import { useAuthSession } from '../auth/useAuthSession';

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthSession();
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', year: '' });

  const { data, loading, error, subscribeToMore } = useQuery(GET_GAME, {
    variables: { id },
  });

  const [deleteGame, { loading: deleting }] = useMutation(DELETE_GAME, {
    onCompleted: () => {
      navigate('/');
    },
  });

  const [updateGame, { loading: updating }] = useMutation(UPDATE_GAME);

  useEffect(() => {
    if (!data?.game) {
      return;
    }

    setEditForm({ title: data.game.title, year: data.game.year });
  }, [data?.game]);

  useEffect(() => {
    if (!data?.game) {
      return undefined;
    }

    const unsubscribe = subscribeToMore({
      document: REVIEW_ADDED,
      variables: { gameId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newReview = subscriptionData.data.reviewAdded;

        if (prev.game.reviews.find(review => review.id === newReview.id)) {
          return prev;
        }

        return {
          ...prev,
          game: {
            ...prev.game,
            reviews: [...prev.game.reviews, newReview],
          },
        };
      },
    });

    return () => unsubscribe();
  }, [data?.game, id, subscribeToMore]);

  if (loading) return <div>Loading records...</div>;
  if (error) return <div>Error retrieving data: {error.message}</div>;

  const { game } = data;

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this game and all its reviews? This cannot be undone.');
    if (!confirmed) return;
    await deleteGame({ variables: { id: game.id } });
  };

  const handleUpdate = async e => {
    e.preventDefault();

    await updateGame({
      variables: {
        id: game.id,
        title: editForm.title.trim(),
        year: Number(editForm.year),
      },
      refetchQueries: [{ query: GET_GAME, variables: { id: game.id } }],
    });

    setEditMode(false);
  };

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

            {isAdmin && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode(prev => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:border-gray-900 transition-colors"
                >
                  {editMode ? <X size={15} /> : <PencilLine size={15} />}
                  {editMode ? 'Cancel Edit' : 'Edit Record'}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-sm font-semibold text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}

            {isAdmin && editMode && (
              <form onSubmit={handleUpdate} className="mb-6 border border-gray-200 rounded-md p-4 bg-white space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Admin Quick Update</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full h-11 px-3 border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                    placeholder="Game title"
                  />
                  <input
                    type="number"
                    min="1970"
                    max="2100"
                    required
                    value={editForm.year}
                    onChange={e => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full h-11 px-3 border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                    placeholder="Release year"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <Save size={14} /> {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-4 items-center text-sm font-semibold text-gray-700 bg-gray-100 p-4 border-l-4 border-gray-900">
              <span className="uppercase tracking-widest bg-white border border-gray-200 px-3 py-1">
                {game.year}
              </span>
              <span className="text-gray-400">/</span>
              <span>{game.studio.name}</span>
              <span className="text-gray-400">/</span>
              <div className="flex gap-1">{game.genres.join(', ')}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
            <MessageSquare size={24} />
            Performance Reviews
          </h2>
          <span className="text-sm font-mono text-gray-500">Records: {game.reviews.length}</span>
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
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex text-yellow-500">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < review.rating ? 'currentColor' : 'transparent'}
                            className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{review.rating}/10</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed font-medium">"{review.comment}"</p>
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
          Add Anonymous Review
        </Link>
      </div>
    </div>
  );
}
