import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Collapse } from "react-bootstrap";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import useToggle from "@/hooks/useToggle";

const CourseFilter = ({ props }) => {
  const {
    category,
    setCategory,
    price,
    setPrice,
    level,
    setLevel,
    language,
    setLanguage,
  } = props;

  const { isTrue, toggle } = useToggle();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    languages: [],
    levels: [],
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/courses/filters`);

        if (data.success && data.result) {
          setFilterOptions({
            categories: data.result.categories || [],
            languages: data.result.languages || [],
            levels: data.result.levels || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch filters", error);
        setFilterOptions(prev => ({
          ...prev,
          categories: [],
          languages: ["english", "vietnamese", "others"],
          levels: ["all", "beginner", "intermedidate", "advanced"],
        }));
      }
    };
    fetchFilterData();
  }, [backendUrl]);

  const { categories, languages, levels } = filterOptions;

  const primaryCats = useMemo(() => categories.slice(0, 4), [categories]);
  const moreCats = useMemo(() => categories.slice(4), [categories]);

  const isAllCats = !category;
  const handleSelectAllCats = () => setCategory("");

  const handleSelectCat = (id) => {
    setCategory(category === id ? "" : id);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Category</h4>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="cat-all"
                checked={isAllCats}
                onChange={handleSelectAllCats}
              />
              <label className="form-check-label" htmlFor="cat-all">
                All Categories
              </label>
            </div>
          </div>

          {primaryCats.map((cat, idx) => (
            <div key={cat.cateId || idx} className="d-flex justify-content-between align-items-center">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`cat-${cat.cateId}`}
                  checked={category === cat.cateId}
                  onChange={() => handleSelectCat(cat.cateId)}
                />
                <label className="form-check-label" htmlFor={`cat-${cat.cateId}`}>
                  {cat.cateName}
                </label>
              </div>
            </div>
          ))}

          {moreCats.length > 0 && (
            <>
              <Collapse in={isTrue} className="multi-collapse">
                <div>
                  <Card className="card-body p-0">
                    {moreCats.map((cat, i) => (
                      <div key={cat.cateId || i} className="d-flex justify-content-between align-items-center">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`cat-more-${cat.cateId}`}
                            checked={category === cat.cateId}
                            onChange={() => handleSelectCat(cat.cateId)}
                          />
                          <label className="form-check-label" htmlFor={`cat-more-${cat.cateId}`}>
                            {cat.cateName}
                          </label>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              </Collapse>

              <button
                type="button"
                onClick={toggle}
                className="btn btn-link p-0 mb-0 mt-2 text-decoration-none d-flex align-items-center"
              >
                {isTrue ? (
                  <>See less <FaAngleUp className="ms-2" /></>
                ) : (
                  <>See more <FaAngleDown className="ms-2" /></>
                )}
              </button>
            </>
          )}
        </Col>
      </Card>

      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Price</h4>
        <ul className="list-inline mb-0">
          <li className="list-inline-item">
            <input
              type="radio"
              className="btn-check"
              name="price-options"
              id="price-all"
              checked={!price}
              onChange={() => setPrice("")}
            />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="price-all">
              All
            </label>
          </li>
          {["free", "paid"].map((p) => (
            <li className="list-inline-item mb-2" key={p}>
              <input
                type="radio"
                className="btn-check"
                name="price-options"
                id={`price-${p}`}
                checked={price === p}
                onChange={() => setPrice(p)}
              />
              <label className="btn btn-light btn-primary-soft-check text-capitalize" htmlFor={`price-${p}`}>
                {p}
              </label>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Skill Level</h4>
        <ul className="list-inline mb-0">
          <li className="list-inline-item mb-2">
            <input
              type="checkbox"
              className="btn-check"
              id="level-any"
              checked={!level}
              onChange={() => setLevel("")}
            />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="level-any">
              Any
            </label>
          </li>
          {levels.map((lv) => (
            <li className="list-inline-item mb-2" key={lv}>
              <input
                type="checkbox"
                className="btn-check"
                id={`btn-level-${lv}`}
                checked={level === lv}
                onChange={() => setLevel(level === lv ? "" : lv)}
              />
              <label className="btn btn-light btn-primary-soft-check text-capitalize" htmlFor={`btn-level-${lv}`}>
                {lv}
              </label>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Language</h4>
        <ul className="list-inline mb-0 g-3">
          {languages.map((lan) => (
            <li className="list-inline-item mb-2" key={lan}>
              <input
                type="checkbox"
                className="btn-check"
                id={`btn-lan-${lan}`}
                checked={language === lan}
                onChange={() => setLanguage(language === lan ? "" : lan)}
              />
              <label className="btn btn-light btn-primary-soft-check text-capitalize" htmlFor={`btn-lan-${lan}`}>
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