import PageMetaData from "@/components/PageMetaData";
import EarningsCards from "./components/EarningsCards";
import EarningsChart from "./components/EarningsChart";
import useInstructor from "../useInstructor";
import { useEffect, useState } from "react";

const InstructorEarnings = () => {
  const { fetchInstructorEarnings } = useInstructor();

  const [data, setData] = useState({});

  useEffect(() => {
    const load = async () => {
      setData(await fetchInstructorEarnings());
    };
    load();
  }, []);

  return (
    <>
      <PageMetaData title="Dashboard" />
      <div className="pb-5 d-flex flex-column gap-4">
        <EarningsCards
          thisMonthEarnings={data.thisMonthEarnings}
          toBePaid={data.toBePaid}
          lifeTimeEarnings={data.lifeTimeEarnings}
        />
        <EarningsChart col={12} earningsData={data.earningsData} />
      </div>
    </>
  );
};

export default InstructorEarnings;