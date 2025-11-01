const root = document.documentElement;
const style = getComputedStyle(root);
export const reviewsAnalyticsChart = {
  series: [80, 30],
  labels: ['Positive', 'Negative'],
  chart: {
    height: 300,
    width: 300,
    type: 'donut',
    sparkline: {
      enabled: !0
    }
  },
  stroke: {
    colors: ['transparent']
  },
  colors: [style.getPropertyValue('--bs-success'), style.getPropertyValue('--bs-danger')],
  tooltip: {
    theme: 'dark'
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        height: 100,
        width: 100
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
};
