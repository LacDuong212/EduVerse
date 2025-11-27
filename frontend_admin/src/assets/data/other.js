import { addOrSubtractDaysFromDate } from '@/utils/date';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar2 from '@/assets/images/avatar/02.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
import avatar5 from '@/assets/images/avatar/05.jpg';
import avatar8 from '@/assets/images/avatar/08.jpg';
import avatar9 from '@/assets/images/avatar/09.jpg';


export const notificationData = [{
  image: avatar8,
  title: 'New request to apply for Instructor',
  description: 'Congratulate Joan Wallace for graduating from Microverse university',
  isDetails: true
}, {
  image: avatar2,
  title: 'Larry Lawson Added a new course',
  description: "What's new! Find out about new features",
  isDetails: true
}, {
  image: avatar5,
  title: 'New request to apply for Instructor',
  description: 'Congratulate Joan Wallace for graduating from Microverse university',
  isDetails: true
}, {
  image: avatar3,
  title: 'Update v2.3 completed successfully',
  description: "What's new! Find out about new features",
  isTime: true
}];

export const studentReviewData = [{
  id: '01',
  avatar: avatar1,
  description: 'Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Frances Guerrero Tolluer Santiedo Francico Joverr Manda Shar Tuvet Un Tomigo',
  time: addOrSubtractDaysFromDate(2),
  rating: 4,
  reviewOn: 'How to implement sitemap on sass',
  courseName: 'Building Scalable APIs with GraphQL',
  percentage: 70,
}, {
  id: '02',
  avatar: avatar3,
  description: 'Far advanced settling say finished raillery. Offered chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Louis Ferguson',
  time: addOrSubtractDaysFromDate(4),
  rating: 3,
  reviewOn: 'How does an Angular application work?',
  courseName: 'Graphic Design Masterclass',
  percentage: 200,
}, {
  id: '03',
  avatar: avatar5,
  description: 'Offered chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Carolyn Ortiz',
  time: addOrSubtractDaysFromDate(10),
  rating: 2.4,
  reviewOn: 'What is Flexbox and describe any elaborate on its most used properties??',
  courseName: 'Deep Learning with React-Native',
  percentage: 100,
  review: "Alaska"
}, {
  id: '04',
  avatar: avatar8,
  description: 'Chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Dennis Barrett',
  time: addOrSubtractDaysFromDate(3),
  rating: 0,
  reviewOn: 'What are the different data types present in javascript?',
  courseName: 'Bootstrap 5 From Scratch',
  percentage: -10,
  reviewDate: '2025-10-11',
  review: "asbbac askdasc casijcivf vishfuwns nclseii cnaehdac nlaieailcn nc aoehac naiawoca bfygcbake bairh acaed wvnal eacw a rua"
}, {
  id: '05',
  avatar: avatar9,
  description: 'Chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Carolyn Ortiz',
  time: addOrSubtractDaysFromDate(8),
  rating: 5,
  reviewOn: 'What are object prototypes?',
  courseName: 'Learn Invision'
}, {
  id: '06',
  avatar: avatar3,
  description: 'Far advanced settling say finished raillery. Offered chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Louis Ferguson',
  time: addOrSubtractDaysFromDate(4),
  rating: 3,
  reviewOn: 'How does an Angular application work?',
  courseName: 'Graphic Design Masterclass'
}, {
  id: '07',
  avatar: avatar1,
  description: 'Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Frances Guerrero',
  time: addOrSubtractDaysFromDate(2),
  rating: 4,
  reviewOn: 'How to implement sitemap on sass',
  courseName: 'Building Scalable APIs with GraphQL'
}, {
  id: '08',
  avatar: avatar8,
  description: 'Chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Dennis Barrett',
  time: addOrSubtractDaysFromDate(3),
  rating: 4,
  reviewOn: 'What are the different data types present in javascript?',
  courseName: 'Bootstrap 5 From Scratch'
}];