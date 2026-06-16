import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import blockImg from "@/assets/images/element/ban.svg";

export default function CourseBlockedNotice({
  blockedInfo,
  refundStatus,
  refundLoading,
  onClaimRefund
}) {
  const hasEnrollment = !!blockedInfo?.hasEnrollment;
  const hasClaimed = !!refundStatus?.claimed;
  const hasCoupon = refundStatus?.exists !== false;
  const isExpired = !!refundStatus?.expired;

  const couponExpiryDate = refundStatus?.coupon?.expiryDate
    ? new Date(refundStatus.coupon.expiryDate).toLocaleString()
    : null;

  const isButtonDisabled =
    refundLoading ||
    hasClaimed ||
    !hasCoupon ||
    isExpired ||
    !hasEnrollment;

  const renderButtonContent = () => {
    if (refundLoading) {
      return (
        <>
          <Spinner animation="border" size="sm" />
          Processing...
        </>
      );
    }

    if (isExpired) {
      return "Coupon Expired";
    }

    if (hasClaimed) {
      return (
        <>
          Claimed
          <FaCheckCircle size={14} />
        </>
      );
    }

    return (
      <>
        Get Coupon Refund
        <FaArrowRight size={14} />
      </>
    );
  };

  return (
    <main>
      <section className="pt-5">
        <Container>
          <Row>
            <Col xs={12} className="text-center">
              <img
                src={blockImg}
                className="h-200px h-md-440px mb-4"
                alt="course blocked"
              />

              <h1 className="display-4 text-danger mb-2">
                Course Permanently Blocked
              </h1>

              <h4 className="mb-3">
                This course is no longer available
              </h4>

              <p className="mb-2">
                {blockedInfo?.courseTitle || "This course"} has been permanently blocked.
              </p>

              <p className="mb-4">
                If you purchased this course, you can request a refund coupon and use it for another course.
              </p>

              {!hasEnrollment && (
                <p className="text-muted mb-3">
                  Refund coupons are only available to students who joined this course.
                </p>
              )}

              {!hasCoupon && hasEnrollment && (
                <p className="text-muted mb-3">
                  Refund coupon is not available for this course.
                </p>
              )}

              {isExpired && (
                <p className="text-danger mb-3">
                  This refund coupon has expired.
                </p>
              )}

              {hasClaimed && (
                <p className="text-success mb-3">
                  You have already claimed this refund coupon. Please check your notification for the coupon code.
                </p>
              )}

              <Button
                variant={hasClaimed ? "success" : "danger"}
                type="button"
                disabled={isButtonDisabled}
                onClick={onClaimRefund}
                className="mb-0 d-inline-flex align-items-center gap-2"
              >
                {renderButtonContent()}
              </Button>

              {couponExpiryDate && (
                <p className="small text-muted mt-3">
                  Coupon expires on: {couponExpiryDate}
                </p>
              )}

              {hasClaimed && (
                <p className="small text-muted mt-2">
                  The coupon notification may take up to 60 seconds to appear.
                </p>
              )}
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}