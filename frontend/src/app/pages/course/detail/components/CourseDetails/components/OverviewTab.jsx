import { sanitizeHtml } from "@/utils/sanitize";

const OverviewTab = ({ description = "" }) => {
  return (
    <div>
      {description ? (
        <div className="clamped-html">
          <div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
        </div>
      ) : (
        <span>(No full description)</span>
      )}
    </div>
  );
};

export default OverviewTab;