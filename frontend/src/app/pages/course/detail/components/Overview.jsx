import { FaCheckCircle } from 'react-icons/fa';
const Overview = () => {
  const features = ['Digital marketing course introduction', 'Customer Life cycle', 'What is Search engine optimization(SEO)', 'Facebook ADS', 'Facebook Messenger Chatbot', 'Search engine optimization tools', 'Why SEO', 'URL Structure', 'Featured Snippet', 'SEO tips and tricks', 'Google tag manager'];
  return <>
      <h5 className="mb-3">Course Description</h5>
      <p className="mb-3">
        Welcome to the <strong> Digital Marketing Ultimate Course Bundle - 12 Courses in 1 (Over 36 hours of content)</strong>
      </p>
      <p className="mb-3">
        In this practical hands-on training, you’re going to learn to become a digital marketing expert with this
        <strong> ultimate course bundle that includes 12 digital marketing courses in 1!</strong>
      </p>
      <p className="mb-3">
        If you wish to find out the skills that should be covered in a basic digital marketing course syllabus in India or anywhere around the world,
        then reading this blog will help. Before we delve into the advanced
        <strong>
          <a href="#" className="text-reset text-decoration-underline">
            digital marketing course
          </a>
        </strong>
        syllabus, let’s look at the scope of digital marketing and what the future holds.
      </p>
      <p className="mb-0">
        We focus a great deal on the understanding of behavioral psychology and influence triggers which are crucial for becoming a well rounded
        Digital Marketer. We understand that theory is important to build a solid foundation, we understand that theory alone isn’t going to get the
        job done so that’s why this course is packed with practical hands-on examples that you can follow step by step.
      </p>
      <h5 className="mt-4">What you’ll learn</h5>
      <ul className="list-group list-group-borderless mb-3">
        {features.map((feature, idx) => <li className="list-group-item h6 fw-light d-flex mb-0" key={idx}>
            <FaCheckCircle className="text-success me-2" />
            {feature}
          </li>)}
      </ul>
      <p className="mb-0">
        As it so contrasted oh estimating instrument. Size like body someone had. Are conduct viewing boy minutes warrant the expense? Tolerably
        behavior may admit daughters offending her ask own. Praise effect wishes change way and any wanted. Lively use looked latter regard had. Do he
        it part more last in.
      </p>
    </>;
};
export default Overview;
