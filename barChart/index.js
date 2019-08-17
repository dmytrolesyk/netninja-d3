const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600);

const margin = {
  top: 20,
  right: 20,
  bottom: 100,
  left: 100,
};

const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const x = d3
  .scaleBand()
  .range([0, 500])
  .paddingInner(0.2)
  .paddingOuter(0.2);

const y = d3
  .scaleLinear()
  .range([graphHeight, 0]);

const xAxisGroup = graph
  .append('g')
  .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g');

const xAxis = d3.axisBottom(x);

const yAxis = d3
  .axisLeft(y)
  .ticks(3)
  .tickFormat(d => `${d} orders`);

xAxisGroup
  .selectAll('text')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end');

const t = d3.transition().duration(600);

const updateBarChart = (data) => {
  y.domain([0, d3.max(data, d => d.orders)]);
  x.domain(data.map(_ => _.name));

  const rects = graph
    .selectAll('rect')
    .data(data);

  rects.exit().remove();

  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))

  rects
    .enter()
    .append('rect')
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    .attr('y', graphHeight)
    .attr('height', 0)
    .merge(rects)
      .transition(t)
      .attrTween('width', widthTween)
        .attr('y', d => y(d.orders))
        .attr('height', d => graphHeight - y(d.orders));

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};

db
  .collection('dishes')
  .onSnapshot(res => {
    const data = [];
    res.forEach(doc => data.push(doc.data()));
    updateBarChart(data);
  });

const widthTween = (d) => {
  const i = d3.interpolate(0, x.bandwidth());
  return t => i(t);
};
