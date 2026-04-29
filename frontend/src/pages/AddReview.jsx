import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ADD_REVIEW } from '../graphql/mutations';
import { GET_GAME } from '../graphql/queries';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';

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

  const ratingLabel =
    formData.rating >= 9 ? 'Legendary'
    : formData.rating >= 7 ? 'Excellent'
    : formData.rating >= 5 ? 'Solid'
    : formData.rating >= 3 ? 'Mixed'
    : 'Rough';

  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        to={`/game/${id}`} 
        className="inline-flex items-center text-sm font-bold text-[var(--atlas-glow-soft)] hover:text-[var(--atlas-surface)] transition-colors uppercase tracking-widest gap-2 group mb-8"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Project
      </Link>

      <div className="atlas-panel overflow-hidden">
        <div className="atlas-panel-topper" />

        <div className="px-6 py-8 md:px-8 border-b border-[var(--atlas-line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(200,100,59,0.08))]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(166,57,18,0.18)] bg-[rgba(200,100,59,0.08)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--atlas-accent-deep)]">
                <Sparkles size={14} />
                Anonymous Review Desk
              </span>
              <div>
                <h1 className="atlas-display text-4xl text-[var(--atlas-ink)] leading-none">Add Your Verdict</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--atlas-surface)]/80">
                  Leave a sharp, anonymous take on this game. Score it with stars, then explain what landed or what missed.
                </p>
              </div>
            </div>

            <div className="atlas-info-block min-w-[160px]">
              <p className="text-[11px] uppercase tracking-[0.24em] font-bold text-[var(--atlas-glow-soft)]">Current score</p>
              <p className="atlas-display mt-2 text-4xl text-[var(--atlas-surface)]">{formData.rating}<span className="text-lg text-[var(--atlas-glow-soft)]">/10</span></p>
              <p className="mt-1 text-sm font-semibold text-[var(--atlas-accent-deep)]">{ratingLabel}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="rounded-[1.5rem] border border-[var(--atlas-line)] bg-[rgba(255,255,255,0.08)] p-4 text-sm leading-6 text-[var(--atlas-surface)]/78">
            Reviews are submitted anonymously. You can share feedback without displaying your identity.
          </div>

          {error && (
            <div className="rounded-2xl border border-[rgba(166,57,18,0.2)] bg-[rgba(230,114,57,0.08)] p-4 text-sm font-medium text-[#8b3417]">
              Error: {error.message}
            </div>
          )}

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-[var(--atlas-line)] bg-[rgba(255,253,248,0.84)] p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <label className="atlas-field-label">Star rating</label>
                  <h2 className="atlas-display mt-2 text-2xl text-[var(--atlas-ink)]">Make the stars mean something</h2>
                </div>
                <p className="text-sm text-[var(--atlas-surface)]/75">Tap a star to set a score from 1 to 10.</p>
              </div>

              <div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                  const active = num <= formData.rating;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: num }))}
                      className={`atlas-rating-star ${active ? 'atlas-rating-star-active' : ''}`}
                      aria-label={`Set rating to ${num} out of 10`}
                      aria-pressed={formData.rating === num}
                    >
                      <Star size={22} fill={active ? 'currentColor' : 'transparent'} />
                      <span className="text-[11px] font-bold">{num}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="atlas-field-label mb-3">
                Observation / Comment
              </label>
              <textarea
                required
                rows={6}
                className="atlas-input min-h-[180px] resize-y"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="What stood out: atmosphere, combat, pacing, story, performance, or anything players should know."
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--atlas-line)] flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="atlas-primary-button"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
