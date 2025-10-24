import { FaGem, FaTv, FaUserGraduate } from 'react-icons/fa';

const root = document.documentElement;
const style = getComputedStyle(root);

export const basicChartOpts = {
  series: [{
    name: 'Payout',
    data: [2909, 1259, 950, 1563, 1825, 2526, 2010, 3260, 3005, 3860, 4039]
  }],
  chart: {
    height: 300,
    type: 'area',
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: true
  },
  stroke: {
    curve: 'smooth'
  },
  colors: [style.getPropertyValue('--bs-primary')],
  xaxis: {
    type: 'category',
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct ', 'Nov', 'Dec'],
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: [{
    axisTicks: {
      show: false
    },
    axisBorder: {
      show: false
    }
  }],
  tooltip: {
    y: {
      title: {
        formatter: function () {
          return '' + '$';
        }
      }
    },
    marker: {
      show: !1
    }
  }
};
export const counterData = [{
  count: 25,
  title: 'Total Courses',
  icon: FaTv,
  variant: 'warning'
}, {
  count: 25,
  title: 'Total Students',
  icon: FaUserGraduate,
  suffix: 'K+',
  variant: 'purple'
}, {
  count: 12,
  title: 'Enrolled Students',
  icon: FaGem,
  suffix: 'k',
  variant: 'info'
}];

export const getInstructorCounterData = () => {

};

export const getInstructorEarningsData = () => {

};

export const getInstructorTopCoursesData = () => {

};

