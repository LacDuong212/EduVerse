import { Button, Card, CardBody, Spinner } from "react-bootstrap";
import { FaPlay } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { toast } from "react-toastify";
import GlightBox from "@/components/GlightBox";
import { DEFAULT_COURSE_IMG } from "@/context/constants";
import useVideoStream from "@/hooks/useVideoStream";
import { formatCurrency } from "@/utils/currency";

const VideoPlayButton = ({ videoId }) => {
  const { streamUrl, loading, error } = useVideoStream(videoId);

  if (!videoId) return null;

  if (loading) {
    return (
      <div className="bg-light bg-opacity-10 bg-blur rounded-circle p-3 position-static flex-centered">
        <Spinner
          animation="border"
          size="sm"
          className="text-primary"
          style={{ width: "25px", height: "25px" }}
        />
      </div>
    );
  }

  if (error || !streamUrl) {
    return (
      <Button
        variant="danger"
        size="lg"
        className="btn-round mb-0 position-static flex-centered"
        onClick={() => toast.error("Unable to play preview video.")}
      >
        <MdError size={30} />
      </Button>
    );
  }

  return (
    <div className="bg-light bg-opacity-50 rounded-circle">
      <GlightBox
        data-glightbox
        data-gallery="previewVideo"
        href={streamUrl}
        className="btn btn-lg btn-round btn-primary-soft mb-0 position-static flex-centered"
      >
        <FaPlay className="me-0" size={20} />
      </GlightBox>
    </div>
  );
};

const PricingCard = ({ course }) => {
  const {
    thumbnail,
    image,
    previewVideo,
    price,
    enableDiscount,
    discountPrice,
  } = course || {};

  const videoThumbnail = thumbnail || image || DEFAULT_COURSE_IMG;

  const original = Number(price ?? 0);
  const sale = Number(discountPrice ?? original);

  const percent =
    original > 0 && sale < original
      ? Math.round(((original - sale) / original) * 100)
      : 0;

  return (
    <Card className="shadow p-3 mb-4 rounded-3 z-index-9">
      <div className="overflow-hidden rounded-2 position-relative">
        <img
          src={videoThumbnail}
          alt="Thumbnail"
          onError={(e) => {
            e.target.src = DEFAULT_COURSE_IMG;
          }}
        />

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
        ) : original === 0 ? (
          <div className="text-end">
            <span className="h5 bg-orange text-white mb-0 px-3 py-1 rounded">
              Free
            </span>
          </div>
        ) : (
          <div className="h3 mb-0 text-end">
            {formatCurrency(sale)}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PricingCard;