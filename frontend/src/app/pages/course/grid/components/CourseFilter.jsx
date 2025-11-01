// pages/course/detail/grid/components/CourseFilter.jsx
import useToggle from '@/hooks/useToggle';
import useCourseList from '../useCourseList';
import { Card, Col, Collapse } from 'react-bootstrap';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useMemo, useEffect, useState } from 'react';

const CourseFilter = () => {
  const { isTrue, toggle } = useToggle();

  // Lấy data & setter từ hook
  const { allCourses = [], category, setCategory, search } = useCourseList();

  // --- 1) TÍNH categories TỪ DATA HIỆN TẠI ---
  const categoriesNow = useMemo(() => {
    const map = new Map();
    for (const c of allCourses) {
      const key = c.category || 'Other';
      map.set(key, (map.get(key) || 0) + 1);
    }
    const list = Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return list;
  }, [allCourses]);

  // --- 2) CACHE danh sách đầy đủ khi đang ở trạng thái "All" (chưa filter/search) ---
  const [categoriesCache, setCategoriesCache] = useState([]);
  useEffect(() => {
    // Chỉ cache khi không có filter/search (coi như trạng thái "All")
    if (!category && !search && categoriesNow.length) {
      setCategoriesCache(categoriesNow);
    }
  }, [category, search, categoriesNow]);

  // Dùng cache nếu có, để khi chọn 1 option, các option khác KHÔNG biến mất
  const categories = categoriesCache.length ? categoriesCache : categoriesNow;

  // Chia primary/more như cũ
  const primaryCats = categories.slice(0, 6);
  const moreCats = categories.slice(6);

  // --- Language: cũng cache tương tự cho ổn định (tuỳ chọn) ---
  const languagesNow = useMemo(() => {
    const s = new Set();
    for (const c of allCourses) if (c.language) s.add(c.language);
    const arr = Array.from(s);
    return arr.length ? arr : ['English', 'Francas', 'Hindi', 'Russian', 'Spanish', 'Bengali', 'Portuguese'];
  }, [allCourses]);

  const [languagesCache, setLanguagesCache] = useState([]);
  useEffect(() => {
    if (!category && !search && languagesNow.length) {
      setLanguagesCache(languagesNow);
    }
  }, [category, search, languagesNow]);
  const languages = languagesCache.length ? languagesCache : languagesNow;

  // --- Handlers ---
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
            {/* <span className="small">({allCourses.length})</span> */}
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
              {/* <span className="small">({c.count})</span> */}
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
                        <span className="small">({c.count})</span>
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

      {/* PRICE LEVEL (UI giữ nguyên) */}
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Price Level</h4>
        <ul className="list-inline mb-0">
          <li className="list-inline-item">
            <input type="radio" className="btn-check" name="price-options" id="price-all" defaultChecked />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="price-all">
              All
            </label>
          </li>
          <li className="list-inline-item">
            <input type="radio" className="btn-check" name="price-options" id="price-free" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="price-free">
              Free
            </label>
          </li>
          <li className="list-inline-item">
            <input type="radio" className="btn-check" name="price-options" id="price-paid" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="price-paid">
              Paid
            </label>
          </li>
        </ul>
      </Card>

      {/* SKILL LEVEL (UI giữ nguyên) */}
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Skill level</h4>
        <ul className="list-inline mb-0">
          {[
            { id: 'all-levels', label: 'All levels' },
            { id: 'beginner', label: 'Beginner' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced' },
          ].map((lv) => (
            <li className="list-inline-item mb-2" key={lv.id}>
              <input type="checkbox" className="btn-check" id={`btn-${lv.id}`} />
              <label className="btn btn-light btn-primary-soft-check" htmlFor={`btn-${lv.id}`}>
                {lv.label}
              </label>
            </li>
          ))}
        </ul>
      </Card>

      {/* LANGUAGE (map theo data thật + cache) */}
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Language</h4>
        <ul className="list-inline mb-0 g-3">
          {languages.map((language, idx) => (
            <li className="list-inline-item mb-2" key={language + idx}>
              <input type="checkbox" className="btn-check" id={`btn-check-lan-${idx}`} />
              <label className="btn btn-light btn-primary-soft-check" htmlFor={`btn-check-lan-${idx}`}>
                {language}
              </label>
            </li>
          ))}
        </ul>
      </Card>
    </form>
  );
};

export default CourseFilter;
