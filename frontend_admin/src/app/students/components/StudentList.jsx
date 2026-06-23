import { Button } from 'react-bootstrap';
import { FaUserGraduate } from 'react-icons/fa';
import SortableTh from '@/components/SortableTh';

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
        <td><span className="placeholder col-4 rounded" /></td>
        <td><span className="placeholder col-5 rounded" /></td>
      </tr>
    ))}
  </>
);

const StudentList = ({ studentsData, isLoading, sortKey, sortDir, onSort, onBlock, onUnblock, onDelete }) => {

  return <div className="table-responsive border-0">
    <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
      <thead>
        <tr>
          <SortableTh label="Student name" sortKey="name" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0 rounded-start" />
          <SortableTh label="Join date" sortKey="createdAt" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0 text-center" />
          <SortableTh label="Last updated" sortKey="updatedAt" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0 text-center" />
          <th scope="col" className="border-0" text-center>Verified</th>
          <th scope="col" className="border-0" text-center>Activated</th>
          <th scope="col" className="border-0 rounded-end text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <SkeletonRows count={5} />
        ) : studentsData && studentsData.length > 0 ? (
          studentsData.map((item) => (
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
                    {item.email}
                  </div>
                </div>
              </td>
              <td>
                {
                  new Date(item.createdAt).toLocaleString('en-GB', {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                  })
                }
              </td>
              <td>
                {
                  new Date(item.updatedAt).toLocaleString('en-GB', {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                  })
                }
              </td>
              <td className="text-center">
                <span className={`badge text-bg-${item.isVerified ? 'success' : 'warning'}`}>
                  {item.isVerified ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="text-center">
                <span className={`badge text-bg-${item.isActivated ? 'success' : 'warning'}`}>
                  {item.isActivated ? 'Yes' : 'No'}
                </span>
              </td>
              {item.isVerified
                ? (
                  item.isActivated
                    ? <td className="text-center">
                      <Button variant="warning-soft" size="sm" className="mb-0" onClick={() => onBlock(item._id)}>
                        Block
                      </Button>
                    </td>
                    : <td className="text-center">
                      <Button variant="primary-soft" size="sm" className="mb-0" onClick={() => onUnblock(item._id)}>
                        Unblock
                      </Button>
                    </td>
                )
                : (
                  <td>
                    <Button variant="danger-soft" size="sm" className="mb-0" onClick={() => onDelete(item._id)}>
                      Remove
                    </Button>
                  </td>
                )
              }
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="empty-state-cell text-center">
              <FaUserGraduate size={26} className='mb-2' />
              <div>No students found.</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;
};
export default StudentList;
