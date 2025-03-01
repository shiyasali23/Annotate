import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * Helper to draw a node (text + background rect) fully centered.
 * - lines: array of strings (lines of text)
 * - config: { backgroundColor, textColor, fontSize, fontWeight, paddingX, paddingY, rx, ry }
 */
function drawNode(selection, lines, {
  backgroundColor,
  textColor,
  fontSize = '10px',
  fontWeight = 'normal',
  paddingX = 9,
  paddingY = 7,
  rx = 4,
  ry = 4
}) {
  // Create a sub-group for the text and rect
  const nodeGroup = selection.append('g');

  // For multiple lines, we vertically center them around (0,0).
  const lineHeightEm = 1.2; // spacing between lines in "em" units
  const offsetEm = (lines.length - 1) * 0.5 * lineHeightEm;

  // Append a <text> element
  const textElem = nodeGroup
    .append('text')
    .attr('fill', textColor)
    .attr('font-size', fontSize)
    .attr('font-weight', fontWeight)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle');

  // Add each line via <tspan>, shifting subsequent lines downward
  lines.forEach((line, i) => {
    textElem
      .append('tspan')
      .attr('x', 0)
      .attr('dy', i === 0 ? `-${offsetEm}em` : `${lineHeightEm}em`)
      .text(line);
  });

  // Measure the bounding box of the entire text block
  const bbox = textElem.node().getBBox();

  // Insert a rectangle behind the text, sized to bbox + padding
  nodeGroup
    .insert('rect', 'text')
    .attr('x', bbox.x - paddingX)
    .attr('y', bbox.y - paddingY)
    .attr('width', bbox.width + 2 * paddingX)
    .attr('height', bbox.height + 2 * paddingY)
    .attr('fill', backgroundColor)
    .attr('rx', rx)
    .attr('ry', ry);
}

const ConditionsTree = ({ biochemicalsArray, isHyper, isVertical = true }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Resize observer to keep the visualization responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (
      !svgRef.current ||
      !containerRef.current ||
      !biochemicalsArray ||
      biochemicalsArray.length === 0 ||
      dimensions.width === 0
    ) {
      return;
    }

    // Clear existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    /*************************************************
     * 1) Build the data structure for the D3 tree
     *************************************************/
    const biochemicalMap = new Map();
    biochemicalsArray.forEach(bio => {
      if (!biochemicalMap.has(bio.name)) {
        biochemicalMap.set(bio.name, { data: bio, conditions: new Set() });
      }
      bio.conditions.forEach(cond => {
        biochemicalMap.get(bio.name).conditions.add(cond);
      });
    });

    const biochemicalNodes = Array.from(biochemicalMap.entries()).map(([name, obj]) => {
      return {
        name,
        data: obj.data, // entire biochemical object
        children: Array.from(obj.conditions).map(c => ({ name: c }))
      };
    });

    const rootData = {
      name: isHyper ? 'Hyper Biochemicals' : 'Hypo Biochemicals',
      children: biochemicalNodes
    };

    /*************************************************
     * 2) Set up the tree layout
     *************************************************/
    const width = dimensions.width;
    // Increase the height to give more vertical space
    const height = dimensions.height;
    // Adjust margins to give more room, especially at the bottom
    const margin = { top: 20, right: 30, bottom: 50, left: 30 };

    // Create a dynamically sized SVG that can scroll if needed
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', Math.max(height, 500)); // Ensure minimum height

    let treeLayout, linkGenerator, nodeTransform;
    if (isVertical) {
      // Vertical layout: top -> bottom
      treeLayout = d3.tree()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        // Increase the separation factor between nodes at the same level
        .separation((a, b) => (a.parent === b.parent ? 2.5 : 2));

      linkGenerator = d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y);

      nodeTransform = d => `translate(${d.x},${d.y})`;
    } else {
      // Horizontal layout: left -> right
      treeLayout = d3.tree()
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
        // Increase separation for horizontal layout too
        .separation((a, b) => (a.parent === b.parent ? 2.5 : 2));

      linkGenerator = d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x);

      nodeTransform = d => `translate(${d.y},${d.x})`;
    }

    const hierarchyRoot = d3.hierarchy(rootData);
    treeLayout(hierarchyRoot);

    /*************************************************
     * 3) Draw links
     *************************************************/
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.selectAll('.link')
      .data(hierarchyRoot.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#7B1D24')
      .attr('stroke-width', 2);

    /*************************************************
     * 4) Draw nodes
     *************************************************/
    const node = g.selectAll('.node')
      .data(hierarchyRoot.descendants())
      .enter()
      .append('g')
      .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'}`)
      .attr('transform', nodeTransform);

    // 1) Use #1F2240 for the root node background (hypo/hyper conditions)
    const rootNodes = node.filter(d => d.depth === 0);
    rootNodes.each(function(d) {
      drawNode(
        d3.select(this),
        [ d.data.name ],
        {
          backgroundColor: 'rgb(0, 37, 45)',
          textColor: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          
        }
      );
    });

    // 2) Use a darker variant of #006A71 for biochemical nodes background
    const bioNodes = node.filter(d => d.depth === 1);
    bioNodes.each(function(d) {
      const { name, data } = d.data;
      const line1 = `${name}: ${data.value} ${data.unit}`;
      const line2 = data.isHyper
        ? `Max healthy: ${data.healthy_max}`
        : `Min healthy: ${data.healthy_min}`;

      drawNode(
        d3.select(this),
        [ line1, line2 ],
        {
          backgroundColor: 'rgb(12, 59, 74)  ',
          textColor: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          
        }
      );
    });

    // 3) Use a very darker variant of #6F5C7C for condition nodes background
    const conditionNodes = node.filter(d => d.depth === 2);
    
    // First, we'll calculate how many condition nodes we have to determine better spacing
    const conditionCount = conditionNodes.size();
    
    // Apply spacing based on node count - we'll stagger them if needed
    conditionNodes.each(function(d, i) {
      // Add a slight vertical offset to alternate nodes if they're crowded
      let verticalOffset = 0;
      if (conditionCount > 6) {
        verticalOffset = i % 2 === 0 ? -15 : 15;
      }
      
      // Apply the transform with the offset
      d3.select(this)
        .attr('transform', `${nodeTransform(d)} translate(0,${verticalOffset})`);
      
      drawNode(
        d3.select(this),
        [ d.data.name ],
        {
          backgroundColor: 'rgb(13, 71, 91)',
          textColor: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          
        }
      );
    });

    // Adjust the SVG height after drawing to accommodate all content
    const gBBox = g.node().getBBox();
    const newHeight = gBBox.height + margin.top + margin.bottom;
    svg.attr('height', Math.max(height, newHeight));

  }, [biochemicalsArray, isHyper, dimensions, isVertical]);

  return (
    <div
      className={`w-full h-[400px] shadow-[0_0_8px_2px_rgba(0,0,0,0.05)] py-3 bg-[#F3F3F3]`} 
      ref={containerRef}
      
    >
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default ConditionsTree;