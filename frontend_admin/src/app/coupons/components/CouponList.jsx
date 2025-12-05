import { Button, Badge } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

const CouponList = ({ couponsData, isLoading, onToggleStatus, onDelete }) => {
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
            <th scope="col" className="border-0 rounded-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="6" className="text-center">Loading...</td></tr>
          ) : couponsData && couponsData.length > 0 ? (
            couponsData.map((item) => {
              const now = new Date();
              const start = new Date(item.startDate);
              const end = new Date(item.expiryDate);

              let statusText = "";
              if (now < start) statusText = <span className="text-primary small">(Upcoming)</span>;
              else if (now > end) statusText = <span className="text-danger small">(Expired)</span>;
              else statusText = <span className="text-success small">(Running)</span>;

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
                      {statusText}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-blue">{item.usersUsed?.length || 0} used</span>
                  </td>
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
                    <Button variant="danger-soft" size="sm" onClick={() => onDelete(item._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr><td colSpan="6" className="text-center">No coupons found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CouponList;