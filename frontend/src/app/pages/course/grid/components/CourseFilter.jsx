import useToggle from '@/hooks/useToggle';
import { Card, Col, Collapse } from 'react-bootstrap';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import axios from 'axios';

const CourseFilter = ({
  category,
  setCategory,
  price,
  setPrice,
  level,
  setLevel,
  language,
  setLanguage,
}) => {
  const { isTrue, toggle } = useToggle();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [allCategories, setAllCategories] = useState([]);
  const [allLanguages, setAllLanguages] = useState([]);
  const [allLevels, setAllLevels] = useState(["All", "Beginner", "Intermediate", "Advanced"]);


  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/courses/filters`);
        if (res.data.categories) {
          const categoryList = res.data.categories.map(name => ({ name }));
          setAllCategories(categoryList);
        }
        if (res.data.languages) {
          setAllLanguages(res.data.languages);
        }
        if (res.data.levels) {
          setAllLevels(res.data.levels);
        }
      } catch (error) {
        console.error("Failed to fetch filters", error);
        setAllCategories([{ name: 'Information technology' }, { name: 'Data' }]);
        setAllLanguages(['English', 'Tiếng Việt']);
      }
    };
    fetchFilterData();
  }, [backendUrl]);

  const primaryCats = allCategories.slice(0, 6);
  const moreCats = allCategories.slice(6);
  const languages = allLanguages;

  const isAll = !category;
  const handleSelectAll = () => setCategory('');
  const handleSelectCat = (name) => {
    if (category === name) setCategory('');
    else setCategory(name);
  };

  return (
    <form>
      {/* CATEGORY */}
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Category</h4>
        <Col xs={12}>
          {/* All */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="cat-all"
                checked={isAll}
                onChange={handleSelectAll}
              />
              <label className="form-check-label" htmlFor="cat-all">
                All
              </label>
            </div>
          </div>

          {/* Primary categories */}
          {primaryCats.map((c, idx) => (
            <div key={c.name + idx} className="d-flex justify-content-between align-items-center">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`cat-${idx}`}
                  checked={category === c.name}
                  onChange={() => handleSelectCat(c.name)}
                />
                <label className="form-check-label" htmlFor={`cat-${idx}`}>
                  {c.name}
                </label>
              </div>
            </div>
          ))}

          {/* More */}
          {moreCats.length > 0 && (
            <>
              <Collapse in={isTrue} className="multi-collapse">
                <div>
                  <Card className="card-body p-0">
                    {moreCats.map((c, i) => (
                      <div key={c.name + i} className="d-flex justify-content-between align-items-center">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`cat-more-${i}`}
                            checked={category === c.name}
                            onChange={() => handleSelectCat(c.name)}
                          />
                          <label className="form-check-label" htmlFor={`cat-more-${i}`}>
                            {c.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              </Collapse>

              <a
                onClick={toggle}
                className="p-0 mb-0 mt-2 btn-more d-flex align-items-center"
                role="button"
                aria-expanded={isTrue}
              >
                See
                {!isTrue ? (
                  <>
                    <span className="see-more ms-1">more</span>
                    <FaAngleDown className="ms-2" />
                  </>
                ) : (
                  <>
                    <span className=" ms-1">less</span>
                    <FaAngleUp className="ms-2" />
                  </>
                )}
              </a>
            </>
          )}
        </Col>
      </Card>

      {/* PRICE LEVEL */}
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Price Level</h4>
        <ul className="list-inline mb-0">
          <li className="list-inline-item">
            <input
              type="radio"
              className="btn-check"
              name="price-options"
              id="price-all"
              checked={price === "" || price === null}
              onChange={() => setPrice("")}
            />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="price-all">
              All
            </label>
          </li>
          <li className="list-inline-item">
            <input
              type="radio"
              className="btn-check"
              name="price-options"
              id="price-free"
              checked={price === "free"}
              onChange={() => setPrice("free")}
            />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="price-free">
              Free
            </label>
          </li>
          <li className="list-inline-item">
            <input
              type="radio"
              className="btn-check"
              name="price-options"
              id="price-paid"
              checked={price === "paid"}
              onChange={() => setPrice("paid")}
            />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="price-paid">
              Paid
            </label>
          </li>
        </ul>
      </Card>

      {/* SKILL LEVEL */}
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Skill level</h4>
        <ul className="list-inline mb-0">
          {allLevels.map((lv) => (
            <li className="list-inline-item mb-2" key={lv}>
              <input
                type="checkbox"
                className="btn-check"
                id={`btn-level-${lv}`}
                checked={level === lv || (lv === "All" && (level === "" || level === "All"))}
                onChange={() => {
                  if (lv === "All") setLevel("");
                  else setLevel(level === lv ? "" : lv);
                }}
              />
              <label className="btn btn-light btn-primary-soft-check" htmlFor={`btn-level-${lv}`}>
                {lv}
              </label>
            </li>
          ))}
        </ul>
      </Card>

      {/* LANGUAGE */}
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Language</h4>
        <ul className="list-inline mb-0 g-3">
          {languages.map((lan, idx) => (
            <li className="list-inline-item mb-2" key={lan + idx}>
              <input
                type="checkbox"
                className="btn-check"
                id={`btn-check-lan-${idx}`}
                checked={language === lan}
                onChange={() => setLanguage(language === lan ? "" : lan)}
              />
              <label className="btn btn-light btn-primary-soft-check" htmlFor={`btn-check-lan-${idx}`}>
                {lan}
              </label>
            </li>
          ))}
        </ul>
      </Card>
    </form >
  );
};

export default CourseFilter;
