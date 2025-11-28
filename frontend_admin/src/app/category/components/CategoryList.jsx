import { Button } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CategoryList = ({ categoriesData, isLoading, onEdit, onDelete }) => {
  return (
    <div className="table-responsive border-0">
      <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
        <thead>
          <tr>
            <th scope="col" className="border-0 rounded-start">Category Name</th>
            <th scope="col" className="border-0">Slug</th>
            <th scope="col" className="border-0">Created At</th>
            <th scope="col" className="border-0">Updated At</th>
            <th scope="col" className="border-0 rounded-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="5" className="text-center">Loading...</td>
            </tr>
          ) : categoriesData && categoriesData.length > 0 ? (
            categoriesData.map((item) => (
              <tr key={item._id}>
                <td>
                  <h6 className="mb-0">{item.name}</h6>
                </td>
                <td>{item.slug}</td>
                <td>
                  {new Date(item.createdAt).toLocaleString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
                <td>
                  {new Date(item.updatedAt).toLocaleString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
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
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No categories found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;