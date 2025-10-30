import { addOrSubtractDaysFromDate, addOrSubtractHoursFromDate } from '@/utils/date';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar2 from '@/assets/images/avatar/02.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import avatar5 from '@/assets/images/avatar/05.jpg';
import avatar6 from '@/assets/images/avatar/06.jpg';
import avatar7 from '@/assets/images/avatar/07.jpg';
import avatar8 from '@/assets/images/avatar/08.jpg';
import avatar9 from '@/assets/images/avatar/09.jpg';
import event2 from '@/assets/images/event/02.jpg';
import event3 from '@/assets/images/event/03.jpg';
import event4 from '@/assets/images/event/04.jpg';
import event5 from '@/assets/images/event/05.jpg';
import event6 from '@/assets/images/event/06.jpg';
import event7 from '@/assets/images/event/07.jpg';
import event8 from '@/assets/images/event/08.jpg';
import event9 from '@/assets/images/event/09.jpg';
import { BsPatchCheckFill, BsXOctagonFill } from 'react-icons/bs';
import { FaBook, FaBookOpen, FaGlobe, FaUserTie } from 'react-icons/fa';
export const testimonialData = [{
  id: '301',
  courseId: '1',
  description: 'Moonlight newspaper up its enjoyment agreeable depending. Timed voice share led him to widen. At weddings believed laughing',
  role: 'Backend developer at google'
}, {
  id: '302',
  courseId: '2',
  description: 'Its enjoyment Moonlight newspaper up agreeable depending. Timed voice share led him to widen. At weddings believed laughing',
  role: 'Backend developer at google'
}, {
  id: '303',
  courseId: '3',
  description: 'Newspaper up its enjoyment agreeable depending. Timed voice share led him to widen. At weddings believed laughing',
  role: 'Backend developer at google'
}, {
  id: '304',
  courseId: '4',
  description: 'Newspaper up its enjoyment agreeable depending. Timed voice share led him to widen. At weddings believed laughing',
  role: 'Backend developer at google'
}];
export const userReviewData = [{
  name: 'Jacqueline Miller',
  rating: 4,
  time: addOrSubtractDaysFromDate(2),
  avatar: avatar9,
  description: 'Perceived end knowledge certainly day sweetness why cordially. Ask a quick six seven offer see among. Handsome met debating sir dwelling age material. As style lived he worse dried. Offered related so visitors we private removed. Moderate do subjects to distance.',
  reply: [{
    name: 'Louis Ferguson',
    time: addOrSubtractDaysFromDate(1),
    avatar: avatar2,
    description: 'Water timed folly right aware if oh truth. Imprudence attachment him for sympathize. Large above be to means. Dashwood does provide stronger is. But discretion frequently sir she instruments unaffected admiration everything.'
  }]
}, {
  name: 'Dennis Barrett',
  rating: 4,
  time: addOrSubtractDaysFromDate(2),
  avatar: avatar7,
  description: 'Handsome met debating sir dwelling age material. As style lived he worse dried. Offered related so visitors we private removed. Moderate do subjects to distance.'
}];
export const playListData = [{
  title: 'Introduction of Digital Marketing',
  lectures: [{
    title: 'Introduction',
    time: '2m 10s',
    isNote: true
  }, {
    title: 'What is Digital Marketing What is Digital Marketing',
    time: 'Playing',
    playing: true,
    isNote: true
  }, {
    title: 'Type of Digital Marketing',
    time: '18m 10s'
  }]
}, {
  title: 'Customer Life cycle',
  lectures: [{
    title: 'Introduction',
    time: '2m 10s'
  }, {
    title: 'What is Digital Marketing What is Digital Marketing',
    time: '15m 10s'
  }, {
    title: 'Type of Digital Marketing',
    time: '18m 10s',
    isPremium: true
  }]
}, {
  title: 'What is Search Engine Optimization(SEO)',
  lectures: [{
    title: 'Introduction',
    time: '2m 10s'
  }, {
    title: 'How to SEO Optimise Your Homepage',
    time: '15m 00s'
  }, {
    title: 'How to Write Title Tags Search Engines Love',
    time: '28m 10s'
  }, {
    title: 'SEO Keyword Planning',
    time: '38m 22s',
    isPremium: true
  }, {
    title: 'Internal and External Links',
    time: '12m 10s',
    isPremium: true
  }, {
    title: 'Measuring SEO Effectiveness',
    time: '35m 10s',
    isPremium: true
  }]
}, {
  title: 'YouTube Marketing',
  lectures: [{
    title: 'Video Flow',
    time: '25m 5s'
  }, {
    title: 'Webmaster Tool',
    time: '15m 20s'
  }, {
    title: 'Featured Contents on Channel',
    time: '32m 20s'
  }, {
    title: 'Managing Comments',
    time: '20m 20s',
    isPremium: true
  }, {
    title: 'Channel Analytics',
    time: '18m 20s',
    isPremium: true
  }]
}, {
  title: 'Why SEO',
  lectures: [{
    title: 'Understanding SEO',
    time: '20m 20s'
  }, {
    title: 'On-Page SEO',
    time: '5m 20s'
  }, {
    title: 'Local SEO',
    time: '16m 20s'
  }, {
    title: 'Measuring SEO Effectiveness',
    time: '12m 20s',
    isPremium: true
  }, {
    title: 'SEO Keyword Planning',
    time: '36m 12s',
    isPremium: true
  }, {
    title: 'Keywords in Blog and Articles',
    time: '15m 20s',
    isPremium: true
  }, {
    title: 'Mobile SEO',
    time: '15m 00s',
    isPremium: true
  }]
}, {
  title: 'Google tag manager',
  lectures: [{
    title: 'G+ Pages Ranks Higher',
    time: '20m 20s'
  }, {
    title: 'Adding Contact Links',
    time: '5m 20s'
  }, {
    title: 'Google Hangouts',
    time: '16m 20s'
  }, {
    title: 'Google Local Business',
    time: '36m 12s',
    isPremium: true
  }]
}, {
  title: 'Integration with Website',
  lectures: [{
    title: 'Creating LinkedIn Account',
    time: '13m 20s'
  }, {
    title: 'Advance Searching',
    time: '31m 20s'
  }, {
    title: 'LinkedIn Mobile App',
    time: '25m 20s'
  }]
}];
export const blogsData = [{
  id: '1001',
  title: 'Student Loan Survey: Many Owe $50K-plus',
  description: 'Affronting imprudence do he he everything. Offered chiefly farther of my no colonel shyness. Such on help ye some door if in. Laughter proposal laughing any son law consider. Needed except up piqued an.',
  name: 'Frances Guerrero',
  createdAt: '30M Ago',
  category: {
    name: 'Student life',
    variant: 'danger'
  },
  image: event2
}, {
  id: '1002',
  title: 'How to make a college list',
  description: 'Prospective students should start broadly and then narrow their list down to colleges that best fit their needs, experts say. Yet remarkably appearance get him his projection.',
  name: 'Louis Crawford',
  createdAt: '12H Ago',
  category: {
    name: 'Student life',
    variant: 'success'
  },
  image: event8
}, {
  id: '1003',
  title: 'Never underestimate the influence of Eduport',
  description: 'Prospective students should start broadly and then narrow their list',
  name: 'Joan Wallace',
  createdAt: '5D Ago',
  category: {
    name: 'Travel',
    variant: 'purple'
  },
  image: event9
}, {
  id: '1004',
  title: 'Covid-19 and the college experienced',
  description: 'Rooms oh fully taken by worse do. Points afraid but may end law. Points afraid but may end law.',
  name: 'Amanda Reed',
  createdAt: 'July 21, 2021',
  category: {
    name: 'Research',
    variant: 'danger'
  },
  image: event3
}, {
  id: '1005',
  title: 'Best Pinterest Boards for learning about business',
  description: 'Fully taken by worse do. Points afraid but may end law. Points afraid but may end law.',
  name: 'Samuel Bishop',
  createdAt: '40D ago',
  category: {
    name: 'Research',
    variant: 'success'
  },
  image: event7
}, {
  id: '1006',
  title: 'The Olympics are over, now what?',
  description: 'Rooms oh fully taken by worse do. Points afraid but may end law. Points afraid but may end law.',
  name: 'Carolyn Ortiz',
  createdAt: 'Aug 31, 2021',
  category: {
    name: 'Sports',
    variant: 'primary'
  },
  image: event4
}, {
  id: '1007',
  title: 'Campus Support for First-Year Students',
  description: 'Prospective students should start broadly and then narrow their list',
  name: 'Lori Stevens',
  createdAt: '3M Ago',
  category: {
    name: 'Student story',
    variant: 'info'
  },
  image: event5
}, {
  id: '1008',
  title: 'Bad habits that people in the industry need to quit',
  description: 'Prospective students should start broadly and then narrow their list',
  name: 'Louis Crawford',
  createdAt: '10D Ago',
  category: {
    name: 'Marketing',
    variant: 'orange'
  },
  image: event6
}];
export const pricingPlans = [{
  duration: 'month',
  plans: [{
    badge: 'Most popular',
    title: 'Basic',
    price: 20,
    features: [{
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Up to 05 users monthly'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Free 5 host & domain'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Custom infrastructure'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Access to all our room'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: '24/7 dedicated Support'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: 'Unlimited updates'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: 'Landing pages & Web widgets'
    }]
  }, {
    title: 'Professional',
    isRecommended: true,
    price: 59,
    features: [{
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Up to 05 users monthly'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Free 5 host & domain'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Custom infrastructure'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Access to all our room'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: '24/7 dedicated Support'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: 'Unlimited updates'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: 'Landing pages & Web widgets'
    }]
  }, {
    badge: 'Best value',
    title: 'Premium',
    price: 99,
    features: [{
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Up to 05 users monthly'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Free 5 host & domain'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Custom infrastructure'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Access to all our room'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: '24/7 dedicated Support'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Unlimited updates'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Landing pages & Web widgets'
    }]
  }]
}, {
  duration: 'year',
  plans: [{
    badge: 'Most popular',
    title: 'Basic',
    price: 570,
    features: [{
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Up to 05 users monthly'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Free 5 host & domain'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Custom infrastructure'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Access to all our room'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: '24/7 dedicated Support'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: 'Unlimited updates'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: 'Landing pages & Web widgets'
    }]
  }, {
    title: 'Professional',
    isRecommended: true,
    price: 840,
    features: [{
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Up to 05 users monthly'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Free 5 host & domain'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Custom infrastructure'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Access to all our room'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: '24/7 dedicated Support'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: 'Unlimited updates'
    }, {
      icon: BsXOctagonFill,
      variant: 'danger',
      name: 'Landing pages & Web widgets'
    }]
  }, {
    badge: 'Best value',
    title: 'Premium',
    price: 999,
    features: [{
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Up to 05 users monthly'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Free 5 host & domain'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Custom infrastructure'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Access to all our room'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: '24/7 dedicated Support'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Unlimited updates'
    }, {
      icon: BsPatchCheckFill,
      variant: 'success',
      name: 'Landing pages & Web widgets'
    }]
  }]
}];
export const studentReviewData = [{
  id: '01',
  avatar: avatar1,
  description: 'Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Frances Guerrero',
  time: addOrSubtractDaysFromDate(2),
  rating: 4,
  reviewOn: 'How to implement sitemap on sass',
  courseName: 'Building Scalable APIs with GraphQL'
}, {
  id: '02',
  avatar: avatar3,
  description: 'Far advanced settling say finished raillery. Offered chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Louis Ferguson',
  time: addOrSubtractDaysFromDate(4),
  rating: 3,
  reviewOn: 'How does an Angular application work?',
  courseName: 'Graphic Design Masterclass'
}, {
  id: '03',
  avatar: avatar5,
  description: 'Offered chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Carolyn Ortiz',
  time: addOrSubtractDaysFromDate(10),
  rating: 4,
  reviewOn: 'What is Flexbox and describe any elaborate on its most used properties??',
  courseName: 'Deep Learning with React-Native'
}, {
  id: '04',
  avatar: avatar8,
  description: 'Chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Dennis Barrett',
  time: addOrSubtractDaysFromDate(3),
  rating: 4,
  reviewOn: 'What are the different data types present in javascript?',
  courseName: 'Bootstrap 5 From Scratch'
}, {
  id: '05',
  avatar: avatar9,
  description: 'Chiefly farther Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.',
  name: 'Carolyn Ortiz',
  time: addOrSubtractDaysFromDate(8),
  rating: 4,
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
export const courseResumeData = [{
  id: '901',
  courseId: '1',
  playlist: [{
    title: 'Introduction of Digital Marketing',
    lectures: [{
      title: 'Introduction',
      time: '2m 10s',
      isNote: true
    }, {
      title: 'What is Digital Marketing What is Digital Marketing',
      time: 'Playing',
      isNote: true
    }, {
      title: 'Type of Digital Marketing',
      time: '18m 10s'
    }]
  }, {
    title: 'Customer Life cycle',
    lectures: [{
      title: 'Introduction',
      time: '2m 10s'
    }, {
      title: 'What is Digital Marketing What is Digital Marketing',
      time: '15m 10s'
    }, {
      title: 'Type of Digital Marketing',
      time: '18m 10s',
      isPremium: true
    }]
  }]
}, {
  id: '902',
  courseId: '2',
  playlist: [{
    title: 'Introduction of Sketch',
    lectures: [{
      title: 'Introduction',
      time: '2m 10s',
      isNote: true
    }, {
      title: 'What is Digital Marketing What is Digital Marketing',
      time: '15m 10s'
    }, {
      title: 'Type of Digital Marketing',
      time: '18m 10s'
    }]
  }, {
    title: 'YouTube Marketing',
    lectures: [{
      title: 'Video Flow',
      time: '25m 5s'
    }, {
      title: 'Webmaster Tool',
      time: '15m 20s'
    }, {
      title: 'Featured Contents on Channel',
      time: '32m 20s'
    }, {
      title: 'Managing Comments',
      time: '20m 20s',
      isPremium: true
    }, {
      title: 'Channel Analytics',
      time: '18m 20s',
      isPremium: true
    }]
  }]
}];
export const noticeBoard = [{
  title: 'Join New Instructor',
  description: 'Amongst moments do in arrived Fat weddings believed prospect',
  time: addOrSubtractHoursFromDate(8),
  icon: FaUserTie,
  variant: 'purple'
}, {
  title: 'Update New Course',
  description: 'Arrived Fat weddings believed prospect',
  time: addOrSubtractHoursFromDate(8),
  icon: FaBookOpen,
  variant: 'orange'
}, {
  title: 'Update Syllabus',
  description: 'Arrived Fat weddings believed prospect',
  time: addOrSubtractHoursFromDate(8),
  icon: FaBook,
  variant: 'info'
}, {
  title: 'Update New Feature',
  description: 'Arrived Fat weddings believed prospect',
  time: addOrSubtractHoursFromDate(8),
  icon: FaGlobe,
  variant: 'danger'
}];
export const studentData = [{
  id: '700',
  courseId: '1',
  location: 'mumbai',
  payments: 6205,
  progress: 85,
  totalCourse: 21
}, {
  id: '701',
  courseId: '2',
  location: 'Delhi',
  payments: 1256,
  progress: 60,
  totalCourse: 16
}, {
  id: '703',
  courseId: '3',
  location: 'New york',
  payments: 9256,
  progress: 74,
  totalCourse: 38
}, {
  id: '700',
  courseId: '1',
  location: 'California',
  payments: 10688,
  progress: 45,
  totalCourse: 38
}, {
  id: '700',
  courseId: '1',
  location: 'Chennai',
  payments: 856,
  progress: 90,
  totalCourse: 5
}, {
  id: '700',
  courseId: '1',
  location: 'Canada',
  payments: 3578,
  progress: 30,
  totalCourse: 14
}];
export const eventScheduleData = [{
  id: '1',
  day: addOrSubtractDaysFromDate(10),
  events: [{
    avatar: avatar1,
    title: 'Grad Opening',
    description: 'by Lori Stevens Chairman of Eduport',
    time: addOrSubtractHoursFromDate(1)
  }, {
    avatar: avatar2,
    title: 'The Modern Engineering Methods',
    description: 'by Billy Vasquez Partner Startup',
    time: addOrSubtractHoursFromDate(4),
    isCoffeeBreak: true
  }, {
    avatar: avatar4,
    title: 'Evolution of User Experience',
    description: 'by Larry Lawson Co-founder and Carolyn Ortiz Eduport Director',
    time: addOrSubtractHoursFromDate(7)
  }, {
    avatar: avatar6,
    title: 'Responsive Web Applications',
    description: 'by Jacqueline Miller Head Engineer',
    time: addOrSubtractHoursFromDate(2)
  }]
}, {
  id: '2',
  day: addOrSubtractDaysFromDate(4),
  events: [{
    avatar: avatar3,
    title: 'Autonomous Vehicles',
    description: 'Billy Vasquez Chairman of wizixo',
    time: addOrSubtractHoursFromDate(2)
  }, {
    avatar: avatar5,
    title: 'Global Innovations in Media',
    description: 'Lori Stevens VP Design wizixo',
    time: addOrSubtractHoursFromDate(4),
    isCoffeeBreak: true
  }, {
    avatar: avatar6,
    title: 'Value and Building Blocks ',
    description: 'Frances Guerrero</a> Co-founder wizixo',
    time: addOrSubtractHoursFromDate(8),
    isLunchBreak: true
  }, {
    avatar: avatar8,
    title: 'The Digital Economy',
    description: 'Louis Ferguson Web Technologist',
    time: addOrSubtractHoursFromDate(10)
  }]
}, {
  id: '3',
  day: addOrSubtractDaysFromDate(8),
  events: [{
    avatar: avatar3,
    title: 'Autonomous Vehicles',
    description: 'Billy Vasquez Chairman of wizixo',
    time: addOrSubtractHoursFromDate(7)
  }, {
    avatar: avatar5,
    title: 'Global Innovations in Media ',
    description: 'Lori Stevens VP Design wizixo',
    time: addOrSubtractHoursFromDate(8),
    isCoffeeBreak: true
  }, {
    avatar: avatar6,
    title: 'Value and Building Blocks',
    description: 'Frances Guerrero</a> Co-founder wizixo',
    time: addOrSubtractHoursFromDate(5),
    isLunchBreak: true
  }, {
    avatar: avatar8,
    title: 'The Digital Economy',
    description: 'Louis Ferguson Web Technologist',
    time: addOrSubtractHoursFromDate(25)
  }]
}, {
  id: '4',
  day: addOrSubtractDaysFromDate(9),
  events: [{
    avatar: avatar1,
    title: 'Grad Opening',
    description: 'by Lori Stevens Chairman of Eduport',
    time: addOrSubtractHoursFromDate(5)
  }, {
    avatar: avatar2,
    title: 'The Modern Engineering Methods',
    description: 'by Billy Vasquez Partner Startup',
    time: addOrSubtractHoursFromDate(3),
    isCoffeeBreak: true
  }, {
    avatar: avatar4,
    title: 'Evolution of User Experience',
    description: 'by Larry Lawson Co-founder and Carolyn Ortiz Eduport Director',
    time: addOrSubtractHoursFromDate(11)
  }, {
    avatar: avatar6,
    title: 'Responsive Web Applications',
    description: 'by Jacqueline Miller Head Engineer',
    time: addOrSubtractHoursFromDate(20)
  }]
}];
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
