import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { setUserData } from '@/redux/authSlice'; 
import { setRecommendedCourses } from '@/redux/coursesSlice'; 

const InterestModal = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth); 
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  const showModal = 
    userData &&
    userData.role === 'student' &&
    (!userData.interests || userData.interests.length === 0);

  useEffect(() => {
    if (showModal && backendUrl) {
      const fetchTags = async () => {
        try {
          const { data } = await axios.get(`${backendUrl}/api/courses/tags`);
          if (data.success && data.tags.length > 0) {
            setTopics(data.tags);
          } else {
            setTopics(["Web Development", "JavaScript", "Python", "Design", "Business"]);
          }
        } catch (error) {
          console.error("Error fetching tags:", error);
          setTopics(["Web Development", "ReactJS", "NodeJS", "Marketing"]);
        } finally {
          setLoadingTags(false);
        }
      };
      fetchTags();
    }
  }, [showModal, backendUrl]);

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(prev => prev.filter(t => t !== topic));
    } else {
      if (selectedTopics.length >= 5) {
        toast.error("You can select up to 5 topics only!");
        return;
      }
      setSelectedTopics(prev => [...prev, topic]);
    }
  };

  const handleSave = async () => {
    if (selectedTopics.length < 3) {
      toast.error("Please select at least 3 topics you like!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/interests`,
        { interests: selectedTopics },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Your preferences have been saved! The system will recommend courses for you.");
        
        dispatch(setUserData(data.user)); 

        dispatch(setRecommendedCourses([]));
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <Modal show={showModal} backdrop="static" keyboard={false} centered size="lg">
      <Modal.Header className="border-0 pb-0">
        <div className="w-100 text-center mt-3">
          <h3 className="fw-bold">Welcome, {userData?.name}!</h3>
          <p>
            Choose the topics you're interested in so we can personalize your learning path for you.
          </p>
        </div>
      </Modal.Header>

      <Modal.Body className="px-4">
        {loadingTags ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Loading trending topics...</p>
          </div>
        ) : (
          <>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {topics.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`btn rounded-pill px-3 py-2 fw-medium border ${
                      isSelected 
                        ? "btn-primary-soft"
                        : "btn-outline-body"
                    }`}
                    style={{ transition: "all 0.2s" }}
                  >
                    {isSelected && <i className="bi bi-check2 me-1"></i>}
                    {topic}
                  </button>
                );
              })}
            </div>
            <div className="text-center mt-3">
              <span className={`badge p-2 fs-6 ${selectedTopics.length > 0 ? 'bg-success' : 'bg-secondary'}`}>
                Selected: {selectedTopics.length}/5
              </span>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-center border-0 pb-4">
        <Button 
          variant="primary" 
          size="lg" 
          className="px-5 rounded-pill shadow-sm"
          onClick={handleSave}
          disabled={loading || selectedTopics.length === 0}
        >
          {loading ? (
            <span><span className="spinner-border spinner-border-sm me-2"></span>Saving...</span>
          ) : (
            "Let's Start 🚀"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InterestModal;