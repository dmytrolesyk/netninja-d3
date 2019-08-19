const margin = {
  top: 40,
  right: 20,
  bottom: 50,
  left: 100,
};

const svgWidth = 560;
const svgHeight = 400;

const graphWidth = svgWidth - margin.left - margin.right;
const graphHeight = svgHeight - margin.top - margin.bottom;

const svg = d3
  .select('#canvas')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

const graph = svg
  .append('g')
  .attr('widht', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);


const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

const xAxisGroup = graph
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph
  .append('g')
  .attr('class', 'y-axis');

const line = d3
  .line()
  .x(d => x(new Date(d.date)))
  .y(d => y(d.distance));

const path = graph.append('path');

const linesGroup = graph
  .append('g')
  .style('opacity', 0)

const xLine = linesGroup
  .append('line')
  .attr('stroke', '#ccc')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', '10 10')

const yLine = linesGroup
  .append('line')
  .attr('stroke', '#ccc')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', '10 10')

const updateChart = (data) => {
  data = data
    .filter(item => item.activity === activity)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  x.domain(d3.extent(data, d => new Date(d.date)));
  y.domain([0, d3.max(data, d => d.distance)]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(4)
    .tickFormat(d3.timeFormat('%b %d'));

  const yAxis = d3
    .axisLeft(y)
    .ticks(4)
    .tickFormat(d => d + ' m');

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  xAxisGroup
    .selectAll('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-40)');

  const circles = graph
    .selectAll('circle')
    .data(data);

  circles
    .exit()
    .remove();

  circles
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.distance));

  circles
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('fill', '#ccc')
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.distance));

  graph
    .selectAll('circle')
    .on('mouseover', (d, i, n) => {
      d3
        .select(n[i])
        .transition().duration(100)
          .attr('r', 8)
          .attr('fill', '#fff');
      xLine
        .attr('x1', x(new Date(d.date)))
        .attr('x2', x(new Date(d.date)))
        .attr('y1', y(d.distance))
        .attr('y2', graphHeight);
      yLine
        .attr('x1', x(new Date(d.date)))
        .attr('x2', 0)
        .attr('y1', y(d.distance))
        .attr('y2', y(d.distance));

      linesGroup.style('opacity', 1)

    })
    .on('mouseleave', (d, i, n) => {
      d3
        .select(n[i])
        .transition().duration(100)
          .attr('r', 4)
          .attr('fill', '#ccc');
      linesGroup.style('opacity', 0)
    })

  path
    .data([data])
    .attr('fill', 'none')
    .attr('stroke', '#00bfa5')
    .attr('stroke-width', 2)
    .attr('d', line)
};

let data = [];

db
  .collection('activities')
  .onSnapshot((res) => {
    data = [];
    res.forEach(doc => data.push({ ...doc.data(), id: doc.id }));
    updateChart(data);
  });
