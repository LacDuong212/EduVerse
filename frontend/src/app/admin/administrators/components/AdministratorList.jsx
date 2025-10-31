import { Button } from 'react-bootstrap';

const AdministratorList = ({ administratorsData, isLoading }) => {

  return <div className="table-responsive border-0">
    <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
      <thead>
        <tr>
          <th scope="col" className="border-0 rounded-start">
            Administrator name
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
            Verified
          </th>
          <th scope="col" className="border-0">
            Approved
          </th>
          <th scope="col" className="border-0 rounded-end">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan="7" className="text-center">Loading...</td>
          </tr>
        ) : administratorsData && administratorsData.length > 0 ? (
          administratorsData.map((item) => (
            <tr key={item._id}>
              <td>
                <div className="d-flex align-items-center position-relative">
                  <div className="mb-0">
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
                <span className={`badge text-bg-${item.isVerified ? 'success' : 'warning'}`}>
                  {item.isVerified ? 'Yes' : 'No'}
                </span>
              </td>
              <td>
                <span className={`badge text-bg-${item.isApproved ? 'success' : 'warning'}`}>
                  {item.isApproved ? 'Yes' : 'No'}
                </span>
              </td>
              {item.isVerified
                ? (
                  item.isApproved
                    ? <td>
                      <Button variant="dark" size="sm" className="me-1 mb-1 mb-md-0">
                        Block
                      </Button>
                    </td>
                    : <td>
                      <Button variant="success-soft" size="sm" className="me-1 mb-1 mb-md-0">
                        Approve
                      </Button>
                      <button className="btn btn-sm btn-secondary-soft mb-0">Reject</button>
                    </td>
                )
                : (
                  <td>
                    <Button variant="danger-soft" size="sm" className="me-1 mb-1 mb-md-0">
                      Delete
                    </Button>
                  </td>
                )
              }
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center">
              No administrators found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;
};
export default AdministratorList;
