import { Button } from 'react-bootstrap';
import { FaUserTie } from 'react-icons/fa';
import SortableTh from '@/components/SortableTh';

const COLS = 6;

const SkeletonRows = ({ count = 5 }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <tr key={i} className="skeleton-row">
        <td>
          <div className="d-flex align-items-center gap-2">
            <span className="placeholder rounded-circle" style={{ width: 40, height: 40, display: 'inline-block' }} />
            <span className="placeholder col-5 rounded" />
          </div>
        </td>
        <td><span className="placeholder col-8 rounded" /></td>
        <td><span className="placeholder col-6 rounded" /></td>
        <td><span className="placeholder col-6 rounded" /></td>
        <td><span className="placeholder col-4 rounded" /></td>
        <td><span className="placeholder col-5 rounded" /></td>
      </tr>
    ))}
  </>
);

const InstructorList = ({ instructorsData, isLoading, sortKey, sortDir, onSort, onBlock, onUnblock }) => {

  return <div className="table-responsive border-0">
    <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
      <thead>
        <tr>
          <SortableTh label="Instructor name" sortKey="name" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0 rounded-start" />
          <SortableTh label="Email" sortKey="email" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0" />
          <SortableTh label="Join date" sortKey="createdAt" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0" />
          <SortableTh label="Last updated" sortKey="updatedAt" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0" />
          <th scope="col" className="border-0">Activated</th>
          <th scope="col" className="border-0 rounded-end">Action</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <SkeletonRows count={5} />
        ) : instructorsData && instructorsData.length > 0 ? (
          instructorsData.map((item) => (
            <tr key={item._id}>
              <td>
                <div className="d-flex align-items-center position-relative">
                  <div className="avatar avatar-md">
                    {item?.pfpImg ? (
                      <img src={item.pfpImg}
                        className="rounded-circle"
                        alt={'avatar'}
                      />) : (
                      <div className="avatar-img rounded-circle border-white border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-4">
                        {(item?.name?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="mb-0 ms-3">
                    <h6 className="mb-0">
                      {item.name}
                    </h6>
                  </div>
                </div>
              </td>
              <td>
                {item.email}
              </td>
              <td>
                {
                  new Date(item.createdAt).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                }
              </td>
              <td>
                {
                  new Date(item.updatedAt).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                }
              </td>
              <td>
                <span className={`badge text-bg-${item.isActivated ? 'success' : 'warning'}`}>
                  {item.isActivated ? 'Yes' : 'No'}
                </span>
              </td>
              {
                item.isActivated
                  ? <td>
                    <Button variant="warning-soft" size="sm" className="me-1 mb-1 mb-md-0" onClick={() => onBlock(item._id)}>
                      Block
                    </Button>
                  </td>
                  : <td>
                    <Button variant="primary-soft" size="sm" className="me-1 mb-1 mb-md-0" onClick={() => onUnblock(item._id)}>
                      Unblock
                    </Button>
                  </td>
              }
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={COLS} className="empty-state-cell">
              <FaUserTie className="empty-icon" />
              <div className="fw-semibold">No instructors found</div>
              <div className="small mt-1">Try adjusting your search criteria</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;
};
export default InstructorList;
