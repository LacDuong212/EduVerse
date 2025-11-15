// import ChoicesFormInput from '@/components/form/ChoicesFormInput';
// import clsx from 'clsx';
// import { Button, Card, CardBody, CardHeader, Col, FormControl, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
// import { FaSearch } from 'react-icons/fa';
// import TextFormInput from '@/components/form/TextFormInput';
// import { timeSince } from '@/utils/date';
// import { yupResolver } from '@hookform/resolvers/yup';
// import { useForm } from 'react-hook-form';
// import { BsChatLeft, BsHandThumbsUp } from 'react-icons/bs';
// import { Link } from 'react-router-dom';
// import * as yup from 'yup';
// import useToggle from '@/hooks/useToggle';
// import { discussData } from '../data';
// const Discussion = () => {
//   const {
//     isTrue: isOpen,
//     toggle
//   } = useToggle();
//   const postFormSchema = yup.object({
//     title: yup.string().required('please enter post title'),
//     description: yup.string().required('please enter post description')
//   });
//   const {
//     control,
//     handleSubmit
//   } = useForm({
//     resolver: yupResolver(postFormSchema)
//   });
//   return <>
//       <Card>
//         <CardHeader className="border-bottom p-0 pb-3">
//           <h4 className="mb-3">Discussion</h4>
//           <form className="row g-4">
//             <Col sm={6} lg={3}>
//               <div className="position-relative">
//                 <FormControl className="pe-5 bg-transparent" type="search" placeholder="Search" aria-label="Search" />
//                 <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="submit">
//                   <FaSearch className="fs-6 " />
//                 </button>
//               </div>
//             </Col>
//             <Col sm={6} lg={3}>
//               <ChoicesFormInput className="js-choice">
//                 <option>Select item</option>
//                 <option>Week 1</option>
//                 <option>Week 2</option>
//                 <option>Week 3</option>
//                 <option>Week 4</option>
//                 <option>Week 5</option>
//                 <option>Week 6</option>
//               </ChoicesFormInput>
//             </Col>
//             <Col sm={6} lg={3}>
//               <ChoicesFormInput className="js-choice">
//                 <option>Filter</option>
//                 <option>All</option>
//                 <option>Answered</option>
//                 <option>Unanswered</option>
//               </ChoicesFormInput>
//             </Col>
//             <Col sm={6} lg={3}>
//               <Button variant="primary-soft" className="mb-0 w-100" onClick={toggle}>
//                 Create Post
//               </Button>
//             </Col>
//           </form>
//         </CardHeader>
//         <CardBody className="p-0 pt-3">
//           <div className="vstack gap-3">
//             {discussData.map((item, idx) => <div className={clsx({
//             'border-bottom': discussData.length - 1 != idx
//           })} key={idx}>
//                 <div className="d-sm-flex justify-content-sm-between mb-3">
//                   <div className="d-flex align-items-center">
//                     <div className="avatar avatar-sm flex-shrink-0">
//                       <img className="avatar-img rounded-circle" src={item.image} alt="avatar" />
//                     </div>
//                     <div className="ms-2">
//                       <h6 className="mb-0">
//                         <a href="#">{item.name}</a>
//                       </h6>
//                       <small>posted {timeSince(item.createdAt)}</small>
//                     </div>
//                   </div>
//                 </div>
//                 <h5>{item.title}</h5>
//                 <p className="mb-2">{item.comment}</p>
//                 <ul className="nav nav-divider pb-3 small">
//                   <li className="nav-item">

//                     <Link className="text-primary-hover" to="">

//                       <BsHandThumbsUp className="me-2" />
//                       Like (3)
//                     </Link>
//                   </li>
//                   <li className="nav-item">

//                     <Link className="text-primary-hover" to="">

//                       <BsChatLeft className="me-2" />
//                       Reply
//                     </Link>
//                   </li>
//                 </ul>
//               </div>)}
//           </div>
//         </CardBody>
//       </Card>
//       <Modal show={isOpen} onHide={toggle} className="fade" id="modalCreatePost" tabIndex={-1} aria-labelledby="modalLabelCreatePost" aria-hidden="true">
//         <form onSubmit={handleSubmit(() => {})}>
//           <ModalHeader closeButton>
//             <h5 className="modal-title" id="modalLabelCreatePost">
//               Create Post
//             </h5>
//           </ModalHeader>
//           <ModalBody>
//             <TextFormInput name="title" label="Title" containerClassName="mb-3" placeholder="Add title here" control={control} />
//             <TextFormInput name="description" label="Description" containerClassName="mb-3" placeholder="Description here" control={control} />
//             <div>
//               <label className="form-label">Select Course Materials</label>
//               <ChoicesFormInput className="js-choice">
//                 <option>Select item</option>
//                 <option>Week 1</option>
//                 <option>Week 2</option>
//                 <option>Week 3</option>
//                 <option>Week 4</option>
//                 <option>Week 5</option>
//                 <option>Week 6</option>
//               </ChoicesFormInput>
//             </div>
//           </ModalBody>
//           <ModalFooter>
//             <Button variant="success-soft" type="submit">
//               Post
//             </Button>
//           </ModalFooter>
//         </form>
//       </Modal>
//     </>;
// };
// export default Discussion;
