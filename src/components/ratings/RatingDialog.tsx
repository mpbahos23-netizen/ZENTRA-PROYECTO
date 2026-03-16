import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { useSubmitRating } from '@/hooks/useRatings';

interface RatingDialogProps {
  shipmentId: string;
  toUserId: string;
  toUserName: string;
  onComplete?: () => void;
}

export default function RatingDialog({
  shipmentId,
  toUserId,
  toUserName,
  onComplete,
}: RatingDialogProps) {
  const [score, setScore] = useState(0);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { submitRating, submitting } = useSubmitRating();

  const handleSubmit = async () => {
    if (score === 0) return;
    const success = await submitRating(shipmentId, toUserId, score, comment);
    if (success) {
      setSubmitted(true);
      onComplete?.();
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-10 text-center max-w-sm mx-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">¡Gracias por tu calificación!</h3>
          <p className="text-zinc-400 text-sm">Tu feedback ayuda a mejorar la plataforma.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-sm mx-4 w-full">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-1">Califica a {toUserName}</h3>
          <p className="text-sm text-zinc-400">¿Cómo fue tu experiencia?</p>
        </div>

        {/* Star Selector */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onClick={() => setScore(s)}
              onMouseEnter={() => setHoveredScore(s)}
              onMouseLeave={() => setHoveredScore(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  s <= (hoveredScore || score)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-600'
                }`}
              />
            </button>
          ))}
        </div>

        {score > 0 && (
          <p className="text-center text-sm font-medium text-amber-400 mb-4">
            {score === 1 && 'Malo'}
            {score === 2 && 'Regular'}
            {score === 3 && 'Bueno'}
            {score === 4 && 'Muy bueno'}
            {score === 5 && '¡Excelente!'}
          </p>
        )}

        {/* Comment */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <label className="text-xs font-bold text-zinc-500 uppercase">Comentario (opcional)</label>
          </div>
          <textarea
            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm resize-none h-20 focus:ring-1 focus:ring-[#00e5ff] outline-none"
            placeholder="Comparte tu experiencia..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={score === 0 || submitting}
          className="w-full h-12 bg-[#00e5ff] hover:bg-[#00cce6] text-black font-bold rounded-xl"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Enviar Calificación'
          )}
        </Button>
      </div>
    </div>
  );
}
