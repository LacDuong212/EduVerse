import { Button } from 'react-bootstrap';
import { BiSolidCategory } from "react-icons/bi";
import { FaEdit, FaTrash } from 'react-icons/fa';
import SortableTh from '@/components/SortableTh';

const SkeletonRows = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="skeleton-row">
        <td><span className="placeholder-glow d-block"><span className="placeholder col-6 rounded" /></span></td>
        <td><span className="placeholder-glow d-block"><span className="placeholder col-8 rounded" /></span></td>
        <td><span className="placeholder-glow d-block"><span className="placeholder col-5 rounded" /></span></td>
        <td><span className="placeholder-glow d-block"><span className="placeholder col-5 rounded" /></span></td>
        <td><span className="placeholder-glow d-block"><span className="placeholder col-4 rounded" /></span></td>
      </tr>
    ))}
  </>
);

const CategoryList = ({ categoriesData, isLoading, sortKey, sortDir, onSort, onEdit, onDelete }) => {
  return (
    <div className="table-responsive border-0">
      <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
        <thead>
          <tr>
            <SortableTh label="Category Name" sortKey="name" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0 rounded-start" />
            <SortableTh label="Slug" sortKey="slug" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0" />
            <SortableTh label="Created At" sortKey="createdAt" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0 text-center" />
            <SortableTh label="Updated At" sortKey="updatedAt" currentSortKey={sortKey} currentDir={sortDir} onSort={onSort} className="border-0 text-center" />
            <th scope="col" className="border-0 rounded-end text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : categoriesData && categoriesData.length > 0 ? (
            categoriesData.map((item) => (
              <tr key={item._id}>
                <td>
                  <h6 className="mb-0">{item.name}</h6>
                </td>
                <td>{item.slug}</td>
                <td className='text-center'>
                  {new Date(item.createdAt).toLocaleString('en-GB', {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
                <td className='text-center'>
                  {new Date(item.updatedAt).toLocaleString('en-GB', {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
                <td className='text-center'>
                  <div className="d-flex flex-wrap justify-content-center align-items-center gap-1">
                    <Button variant="primary-soft" size="sm" className="mb-0" onClick={() => onEdit(item)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger-soft" size="sm" className='mb-0' onClick={() => onDelete(item._id)}>
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-state-cell text-center">
                <BiSolidCategory size={26} className="text-center mb-2" />
                <div>No categories found.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;