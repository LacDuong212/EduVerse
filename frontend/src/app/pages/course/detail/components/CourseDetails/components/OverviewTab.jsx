
const OverviewTab = ({ description = "" }) => {
  return (
    <div>
      {description ? (
        <div
          className="clamped-html"
          dangerouslySetInnerHTML={{
            __html: description.replace(/&nbsp;/g, " ")
          }}
        />
      ) : (
        <span>(No full description)</span>
      )}
    </div>
  );
};

export default OverviewTab;