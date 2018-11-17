import _ from "lodash";

function Graph() {
  this._nodes = {};
}

Graph.prototype.addNode = function(value) {
  if (value === undefined) return;
  this._nodes[value] = this._nodes[value] || [];
};

Graph.prototype.removeNode = function(value) {
  const edges = [];
  this._nodes[value].forEach(neighbor => {
    const edge = [value, neighbor.val, neighbor.weight];
    var neighborsNeighbors = this._nodes[neighbor.val];
    var index = _.findIndex(neighborsNeighbors, n => n.val === value);
    neighborsNeighbors.splice(index, 1);
    edges.push(edge);
  });
  delete this._nodes[value];
  return edges;
};

Graph.prototype.contains = function(value) {
  return this._nodes[value] !== undefined;
};

Graph.prototype.addEdge = function(value1, value2, weight) {
  if (!this._nodes[value1] || !this._nodes[value2]) return "Invalid node value";
  const node1 = this._nodes[value1];
  const node2 = this._nodes[value2];
  const index1 = _.findIndex(node1, n => n.val === value2);
  const index2 = _.findIndex(node2, n => n.val === value1);
  if (index1 === -1) {
    this._nodes[value1].push({
      val: value2,
      weight
    });
  } else {
    this._nodes[value1][index1] = {
      val: value2,
      weight
    };
  }
  if (index2 === -1) {
    this._nodes[value2].push({ val: value1, weight });
  } else {
    this._nodes[value2][index2] = { val: value1, weight };
  }
};

Graph.prototype.removeEdge = function(value1, value2) {
  if (!this._nodes[value1] || !this._nodes[value2]) return "Invalid node value";
  if (!this.hasEdge(value1, value2)) {
    return null;
  }
  var value1Neighbors = this._nodes[value1];
  var value2Neighbors = this._nodes[value2];
  const index1 = _.findIndex(value1Neighbors, n => n.val === value2);
  const index2 = _.findIndex(value2Neighbors, n => n.val === value1);
  const { weight } = value1Neighbors[index1];
  value1Neighbors.splice(index1, 1);
  value2Neighbors.splice(index2, 1);
  return [value1, value2, weight];
};

Graph.prototype.hasEdge = function(value1, value2) {
  return _.findIndex(this._nodes[value1], n => n.val === value2) > -1;
};

Graph.prototype.forEach = function(fn) {
  for (var node in this._nodes) {
    fn(node, this._nodes[node], this._nodes);
  }
};

Graph.prototype.traverseDepthFirst = function(value, fn, visited, distance) {
  if (!this._nodes[value] || typeof fn !== "function")
    return "Invalid value or function";
  visited = visited || {};
  distance = distance || 0;
  fn(value, distance);
  visited[value] = true;
  this._nodes[value].forEach(function(neighbor) {
    if (visited[neighbor.val]) return;
    this.traverseDepthFirst(neighbor.val, fn, visited, distance + 1);
  }, this);
};

Graph.prototype.traverseBreadthFirst = function(value, fn) {
  if (!this._nodes[value] || typeof fn !== "function")
    return "Invalid value or function";
  var visited = {};
  var queue = [value];
  visited[value] = 0;
  while (queue.length) {
    var node = queue.shift();
    fn(node, visited[node]);
    var neighbors = this._nodes[node]
      .filter(function(neighbor) {
        if (visited[neighbor.val] === undefined) {
          visited[neighbor.val] = visited[node] + 1;
          return true;
        }
      })
      .map(node => node.val);
    queue = queue.concat(neighbors);
  }
};

export default Graph;
