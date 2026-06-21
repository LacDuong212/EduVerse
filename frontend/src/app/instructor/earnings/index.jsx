import { useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaMoneyBillWave } from "react-icons/fa";
import PageMetaData from "@/components/PageMetaData";
import EarningCards from "./components/EarningCards";
import EarningChart from "./components/EarningChart";
import RequestPayoutModal from "./components/RequestPayoutModal";
import PayoutHistoryTable from "./components/PayoutHistoryTable";
import useInstructorEarnings from "./useInstructorEarnings";
import usePayoutHistory from "./usePayoutHistory";

const InstructorEarnings = () => {
  const {
    thisMonthEarning,
    toBePaid,
    totalEarning,
    series,
    loading: earningsLoading,
  } = useInstructorEarnings();

  const {
    payouts,
    loading:    payoutsLoading,
    submitting,
    pagination,
    page,
    setPage,
    requestPayout,
    totalPaid,
    approvedAmount,
  } = usePayoutHistory();

  const [showModal, setShowModal] = useState(false);

  const hasPending = payouts.some((p) => p.status === "pending");

  if (earningsLoading) {
    return (
      <>
        <PageMetaData title="Earnings" />
        <div className="d-flex justify-content-center align-items-center w-100 h-75">
          <Spinner animation="border" variant="primary" style={{ width: 30, height: 30 }} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageMetaData title="Earnings" />
      <div className="pb-5 d-flex flex-column gap-4">
        <EarningCards
          thisMonthEarning={thisMonthEarning}
          toBePaid={toBePaid}
          totalEarning={totalEarning}
          totalPaid={totalPaid}
          approvedAmount={approvedAmount}
        />
        <EarningChart col={12} earningsData={series} />

        <Card className="border">
          <Card.Header className="d-flex align-items-center justify-content-between">
            <div className="fw-semibold text-body d-flex align-items-center gap-2">
              <FaMoneyBillWave size={16} className="text-success" /> Payout Requests
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setShowModal(true)}
              disabled={hasPending}
              title={hasPending ? "You already have a pending request" : "Request a payout"}
            >
              {hasPending ? "Request Pending" : "Request Payout"}
            </button>
          </Card.Header>
          <Card.Body className="p-0 p-md-3">
            <PayoutHistoryTable
              payouts={payouts}
              loading={payoutsLoading}
              pagination={pagination}
              page={page}
              onPageChange={setPage}
            />
          </Card.Body>
        </Card>
      </div>

      <RequestPayoutModal
        show={showModal}
        onHide={() => setShowModal(false)}
        toBePaid={toBePaid}
        onSubmit={requestPayout}
        submitting={submitting}
      />
    </>
  );
};

export default InstructorEarnings;
