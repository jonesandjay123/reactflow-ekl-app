export const jsonData = {
  arrange: "LR",
  edges: [
    { source_id: "start", target_id: "parent" },
    { source_id: "parent", target_id: "end" },
    // 當展開 parent 時的邊可以在 React 組件中動態添加
    // { source_id: "start", target_id: "child1" },
    // { source_id: "child1", target_id: "end" },
    // { source_id: "child2", target_id: "end" },
  ],
  nodes: {
    children: [
      {
        id: "start",
        value: {
          label: "Start",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:#e8f7e4;",
        },
      },
      {
        id: "parent",
        value: {
          label: "Parent",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:#ffefeb;",
        },
        children: [
          {
            id: "child1",
            value: {
              label: "Child1",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "child2",
            value: {
              label: "Child2",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
        ],
      },
      {
        id: "end",
        value: {
          label: "End",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:#e8f7e4;",
        },
      },
    ],
  },
};
