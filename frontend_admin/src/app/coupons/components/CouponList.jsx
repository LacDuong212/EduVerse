import { Button } from 'react-bootstrap';
import { FaEdit, FaTag, FaTrash } from 'react-icons/fa';

const COLS = 7;

const SkeletonRows = ({ count = 5 }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <tr key={i} className="skeleton-row">
        <td>
          <span className="placeholder col-6 rounded d-block mb-1" />
          <span className="placeholder col-9 rounded" style={{ height: '0.75rem' }} />
        </td>
        <td><span className="placeholder col-5 rounded" /></td>
        <td>
          <span className="placeholder col-7 rounded d-block mb-1" />
          <span className="placeholder col-7 rounded" />
        </td>
        <td><span className="placeholder col-5 rounded" /></td>
        <td><span className="placeholder col-6 rounded" /></td>
        <td><span className="placeholder col-4 rounded" /></td>
        <td><span className="placeholder col-7 rounded" /></td>
      </tr>
    ))}
  </>
);

const CouponList = ({ couponsData, isLoading, onToggleStatus, onDelete, onEdit }) => {
  return (
    <div className="table-responsive border-0">
      <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
        <thead>
          <tr>
            <th scope="col" className="border-0 rounded-start">Code / Info</th>
            <th scope="col" className="border-0">Discount</th>
            <th scope="col" className="border-0">Validity Period</th>
            <th scope="col" className="border-0">Usage</th>
            <th scope="col" className="border-0">Status</th>
            <th scope="col" className="border-0">Active</th>
            <th scope="col" className="border-0 rounded-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows count={5} />
          ) : couponsData && couponsData.length > 0 ? (
            couponsData.map((item) => {
              const now = new Date();
              const start = new Date(item.startDate);
              const end = new Date(item.expiryDate);

              let statusText = null;
              if (now < start) statusText = <span className="badge bg-primary bg-opacity-10 text-primary">Upcoming</span>;
              else if (now > end) statusText = <span className="badge bg-danger bg-opacity-10 text-danger">Expired</span>;
              else statusText = <span className="badge bg-success bg-opacity-10 text-success">Running</span>;

              return (
                <tr key={item._id}>
                  <td>
                    <h6 className="mb-1 font-monospace text-primary">{item.code}</h6>
                    <small className="text-muted d-block text-truncate" style={{ maxWidth: "200px" }}>
                      {item.description}
                    </small>
                  </td>
                  <td>{item.discountPercent}%</td>
                  <td>
                    <div className="d-flex flex-column small">
                      <span>From: {start.toLocaleDateString('en-GB')}</span>
                      <span>To: {end.toLocaleDateString('en-GB')}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-blue">{item.usersUsed?.length || 0} used</span>
                    {item.maxUsageLimit && (
                      <span className="text-muted small d-block">/ {item.maxUsageLimit} max</span>
                    )}
                  </td>
                  <td>{statusText}</td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={item.isActive}
                        onChange={() => onToggleStatus(item)}
                      />
                    </div>
                  </td>
                  <td>
                    <Button variant="primary-soft" size="sm" className="me-1" onClick={() => onEdit(item)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger-soft" size="sm" onClick={() => onDelete(item._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={COLS} className="empty-state-cell">
                <FaTag className="empty-icon" />
                <div className="fw-semibold">No coupons found</div>
                <div className="small mt-1">Try a different search or create a new coupon</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CouponList;