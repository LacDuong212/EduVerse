const root = document.documentElement;
const style = getComputedStyle(root);
export const earningChat = {
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
export const chartTrafficViews = {
  series: [70, 15, 10, 5],
  labels: ['Course-1', 'Course-2', 'Course-3', 'Course-4'],
  chart: {
    height: 200,
    width: 200,
    offsetX: 0,
    type: 'donut',
    sparkline: {
      enabled: !0
    }
  },
  colors: [style.getPropertyValue('--bs-primary'), style.getPropertyValue('--bs-success'), style.getPropertyValue('--bs-warning'), style.getPropertyValue('--bs-danger')],
  tooltip: {
    theme: 'dark'
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200,
        height: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
};
