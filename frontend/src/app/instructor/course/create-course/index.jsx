import useCreateCourse from "./useCreateCourse";

const CreateCoursePage = () => {
  const { isCreating } = useCreateCourse({ autoRun: true });

  return (
    <div className="vh-100 d-flex flex-column align-items-center justify-content-center">
      <div className="text-center">
        <div 
          className="spinner-border text-primary mb-4" 
          role="status" 
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        
        <h3 className="text-xl font-semibold text-primary">
          {isCreating ? "Creating course..." : "Redirecting..."}
        </h3>
        <p className="text-sm mt-2">
          We're building a draft for you, give us a second!
        </p>
      </div>
    </div>
  );
};

export default CreateCoursePage;