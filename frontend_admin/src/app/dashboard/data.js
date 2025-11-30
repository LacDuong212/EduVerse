const style = getComputedStyle(root);

export const earningChat = {
  series: [{
    name: 'Payout',
    data: []
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
    categories: [],
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
      show: false
    }
  }
};
