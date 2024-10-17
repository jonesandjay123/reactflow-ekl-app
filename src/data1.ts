// src/data1.ts

export const jsonData = {
  arrange: "LR",
  edges: [
    { source_id: "start", target_id: "rmt_dags" },
    { source_id: "rmt_dags", target_id: "sens_stress_esg_mas_mgr" },
    { source_id: "sens_stress_esg_mas_mgr", target_id: "end" },
    // 添加子节点的边
    { source_id: "rmt_dags", target_id: "rmt_dags.child1" },
    { source_id: "rmt_dags.child1", target_id: "rmt_dags.child2" },
    {
      source_id: "sens_stress_esg_mas_mgr",
      target_id: "sens_stress_esg_mas_mgr.child1",
    },
  ],
  nodes: {
    children: [
      {
        id: "start",
        value: {
          label: "start",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:#e8f7e4;",
        },
      },
      {
        id: "rmt_dags",
        value: {
          label: "rmt_dags",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:#FFCC00;",
        },
        children: [
          {
            id: "rmt_dags.child1",
            value: {
              label: "rmt_dags.child1",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#FFD700;",
            },
          },
          {
            id: "rmt_dags.child2",
            value: {
              label: "rmt_dags.child2",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#FFD700;",
            },
          },
        ],
      },
      {
        id: "sens_stress_esg_mas_mgr",
        value: {
          label: "sens_stress_esg_mas_mgr",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:#66CCFF;",
        },
        children: [
          {
            id: "sens_stress_esg_mas_mgr.child1",
            value: {
              label: "sens_stress_esg_mas_mgr.child1",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#87CEFA;",
            },
          },
        ],
      },
      {
        id: "end",
        value: {
          label: "end",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:#e8f7e4;",
        },
      },
    ],
  },
};
