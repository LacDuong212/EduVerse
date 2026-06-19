import { Card } from "react-bootstrap";

const TagsCard = ({ tags = [] }) => {
  return (
    <Card className="card-body shadow p-3">
      <h4 className="mb-3">Tags</h4>

      <ul className="list-inline mb-0">
        {tags.map((tag, idx) => (
          <li className="list-inline-item" key={idx}>
            <span className="btn btn-outline-light btn-md cursor-default">
              {tag}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default TagsCard;