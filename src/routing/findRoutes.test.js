import findRoutes, { ksp } from "./findRoutes";
import Graph from "../utils/graph";

it("should go from origin to destination", () => {
  const results = findRoutes(
    { lat: 1.322522, lng: 103.815403 },
    { lat: 1.29321, lng: 103.852216 }
  );
  const steps = results[0].steps;
  expect(steps[0].from).toBe("origin");
  expect(steps[steps.length - 1].to).toBe("destination");
});

it("ksp should return k shortest paths from source to destination", () => {
  const expectedPaths = [
    ["c", "e", "f", "h"],
    ["c", "d", "e", "f", "h"],
    ["c", "e", "g", "h"]
  ];
  const graph = new Graph();
  graph.addNode("c");
  graph.addNode("e");
  graph.addNode("d");
  graph.addNode("g");
  graph.addNode("f");
  graph.addNode("h");

  graph.addEdge("c", "d", 3);
  graph.addEdge("c", "e", 2);
  graph.addEdge("e", "d", 1);
  graph.addEdge("d", "f", 4);
  graph.addEdge("f", "h", 1);
  graph.addEdge("g", "h", 2);
  graph.addEdge("e", "g", 3);
  graph.addEdge("f", "g", 2);
  graph.addEdge("e", "f", 2);

  const paths = ksp(graph, "c", "h", 3);
  expect(paths).toEqual(expectedPaths);
});
