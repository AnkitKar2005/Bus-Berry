import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewFormProps {
  bookingId: string;
  busId: string;
  operatorId: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ bookingId, busId, operatorId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to submit a review");
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          user_id: user.id,
          bus_id: busId,
          operator_id: operatorId,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      if (error.code === '23505') {
        toast.error("You have already reviewed this booking");
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;