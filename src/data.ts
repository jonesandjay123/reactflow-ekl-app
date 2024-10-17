// src/data.ts

export const jsonData = {
  arrange: "LR",
  edges: [
    { source_id: "rmt_dags.downstream_join_id", target_id: "end" },
    {
      source_id: "rmt_dags.task_check_rmt_dvf_status",
      target_id: "rmt_dags.task_trigger_aggr_load_dag",
    },
    {
      source_id: "rmt_dags.task_getrmt_DVFParam",
      target_id: "rmt_dags.task_getrmt_DVFParam",
    },
    {
      source_id: "rmt_dags.task_rmt_file_watcher",
      target_id: "rmt_dags.task_trigger_rmt_dvf_job",
    },
    {
      source_id: "rmt_dags.task_trigger_aggr_load_dag",
      target_id: "rmt_dags.downstream_join_id",
    },
    {
      source_id: "rmt_dags.task_trigger_rmt_dvf_job",
      target_id: "rmt_dags.task_rmt_file_watcher",
    },
    {
      source_id: "sens_stress_esg_mas_mgr.downstream_join_id",
      target_id: "end",
    },
    {
      source_id: "sens_stress_esg_mas_mgr.task_branching_esg_run",
      target_id:
        "sens_stress_esg_mas_mgr.task_fact_acct_bmk_sec_stress_rmt_aggr1_watcher",
    },
    {
      source_id: "sens_stress_esg_mas_mgr.task_check_esg_predvf_status",
      target_id: "sens_stress_esg_mas_mgr.task_trigger_esg_predvf_job",
    },
    {
      source_id: "sens_stress_esg_mas_mgr.task_esg_preDVFParam",
      target_id: "sens_stress_esg_mas_mgr.task_getesg_markerparm",
    },
    {
      source_id:
        "sens_stress_esg_mas_mgr.task_fact_act_bmk_sec_stress_rmt_aggr_watcher",
      target_id: "sens_stress_esg_mas_mgr.task_check_esg_predvf_status",
    },
    {
      source_id: "sens_stress_esg_mas_mgr.task_getesg_markerparm",
      target_id: "sens_stress_esg_mas_mgr.task_trigger_esg_predvf_job",
    },
    {
      source_id: "sens_stress_esg_mas_mgr.task_load_success",
      target_id: "sens_stress_esg_mas_mgr.downstream_join_id",
    },
    {
      source_id: "sens_stress_esg_mas_mgr.task_esg_summary_rmt_watcher",
      target_id:
        "sens_stress_esg_mas_mgr.task_trigger_esg_mas_mgr.weekend_dataload",
    },
    {
      source_id:
        "sens_stress_esg_mas_mgr.task_trigger_esg_mas_mgr.weekend_dataload",
      target_id: "sens_stress_esg_mas_mgr.task_esg_load_success",
    },
    {
      source_id: "sens_stress_esg_mas_mgr.upstream_join_id",
      target_id: "sens_stress_esg_mas_mgr.task_check_esg_predvf_status",
    },
  ],
  nodes: {
    children: [
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
      {
        children: [
          {
            id: "rmt_dags.task_check_rmt_dvf_status",
            value: {
              label: "task_check_rmt_dvf_status",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "rmt_dags.task_getrmt_DVFParam",
            value: {
              label: "task_getrmt_DVFParam",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "rmt_dags.task_getrmtmarkerparm",
            value: {
              label: "task_getrmtmarkerparm",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "rmt_dags.task_rmt_file_watcher",
            value: {
              label: "task_rmt_file_watcher",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#91818a;",
            },
          },
          {
            id: "rmt_dags.task_trigger_aggr_load_dag",
            value: {
              label: "task_trigger_aggr_load_dag",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "rmt_dags.task_trigger_rmt_dvf_job",
            value: {
              label: "task_trigger_rmt_dvf_job",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#f4a460;",
            },
          },
          {
            id: "rmt_dags.upstream_join_id",
            value: {
              label: "",
              labelStyle: "fill:#000;",
              shape: "circle",
              style: "fill:CornflowerBlue;",
            },
          },
          {
            id: "rmt_dags.downstream_join_id",
            value: {
              label: "",
              labelStyle: "fill:#000;",
              shape: "circle",
              style: "fill:CornflowerBlue;",
            },
          },
        ],
        id: "rmt_dags",
        value: {
          clusterLabelPos: "top",
          isMapped: false,
          label: "rmt_dags",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:CornflowerBlue",
          tooltip: "",
        },
      },
      {
        children: [
          {
            id: "sens_stress_esg_mas_mgr.task_branching_esg_run",
            value: {
              label: "task_branching_esg_run",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_esg_load_success",
            value: {
              label: "task_esg_load_success",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#e8f7e4;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_esg_preDVFParam",
            value: {
              label: "task_esg_preDVFParam",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_check_esg_predvf_status",
            value: {
              label: "task_check_esg_predvf_status",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_esg_summary_rmt_watcher",
            value: {
              label: "task_esg_summary_rmt_watcher",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#91818a;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_fact_acct_bmk_sec_stress_rmt_aggr1_watcher",
            value: {
              label: "task_fact_acct_bmk_sec_stress_rmt_aggr1_watcher",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#91818a;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_getesg_markerparm",
            value: {
              label: "task_getesg_markerparm",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_mas_global_data_watcher",
            value: {
              label: "task_mas_global_data_watcher",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#91818a;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_trigger_esg_mas_mgr_weekend_dataload",
            value: {
              label: "task_trigger_esg_mas_mgr_weekend_dataload",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_trigger_esg_mas_mgr_weekly_dataload",
            value: {
              label: "task_trigger_esg_mas_mgr_weekly_dataload",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#ffefeb;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.task_trigger_esg_predvf_job",
            value: {
              label: "task_trigger_esg_predvf_job",
              labelStyle: "fill:#000;",
              rx: 5,
              ry: 5,
              style: "fill:#f4a460;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.upstream_join_id",
            value: {
              label: "",
              labelStyle: "fill:#000;",
              shape: "circle",
              style: "fill:CornflowerBlue;",
            },
          },
          {
            id: "sens_stress_esg_mas_mgr.downstream_join_id",
            value: {
              label: "",
              labelStyle: "fill:#000;",
              shape: "circle",
              style: "fill:CornflowerBlue;",
            },
          },
        ],
        id: "sens_stress_esg_mas_mgr",
        value: {
          clusterLabelPos: "top",
          isMapped: false,
          label: "sens_stress_esg_mas_mgr",
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:CornflowerBlue",
          tooltip: "",
        },
      },
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
        id: null,
        value: {
          clusterLabelPos: "top",
          isMapped: false,
          label: null,
          labelStyle: "fill:#000;",
          rx: 5,
          ry: 5,
          style: "fill:CornflowerBlue",
          tooltip: "",
        },
      },
    ],
  },
};
