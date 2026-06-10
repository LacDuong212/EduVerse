import { Button, Card, CardBody, Spinner } from "react-bootstrap";
import { FaHeart, FaPlay, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GlightBox from "@/components/GlightBox";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";
import useVideoStream from "@/hooks/useVideoStream";
import { addToWishlist, removeFromWishlist } from "@/redux/wishlistSlice";
import { formatCurrency } from "@/utils/currency";

const VideoPlayButton = ({ videoId }) => {
  const { streamUrl, loading, error } = useVideoStream(videoId);

  if (!videoId) return null;

  if (loading) {
    return (
      <div className="bg-light bg-opacity-10 bg-blur rounded-circle p-3 position-static flex-centered">
        <Spinner animation="border" size="sm" className="text-primary" style={{ width: "25px", height: "25px" }} />
      </div>
    );
  }

  if (error) {
    return (
      <Button
        variant="danger"
        size="lg"
        className="btn-round mb-0 position-static flex-centered"
        onClick={() => toast.error("Unable to play preview video..")}
      >
        <MdError size={30} />
      </Button>
    );
  }

  return (
    <div className="bg-light bg-opacity-50 rounded-circle">
      <GlightBox
        data-glightbox
        data-gallery={`previewVideo`}
        href={streamUrl}
        className="btn btn-lg btn-round btn-primary-soft mb-0 position-static flex-centered"
      >
        <FaPlay className="me-0" size={20} />
      </GlightBox>
    </div>
  );
};

const PricingCard = ({ course, owned, onAddToCart }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    courseId,
    thumbnail,
    image,
    previewVideo,
    price,
    enableDiscount,
    discountPrice,
  } = course || {};

  const { userData } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  const videoThumbnail = thumbnail || image || DEFAULT_COURSE_IMG;

  const original = Number(price ?? 0);
  const sale = Number(discountPrice ?? original);
  const percent =
    original > 0 && sale < original
      ? Math.round(((original - sale) / original) * 100)
      : 0;

  const isWishlisted = wishlistItems.some((item) => {
    return item.courseId === courseId;
  });

  const showCurriculum = () => {
    if (owned) {
      navigate(`/student/courses/${courseId || ""}`);
    } else {
      setActiveKey?.("curriculum");
    }
  }

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userData?.userId) {
      toast.info("Please login to add to wishlist!");
      return;
    }

    if (userData?.role === "instructor") {
      toast.warning("You cannot perform this action.");
      return;
    }

    if (!courseId) {
      toast.error("Unable to get course info..");
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist({ courseId })).unwrap();
        toast.success("Removed from wishlist!");
      } else {
        await dispatch(addToWishlist({ courseId })).unwrap();
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
      toast.error(typeof error === "string" ? error : "Something went wrong..");
    }
  };

  return (
    <Card className="shadow p-3 mb-4 rounded-3 z-index-9">
      <div className="overflow-hidden rounded-2">
        <img src={videoThumbnail} alt="Thumbnail" onError={(e) => e.target.src = DEFAULT_COURSE_IMG} />
        <div className="bg-overlay bg-dark opacity-4" />
        <div className="card-img-overlay d-flex flex-column">
          <div className="m-auto">
            <VideoPlayButton videoId={previewVideo || ""} />
          </div>
        </div>
      </div>

      <CardBody className="mt-3 px-0 py-0">
        {enableDiscount ? (
          <div>
            <div className="text-decoration-line-through text-end">
              {formatCurrency(original)}
            </div>
            <div className="d-flex justify-content-between align-items-center">
              {percent > 0 && (
                <div className="badge text-bg-orange">
                  {percent}% off
                </div>
              )}
              <div className="h3 mb-0">
                {formatCurrency(sale)}
              </div>
            </div>
          </div>
        ) : price === 0 ? (
          <div className="text-end">
            <span className="h5 bg-orange text-white mb-0 px-3 py-1 rounded">Free</span>
          </div>
        ) : (
          <div className="h3 mb-0 text-end">
            {formatCurrency(sale)}
          </div>
        )}
      </CardBody>

      <div className="mt-3">
        {owned ? (
          <Button
            variant="primary"
            className="w-100 mb-0"
            onClick={showCurriculum}
          >
            Continue Learning
          </Button>
        ) : userData?.role !== "instructor" && (
          <div className="d-flex gap-2 w-100">
            <Button
              variant={isWishlisted ? "danger" : "outline-danger"}
              onClick={handleWishlistToggle}
              className="d-flex align-items-center justify-content-center px-2 mb-0 rounded-3 border-2"
              style={{ width: 45 }}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {isWishlisted ? <FaHeart size={18} className="flex-shrink-0" /> : <FaRegHeart size={18} className="flex-shrink-0" />}
            </Button>
            
            <Button
              variant="success"
              className="w-100 mb-0 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3"
              onClick={onAddToCart}
            >
              <FaShoppingCart size={18} className="flex-shrink-0 mb-1" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PricingCard;