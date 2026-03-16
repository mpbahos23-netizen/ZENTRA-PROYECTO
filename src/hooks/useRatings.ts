import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================
// Hook: Submit a rating
// ============================================
export function useSubmitRating() {
  const [submitting, setSubmitting] = useState(false);

  const submitRating = useCallback(async (
    shipmentId: string,
    toUserId: string,
    score: number,
    comment: string = ''
  ) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Insert review (using existing reviews table)
      const { error } = await supabase
        .from('reviews')
        .insert({
          shipment_id: shipmentId,
          reviewer_id: user.id,
          reviewed_id: toUserId,
          rating: score,
          comment,
        });

      if (error) throw error;

      // Update profile average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_id', toUserId);

      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from('profiles')
          .update({
            rating: Math.round(avg * 10) / 10,
            total_reviews: reviews.length,
            updated_at: new Date().toISOString(),
          })
          .eq('id', toUserId);
      }

      toast.success('⭐ ¡Calificación enviada!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar calificación');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitRating, submitting };
}

// ============================================
// Hook: Get user rating
// ============================================
export function useUserRating(userId: string | null) {
  const [rating, setRating] = useState<{ avg: number; total: number } | null>(null);

  useState(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('rating, total_reviews')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setRating({ avg: Number(data.rating), total: data.total_reviews });
        }
      });
  });

  return rating;
}
