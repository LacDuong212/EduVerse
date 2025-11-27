import { Button } from 'react-bootstrap';

const InstructorList = ({ instructorsData, isLoading, onBlock, onUnblock }) => {

  return <div className="table-responsive border-0">
    <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
      <thead>
        <tr>
          <th scope="col" className="border-0 rounded-start">
            Instructor name
          </th>
          <th scope="col" className="border-0">
            Email
          </th>
          <th scope="col" className="border-0">
            Join date
          </th>
          <th scope="col" className="border-0">
            Last updated
          </th>
          <th scope="col" className="border-0">
            Activated
          </th>
          <th scope="col" className="border-0 rounded-end">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan="5" className="text-center">Loading...</td>
          </tr>
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
                &nbsp;{
                  new Date(item.createdAt).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                }
              </td>
              <td>
                &nbsp;{
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
            <td colSpan="5" className="text-center">
              No instructors found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;
};
export default InstructorList;
