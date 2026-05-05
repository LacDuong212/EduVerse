import { cleanQuillHtml } from "@/utils/cleaner";

const OverviewTab = ({ description = "" }) => {
  return (
    <div>
      {description ? (
        <div className="clamped-html">
          <div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: cleanQuillHtml(description) }} />
        </div>
      ) : (
        <span>(No full description)</span>
      )}
    </div>
  );
};

export default OverviewTab;