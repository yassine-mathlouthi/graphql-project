import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GET_GAME } from '../graphql/queries';
import { REVIEW_ADDED } from '../graphql/subscriptions';
import { DELETE_GAME, UPDATE_GAME } from '../graphql/mutations';
import { ArrowLeft, Star, MessageSquare, Trash2, PencilLine, Save, X, Sparkles } from 'lucide-react';
import { useAuthSession } from '../auth/useAuthSession';

function getReviewTone(score) {
  if (score >= 9) return 'Legendary';
  if (score >= 7) return 'Excellent';
  if (score >= 5) return 'Solid';
  if (score >= 3) return 'Mixed';
  return 'Rough';
}

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
  const averageRating = game.reviews.length
    ? (game.reviews.reduce((sum, review) => sum + review.rating, 0) / game.reviews.length).toFixed(1)
    : null;

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
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <Link
          to="/"
          className="inline-flex items-center text-sm font-bold text-[var(--atlas-muted)] hover:text-[var(--atlas-surface)] transition-colors uppercase tracking-widest gap-2 group mb-8"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Index
        </Link>

        <div className="atlas-detail-hero mb-8">
          {game.imageUrl && (
            <img
              src={game.imageUrl}
              alt={game.title}
              className="w-full md:w-64 lg:w-80 rounded-[1.5rem] shadow-sm border border-[rgba(122,247,255,0.16)]"
            />
          )}

          <div className="flex-1 mt-0 md:mt-8">
            <h1 className="atlas-display text-4xl md:text-5xl font-black text-[var(--atlas-surface)] tracking-tighter mb-6">
              {game.title}
            </h1>

            {isAdmin && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode(prev => !prev)}
                  className="atlas-ghost-button"
                >
                  {editMode ? <X size={15} /> : <PencilLine size={15} />}
                  {editMode ? 'Cancel Edit' : 'Edit Record'}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,91,91,0.28)] bg-[rgba(255,91,91,0.08)] text-sm font-semibold text-[#ff8f8f] hover:bg-[#ff5b5b] hover:text-[#160e1f] hover:border-[#ff5b5b] transition-colors disabled:opacity-50"
                >
                  <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}

            {isAdmin && editMode && (
              <form onSubmit={handleUpdate} className="mb-6 border border-[var(--atlas-line)] rounded-[1.25rem] p-4 bg-[rgba(255,255,255,0.06)] backdrop-blur-sm space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--atlas-glow-soft)]">Admin Quick Update</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="atlas-input"
                    placeholder="Game title"
                  />
                  <input
                    type="number"
                    min="1970"
                    max="2100"
                    required
                    value={editForm.year}
                    onChange={e => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                    className="atlas-input"
                    placeholder="Release year"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="atlas-primary-button"
                >
                  <Save size={14} /> {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-4 items-center text-sm font-semibold text-[rgba(233,238,255,0.78)] bg-[rgba(255,255,255,0.06)] p-4 border-l-4 border-[var(--atlas-accent)] rounded-r-[1.25rem]">
              <span className="uppercase tracking-widest bg-[rgba(122,247,255,0.12)] border border-[rgba(122,247,255,0.16)] px-3 py-1 rounded-full text-[var(--atlas-glow)]">
                {game.year}
              </span>
              <span className="text-[var(--atlas-glow-soft)]">/</span>
              <span>{game.studio.name}</span>
              <span className="text-[var(--atlas-glow-soft)]">/</span>
              <div className="flex gap-1">{game.genres.join(', ')}</div>
            </div>
          </div>
        </div>

        <div className="atlas-panel overflow-hidden mb-8">
          <div className="atlas-panel-topper" />
          <div className="p-6 md:p-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(166,57,18,0.18)] bg-[rgba(200,100,59,0.08)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--atlas-accent-deep)]">
                <MessageSquare size={14} />
                Review Ledger
              </span>
              <div>
                <h2 className="atlas-display text-3xl text-[var(--atlas-ink)]">Community Reviews</h2>
                <p className="mt-2 text-sm text-[var(--atlas-muted)]">
                  A sharper view of how this game lands with players, from quick reactions to strong verdicts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:min-w-[280px]">
              <div className="atlas-info-block">
                <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[var(--atlas-muted)]">Average</p>
                <p className="atlas-display mt-2 text-4xl text-[var(--atlas-ink)]">{averageRating || '--'}<span className="text-lg text-[var(--atlas-muted)]">/10</span></p>
              </div>
              <div className="atlas-info-block">
                <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[var(--atlas-muted)]">Entries</p>
                <p className="atlas-display mt-2 text-4xl text-[var(--atlas-ink)]">{game.reviews.length}</p>
              </div>
            </div>
          </div>
        </div>

        {game.reviews.length === 0 ? (
          <div className="atlas-panel p-8 text-center text-[var(--atlas-muted)] font-medium italic">
            No audits available for this record.
          </div>
        ) : (
          <ul className="grid gap-4 md:gap-5">
            {game.reviews.map(review => (
              <li key={review.id} className="atlas-review-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="atlas-review-stars" aria-label={`${review.rating} out of 10 stars`}>
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i < review.rating ? 'currentColor' : 'transparent'}
                            className={i < review.rating ? 'text-[var(--atlas-accent)]' : 'text-[rgba(117,98,79,0.25)]'}
                          />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(200,100,59,0.1)] px-3 py-1 text-sm font-bold text-[var(--atlas-accent-deep)]">
                        <Sparkles size={14} />
                        {review.rating}/10
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--atlas-muted)]">
                        {getReviewTone(review.rating)}
                      </span>
                    </div>

                    <blockquote className="atlas-review-quote">
                      "{review.comment}"
                    </blockquote>
                  </div>
                  <span className="text-xs font-mono text-[var(--atlas-muted)] opacity-70">#{review.id}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-8 border-t border-[var(--atlas-line)]">
        <Link
          to={`/game/${game.id}/add-review`}
          className="atlas-primary-button"
        >
          Add Anonymous Review
        </Link>
      </div>
    </div>
  );
}
