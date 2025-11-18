const root = document.documentElement;
const style = getComputedStyle(root);
export const courseEarningChart = {
  series: [{
    name: 'Conversion',
    data: [200, 290, 500, 500, 430, 316, 478, 700]
  }],
  chart: {
    height: 130,
    type: 'area',
    sparkline: {
      enabled: !0
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  colors: [style.getPropertyValue('--bs-success')],
  xaxis: {
    type: 'category',
    categories: ['Dec 01', 'Dec 02', 'Dec 03', 'Dec 04', 'Dec 05', 'Dec 06', 'Dec 07', 'Dec 08', 'Dec 09 ', 'Dec 10', 'Dec 11']
  },
  grid: {},
  tooltip: {
    y: {
      title: {
        formatter: function () {
          return '';
        }
      }
    },
    marker: {
      show: !1
    }
  }
};
export const courseEarningChart2 = {
  series: [{
    name: 'Conversion',
    data: [200, 290, 325, 500, 600, 316, 478, 700]
  }],
  chart: {
    height: 130,
    type: 'area',
    sparkline: {
      enabled: !0
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  colors: [style.getPropertyValue('--bs-purple')],
  xaxis: {
    type: 'category',
    categories: ['Dec 01', 'Dec 02', 'Dec 03', 'Dec 04', 'Dec 05', 'Dec 06', 'Dec 07', 'Dec 08', 'Dec 09 ', 'Dec 10', 'Dec 11']
  },
  grid: {},
  tooltip: {
    y: {
      title: {
        formatter: function () {
          return '';
        }
      }
    },
    marker: {
      show: !1
    }
  }
};
