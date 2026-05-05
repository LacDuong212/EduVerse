import { Spinner } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import EarningCards from "./components/EarningCards";
import EarningChart from "./components/EarningChart";
import useInstructorEarnings from "./useInstructorEarnings";

const InstructorEarnings = () => {
  const {
    thisMonthRevenue,
    toBePaid,
    totalEarning,

    series,

    loading,
    error,
    refresh,
  } = useInstructorEarnings();

  if (loading) {
    return (
      <>
        <PageMetaData title="Earnings" />
        <div className="d-flex justify-content-center align-items-center w-100 h-75">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "30px", height: "30px" }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageMetaData title="Earnings" />
      <div className="pb-5 d-flex flex-column gap-4">
        <EarningCards
          thisMonthRevenue={thisMonthRevenue}
          toBePaid={toBePaid}
          totalEarning={totalEarning}
        />
        <EarningChart col={12} earningsData={series} />
      </div>
    </>
  );
};

export default InstructorEarnings;