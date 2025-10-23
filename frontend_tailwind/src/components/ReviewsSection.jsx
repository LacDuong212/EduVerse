import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Button } from "@/components/ui/button";
import ReviewCard from "./ReviewCard";


export default function ReviewsSection({ courseId }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [userReviews, setUserReviews] = useState([]);
  const [othersReviews, setOthersReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchReviews = async (page = 1, limit = 5) => {
    setLoading(true);
    try {
      let res = [];
      if (isLoggedIn) {
        res = await axios.get(`${backendUrl}/api/reviews/user/${courseId}?page=${page}&limit=${limit}`,
          { withCredentials: true }
        );
      } else {
        res = await axios.get(`${backendUrl}/api/reviews/${courseId}?page=${page}&limit=${limit}`);
      }

      if (res.data.success) {
        setUserReviews(res.data.userReviews || []);
        setOthersReviews(res.data.othersReviews || []);
        setPagination(res.data.pagination || { page: 1, pages: 1 });
      }
    } catch (err) {
      console.error("Error fetching reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchReviews(1);
  }, [courseId]);

  return (
    <section id="reviews" className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Student Reviews</h2>

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : (
        <>
          {/* Logged-in user */}
          {isLoggedIn ? (
            <>
              {/* Your review(s) */}
              {userReviews.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Your Review</h3>
                  {userReviews.map((r) => (
                    <ReviewCard key={r._id} review={r} highlight />
                  ))}
                </div>
              )}

              {/* Other reviews */}
              {/* #TODO?: report user */}
              {othersReviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Others' Reviews</h3>
                  {othersReviews.map((r) => (
                    <ReviewCard key={r._id} review={r} />
                  ))}
                </div>
              )}
            </>
          ) : (
            // Guest view: show others only, no headings
            <>
              {othersReviews.length > 0 ? (
                <div className="space-y-4">
                  {othersReviews.map((r) => (
                    <ReviewCard key={r._id} review={r} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => fetchReviews(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchReviews(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
