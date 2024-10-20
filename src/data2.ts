// src/data2.ts

export const jsonData = {
  arrange: "LR",
  edges: [
    // main edges
    { source_id: "nodeA", target_id: "nodeB" },
    { source_id: "nodeB", target_id: "nodeC" },
    // edges between children
    { source_id: "nodeA.child1", target_id: "nodeA.child2" },
    // edges between parent and child
    { source_id: "nodeA", target_id: "nodeB.child1" },
    { source_id: "nodeB.child1", target_id: "nodeC" },
    // edges between children of different parents
    { source_id: "nodeA.child2", target_id: "nodeB.child2" },
  ],
  nodes: {
    children: [
      {
        id: "nodeA",
        value: {
          label: "Node A",
          style: "fill:#FFCCCC;",
          rx: 5,
          ry: 5,
        },
        children: [
          {
            id: "nodeA.child1",
            value: {
              label: "Node A Child 1",
              style: "fill:#FF9999;",
              rx: 5,
              ry: 5,
            },
          },
          {
            id: "nodeA.child2",
            value: {
              label: "Node A Child 2",
              style: "fill:#FF6666;",
              rx: 5,
              ry: 5,
            },
          },
        ],
      },
      {
        id: "nodeB",
        value: {
          label: "Node B",
          style: "fill:#CCFFCC;",
          rx: 5,
          ry: 5,
        },
        children: [
          {
            id: "nodeB.child1",
            value: {
              label: "Node B Child 1",
              style: "fill:#99FF99;",
              rx: 5,
              ry: 5,
            },
          },
          {
            id: "nodeB.child2",
            value: {
              label: "Node B Child 2",
              style: "fill:#66FF66;",
              rx: 5,
              ry: 5,
            },
          },
        ],
      },
      {
        id: "nodeC",
        value: {
          label: "Node C",
          style: "fill:#CCCCFF;",
          rx: 5,
          ry: 5,
        },
        // no children
      },
    ],
  },
};
