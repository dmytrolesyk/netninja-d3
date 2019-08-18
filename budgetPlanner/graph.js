const dims = {
  height: 300,
  width: 300,
  radius: 150,
};

const cent = {
  x: dims.width / 2 + 5,
  y: dims.height / 2 + 5,
};

const svg = d3
  .select('#canvas')
  .append('svg')
  .attr('width', dims.width + 150)
  .attr('height', dims.height + 150);

const graph = svg
  .append('g')
  .attr('transform', `translate(${cent.x}, ${cent.y})`);

const pie = d3
  .pie()
  .sort(null)
  .value(d => d.cost);

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

const colour = d3.scaleOrdinal(d3['schemeSet2']);

const arcTweenEnter = (dataItem) => {
  const i = d3.interpolate(dataItem.endAngle, dataItem.startAngle);
  return t => {
    dataItem.startAngle = i(t);
    return arcPath(dataItem);
  };
};

const arcTweenExit = (dataItem) => {
  const i = d3.interpolate(dataItem.startAngle, dataItem.endAngle);
  return t => {
    dataItem.startAngle = i(t);
    return arcPath(dataItem);
  };
};

function arcTweenUpdate(dataItem) {
  const i = d3.interpolate(this._current, dataItem);
  this._current = dataItem;
  return function(t){ 
    return arcPath(i(t))
  };
}

const legendGroup = svg
  .append('g')
  .attr('transform', `translate(${dims.width + 40}, 10)`)

const legend = d3
  .legendColor()
  .shape('circle')
  .shapePadding(10)
  .scale(colour);

const tip = d3
  .tip()
  .attr('class', 'tip card')
  .html(({ data: { name, cost } }) => `
      <div>${name}</div>
      <div>${cost}</div>
      <div class="delete">Click slice to delete</div>
    `);

graph.call(tip);

const handleMouseOver = (d, i, n) => {
  tip.show(d, n[i]);
  d3
    .select(n[i])
    .transition('changeSliceFill').duration(300)
      .attr('fill', '#fff');
};

const handleMouseOut = ({ data }, i, n) => {
  tip.hide();
  d3
    .select(n[i])
    .transition('changeSliceFill').duration(300)
      .attr('fill', colour(data.name));
};

const handleClick = ({ data: { id } }) => {
  db
    .collection('expenses')
    .doc(id)
    .delete();
};

const updateChart = (data) => {

  colour.domain(data.map(d => d.name));

  legendGroup.call(legend);
  legendGroup
    .selectAll('text')
    .attr('fill', '#fff');

  const paths = graph
    .selectAll('path')
    .data(pie(data));

  paths
    .exit()
    .transition().duration(750)
    .attrTween('d', arcTweenExit)
    .remove();

  paths
    .transition()
      .duration(750)
      .attrTween('d', arcTweenUpdate);
  
  paths
    .enter()
    .append('path')
    .attr('fill', ({ data }) => colour(data.name))
    .attr('class', 'arc')
    .attr('stroke', '#fff')
    .attr('stroke-width', '3px')
    .each(function(d) {
      this._current = d;
    })
    .transition()
      .duration(750)
      .attrTween('d', arcTweenEnter);

  graph
    .selectAll('path')
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut)
    .on('click', handleClick)
};

db
  .collection('expenses')
  .onSnapshot((res) => {
    const data = [];
    res.forEach(doc => data.push({ ...doc.data(), id: doc.id }));
    updateChart(data);
  });
