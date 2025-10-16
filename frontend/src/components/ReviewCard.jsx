import { Star, StarHalf } from "lucide-react";


export default function ReviewCard({ review, highlight = false }) {
  return (
    <div
      className={`relative border rounded-lg p-2 mb-1 shadow-sm bg-white ${highlight ? "border-indigo-500" : "border-gray-200"
        }`}
    >

      {/* Rating stars */}
      <div className="flex items-center gap-1 absolute right-2">
        {[...Array(5)].map((_, i) => {
          const full = i + 1 <= Math.floor(review.rating);
          const half = !full && i < review.rating;

          return full ? (
            <Star key={i} size={15} className="fill-yellow-400 text-yellow-400" />
          ) : half ? (
            <StarHalf key={i} size={15} className="fill-yellow-400 text-yellow-400" />
          ) : (
            <Star key={i} size={15} className="text-gray-300" />
          );
        })}
        {/* <span className="ml-1 text-sm text-gray-600">• {review.rating.toFixed(1)}/5</span> */}
      </div>

      <div className="flex items-center gap-3 mb-2">
        {/* Avartar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex items-center justify-center text-white text-lg">
          {review.user?.pfpImg ? (
            <img src={review.user.pfpImg} alt="User avatar" className="w-full h-full object-cover" />
          ) : (
            (review.user?.name?.[0] || "A").toUpperCase()
          )
          }
        </div>

        {/* Name */}
        <div>
          <p className="font-medium">{review.user?.name || "Anonymous"}</p>
          <p className="text-sm text-gray-500">
            {new Date(review.updatedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            •{" "}
            {new Date(review.updatedAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </div>
      </div>

      {/* Review */}
      <p className="text-gray-700">{review.description}</p>
    </div>
  );
}
