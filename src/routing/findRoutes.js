import _ from "lodash";
import dijkstra from "../utils/dijkstra";
import PriorityQueue from "priorityqueuejs";
import { stations, lines } from "./mrt.json";
import Graph from "../utils/graph";

/*
	Returns the best routes between the origin and destination.

	Arguments origin and destination are { lat, lng } objects.
	Returns an array of the best routes. You may define "best" using any reasonable metric and document your definition.

	Each route is an object which must contain a "steps" array. You may add additional properties as needed.
	Each step can represent a "walk", "ride" or "change", and must have at least the following properties:
	- { type: "walk", from: <stationId> or "origin", to: <stationId> or "destination" }
	- { type: "ride", line: <lineId>, from: <stationId>, to: <stationId> }
	- { type: "change", station: <stationId>, from: <lineId>, to: <lineId> }
	You may add additional properties as needed.

	Example:

	findRoutes({ lat: 1.322522, lng: 103.815403 }, { lat: 1.29321, lng: 103.852216 })

	should return something like:

	[
		{ steps: [
			{ type: "walk", from: "origin", to: "botanic_gardens" },
			{ type: "ride", line: "CC", from: "botanic_gardens", to: "buona_vista" },
			{ type: "change", station: "buona_vista", from: "CC", to: "EW" },
			{ type: "ride", line: "EW", from: "buona_vista", to: "bugis" },
			{ type: "walk", from: "bugis", to: "destination" }
		] },
		{ steps: [
			// worse route
		] }
	]

*/

/**
 *
 * @param {Object} origin
 * @param {Object} destination
 * @param {string} destination name
 * Find the best path from origin to destination
 * A best path is ranked based on the amount of distance user have to travel in terms of km
 * and minimizing the walking distance
 * This function uses Yen's k shortest path algorithm to find best paths between two locations
 * It assumes that all the lines are connected with each other
 * Best path can be changed by changing the way the weight of an edge of graph is calculated
 * like it can be a function of line change and distance
 * returns empty array if distance between nearest station is more than 5 kmn
 */
export default function findRoutes(origin, destination) {
  try {
    const graph = new Graph();
    for (let i in stations) {
      graph.addNode(i);
    }
    const sourceStation = findNearestStation(stations, origin);
    const destinationStation = findNearestStation(stations, destination);
    if (sourceStation.distance > 5 || destinationStation.distance > 5) {
      return [];
    }
    const hash = {};
    for (let i in lines) {
      const line = lines[i];
      const len = line.route.length;
      for (let j = 1; j < len; j++) {
        const source = line.route[j - 1];
        const des = line.route[j];
        const distance = Number(delta(stations[source], stations[des]));
        graph.addEdge(source, des, distance);
      }
      for (let j = 0; j < len; j++) {
        const source = line.route[j];
        if (source in hash) {
          hash[source] = [...hash[source], i];
        } else {
          hash[source] = [i];
        }
      }
    }
    const paths = ksp(
      graph,
      sourceStation.station,
      destinationStation.station,
      3
    );
    const routes = _.map(paths, path =>
      makeRoute(path, hash, sourceStation, destinationStation)
    );
    console.log(routes);
    console.log(paths);
    return routes;
  } catch (e) {
    console.error(e);
    // send to sentry
  }
}

/*
  Find Distance in km between two coordinates
*/
function delta(obj1, obj2) {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((obj2.lat - obj1.lat) * p) / 2 +
    (c(obj1.lat * p) * c(obj2.lat * p) * (1 - c((obj2.lng - obj1.lng) * p))) /
      2;

  return (12742 * Math.asin(Math.sqrt(a))).toFixed(3); //in km
}

/**
 *
 * @param {Number} unit
 * convert  km to meters
 */
function KmToM(unit) {
  return unit * 1000;
}

/**
 *
 * @param {Array[string]} stations
 * @param {{lat: number, lng: number}} location
 * Find the nearest mrt station to the given location
 */
function findNearestStation(stations, location) {
  let distance = Infinity;
  let nearestStation = null;
  _.forEach(stations, (station, key) => {
    const currDistance = delta(station, location);
    if (currDistance < distance) {
      distance = currDistance;
      nearestStation = key;
    }
  });
  return {
    distance,
    station: nearestStation
  };
}

/**
 *
 * @param {number} distance
 * get formatted distance
 */
function getFormattedDistance(distance) {
  return distance < 1
    ? `${KmToM(Number(distance))} m`
    : `${parseInt(distance).toFixed(2)} km`;
}

/**
 *
 * @param {Array[string]} arr
 * @param {Object} hash
 * @param {Object} source
 * @param {Object} dest
 * create step object based on given best path
 */
function makeRoute(arr, hash, source, dest) {
  const result = [];
  result.push({
    type: "walk",
    from: "origin",
    to: source.station,
    distance: getFormattedDistance(source.distance)
  });
  let commonLine = null;
  let currLines = hash[arr[0]];
  let nextLines = hash[arr[1]];
  let start = arr[0];
  let stations = 0;
  // Common line will be intersection of current line and next lines
  commonLine = _.intersection(currLines, nextLines)[0];
  for (let i = 1; i < arr.length - 1; i++) {
    const currLines = hash[arr[i]];
    stations += 1;
    if (_.indexOf(currLines, commonLine) === -1) {
      const nextLines = hash[arr[i + 1]];
      const newLine = _.intersection(currLines, nextLines)[0];
      result.push({
        type: "ride",
        line: commonLine,
        from: start,
        to: arr[i - 1],
        stations: stations - 2
      });
      result.push({
        type: "change",
        station: arr[i - 1],
        from: commonLine,
        to: newLine
      });
      commonLine = newLine;
      start = arr[i - 1];
      stations = 0;
    }
  }
  result.push({
    type: "ride",
    line: commonLine,
    from: start,
    to: arr[arr.length - 1]
  });
  result.push({
    type: "walk",
    from: arr[arr.length - 1],
    to: "destination",
    distance: getFormattedDistance(dest.distance)
  });
  return { steps: result };
}

/**
 *
 * @param {priority Queue} q
 * @param {Array} path
 * return true if queue contains given path
 */
function PqContains(q, path) {
  let bool = false;
  q.forEach(item => {
    if (_.isEqual(item, path)) {
      bool = true;
    }
  });
  return bool;
}

function formatEdges(edges) {
  return _.map(Array.from(edges), edge => edge.split("-"));
}

function addEdges(graph, edges) {
  for (let edge of edges) {
    const [from, to, weight] = edge;
    graph.addEdge(from, to, Number(weight));
  }
}

function addNodes(graph, nodes) {
  _.forEach(Array.from(nodes), node => {
    graph.addNode(node);
  });
}

/**
 *
 * @param {Graph} graph
 * @param {source node} source
 * @param {destination node} dest
 * @param {number of paths} K
 * Returns k best paths from source to destination based on the weight of edges between them
 * This function implements Yen's k shortest paths algorithm
 * Ref: https://wikivisually.com/wiki/Yen%27s_algorithm
 * Ref: https://mathscinet.ams.org/mathscinet-getitem?mr=0253822
 */
export function ksp(graph, source, dest, K) {
  const ksp = [];
  const candidates = new PriorityQueue(function(a, b) {
    return b.distance - a.distance;
  });
  const graphClone = JSON.parse(JSON.stringify(graph._nodes));
  let kthPath = dijkstra.find_path(graph._nodes, source, dest);
  ksp.push(kthPath);
  for (let k = 1; k < K; k++) {
    const prevPath = ksp[k - 1];
    for (let i = 0; i < prevPath.length - 1; i++) {
      const removedEdges = new Set();
      const removedNodes = new Set();
      const spurNode = prevPath[i];
      let rootPath = prevPath.slice(0, i);
      for (let p of ksp) {
        let stub = p.slice(0, i);
        if (_.isEqual(rootPath, stub)) {
          const from = p[i];
          const to = p[i + 1];
          let edge = graph.removeEdge(from, to);
          if (edge) {
            const [start, end, weight] = edge;
            removedEdges.add(`${start}-${end}-${weight}`);
          }
        }
      }
      for (let root of rootPath) {
        if (root !== spurNode) {
          let edges = graph.removeNode(root);
          removedNodes.add(root);
          for (let edge of edges) {
            const [start, end, weight] = edge;
            removedEdges.add(`${start}-${end}-${weight}`);
          }
        }
      }
      let spurPath = dijkstra.find_path(graph._nodes, spurNode, dest);
      if (!_.isEmpty(spurPath)) {
        let totalPath = [...rootPath];
        totalPath = totalPath.concat(spurPath);
        let distance = 0;
        for (let t = 0; t < totalPath.length - 1; t++) {
          const e1 = totalPath[t];
          const e2 = totalPath[t + 1];
          const ind = _.findIndex(graphClone[e1], n => n.val === e2);
          distance += graphClone[e1][ind].weight;
        }
        const pathObj = {
          path: [...totalPath],
          distance
        };
        if (!PqContains(candidates, pathObj)) {
          candidates.enq(pathObj);
        }
      }
      addNodes(graph, removedNodes);
      addEdges(graph, formatEdges(removedEdges));
    }
    let isNewPath = false;
    do {
      isNewPath = true;
      if (!candidates.isEmpty()) {
        kthPath = candidates.deq();
        for (let p in ksp) {
          if (_.isEqual(p, kthPath)) {
            isNewPath = false;
            break;
          }
        }
      }
    } while (!isNewPath);
    if (kthPath == null) break;
    if (_.isEqual(prevPath, kthPath)) {
      return ksp;
    }
    ksp.push(kthPath.path);
  }
  return ksp;
}

export const allStations = stations;
export const allLines = lines;
