import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const TagsCard = ({ tags = [] }) => {
  return (
    <Card className="card-body shadow p-3">
      <h4 className="mb-3">Tags</h4>
      <ul className="list-inline mb-0">
        {tags.map((tag, idx) => (
          <li className="list-inline-item" key={idx}>
            <Button
              as={Link}
              to={`/courses?search=${encodeURIComponent(tag)}`}
              variant="outline-light"
              size="md"
            >
              {tag}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default TagsCard;