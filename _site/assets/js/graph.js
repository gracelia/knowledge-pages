const palette = {
  accent1: '#E8527A',
  accent2: '#2D1B69',
  accent3: '#F9A8C0',
  accent4: '#a78bfa',
  accent5: '#fda4af',
};
const paletteList = Object.values(palette);

const container = document.getElementById('graph-container');
const tooltip = document.getElementById('tooltip');
const legend = document.getElementById('graph-legend');

const width = container.clientWidth;
const height = container.clientHeight;

const svg = d3.select('#graph-container').append('svg')
  .attr('width', width)
  .attr('height', height);

const g = svg.append('g');

// Zoom
svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform)));

const nodes = graphData.nodes.map(d => ({ ...d }));
const links = graphData.links.map(d => ({ ...d }));

// Assign colors by group
const groups = [...new Set(nodes.map(n => n.group))];
const groupColor = {};
groups.forEach((g, i) => { groupColor[g] = paletteList[i % paletteList.length]; });

// Node degree for sizing
const degree = {};
links.forEach(l => {
  degree[l.source] = (degree[l.source] || 0) + 1;
  degree[l.target] = (degree[l.target] || 0) + 1;
});

const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(90))
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 12));

function nodeRadius(d) {
  const base = d.is_folder ? 22 : 14;
  return base + Math.min((degree[d.id] || 0) * 2, 12);
}

const link = g.append('g')
  .selectAll('line')
  .data(links)
  .join('line')
  .attr('stroke', '#1A1A1A')
  .attr('stroke-opacity', 0.18)
  .attr('stroke-width', 1.5);

const node = g.append('g')
  .selectAll('g')
  .data(nodes)
  .join('g')
  .attr('cursor', d => d.path ? 'pointer' : 'default')
  .call(d3.drag()
    .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
    .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

node.append('circle')
  .attr('r', nodeRadius)
  .attr('fill', d => groupColor[d.group] || palette.accent5)
  .attr('stroke', '#E8527A')
  .attr('stroke-width', d => d.is_folder ? 3 : 2);

node.append('text')
  .text(d => d.label)
  .attr('text-anchor', 'middle')
  .attr('dy', d => nodeRadius(d) + 14)
  .attr('font-size', d => d.is_folder ? '12px' : '11px')
  .attr('font-weight', d => d.is_folder ? '700' : '500')
  .attr('fill', '#1A1A1A');

node
  .on('mouseover', (e, d) => {
    tooltip.style.opacity = 1;
    tooltip.textContent = d.label;
  })
  .on('mousemove', e => {
    tooltip.style.left = (e.offsetX + 12) + 'px';
    tooltip.style.top = (e.offsetY - 8) + 'px';
  })
  .on('mouseout', () => { tooltip.style.opacity = 0; })
  .on('click', (e, d) => {
    if (d.path) window.location.href = baseurl + '/content.html?file=' + encodeURIComponent(d.path);
  });

simulation.on('tick', () => {
  link
    .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
  node.attr('transform', d => `translate(${d.x},${d.y})`);
});

// Legend
groups.forEach(grp => {
  const item = document.createElement('div');
  item.className = 'legend-item';
  item.innerHTML = `<div class="legend-dot" style="background:${groupColor[grp]}"></div>${grp.replace(/-/g, ' ')}`;
  legend.appendChild(item);
});
