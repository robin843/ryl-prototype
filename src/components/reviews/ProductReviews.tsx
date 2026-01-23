import { useState, useEffect } from "react";
import { Star, ShieldCheck, User, ChevronDown } from "lucide-react";
import { StarRating } from "./StarRating";
import { WriteReviewSheet } from "./WriteReviewSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
}

interface ReviewStats {
  review_count: number;
  average_rating: number;
  verified_count: number;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      // Fetch reviews with user profiles
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("product_reviews")
        .select(`
          id,
          rating,
          title,
          body,
          is_verified_purchase,
          created_at,
          user_id
        `)
        .eq("product_id", productId)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch user profiles for display names
      if (reviewsData && reviewsData.length > 0) {
        const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
        const { data: profilesData } = await supabase
          .from("public_profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        const profilesMap = new Map(
          profilesData?.map((p) => [p.user_id, p]) || []
        );

        const enrichedReviews = reviewsData.map((review) => ({
          ...review,
          display_name: profilesMap.get(review.user_id)?.display_name,
          avatar_url: profilesMap.get(review.user_id)?.avatar_url,
        }));

        setReviews(enrichedReviews);

        // Check if current user has reviewed
        if (user) {
          setHasUserReviewed(enrichedReviews.some((r) => r.user_id === user.id));
        }
      } else {
        setReviews([]);
      }

      // Fetch stats from view
      const { data: statsData } = await supabase
        .from("product_review_stats")
        .select("*")
        .eq("product_id", productId)
        .single();

      if (statsData) {
        setStats({
          review_count: Number(statsData.review_count),
          average_rating: Number(statsData.average_rating),
          verified_count: Number(statsData.verified_count),
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, user]);

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-caption text-muted-foreground">BEWERTUNGEN</h2>
        {user && !hasUserReviewed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWriteReview(true)}
            className="text-gold hover:text-gold/80"
          >
            <Star className="w-4 h-4 mr-1" />
            Bewerten
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      {stats && stats.review_count > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              {stats.average_rating.toFixed(1)}
            </p>
            <StarRating rating={stats.average_rating} size="sm" />
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            <p>{stats.review_count} Bewertung{stats.review_count !== 1 && "en"}</p>
            {stats.verified_count > 0 && (
              <p className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                {stats.verified_count} verifiziert
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Reviews State */}
      {reviews.length === 0 && (
        <div className="text-center py-8 px-4 rounded-xl bg-card/50 border border-border/30">
          <Star className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Noch keine Bewertungen
          </p>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWriteReview(true)}
            >
              Erste Bewertung schreiben
            </Button>
          )}
        </div>
      )}

      {/* Review List */}
      {displayedReviews.length > 0 && (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-xl bg-card/50 border border-border/30"
            >
              {/* Review Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {review.avatar_url ? (
                    <img
                      src={review.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">
                      {review.display_name || "Anonymer Nutzer"}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Verifizierter Kauf
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <p className="font-medium text-sm text-foreground mb-1">
                  {review.title}
                </p>
              )}
              {review.body && (
                <p className="text-sm text-foreground/80">{review.body}</p>
              )}
            </div>
          ))}

          {/* Show More Button */}
          {reviews.length > 3 && !showAll && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowAll(true)}
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Alle {reviews.length} Bewertungen anzeigen
            </Button>
          )}
        </div>
      )}

      {/* Write Review Sheet */}
      <WriteReviewSheet
        isOpen={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        productId={productId}
        productName={productName}
        onSuccess={fetchReviews}
      />
    </div>
  );
}
