import {
  NodeStatus,
  FlowNodeType,
  Edge,
  HandleProps,
  XYPosition,
  FlowNode,
} from "./types";

export interface IUser {
  label: string;
  value: string;
  deptBusinessNo: number;
  deptName: string;
  email: string;
}

export interface RawNode {
  node_key: string;
  node_code: string;
  node_name: string;
  node_status: NodeStatus;
  node_type: string;
  flowInfo: {
    flow_type: FlowNodeType;
    flow_handleBars: Array<HandleProps>;
    position?: XYPosition;
    edges?: Array<Edge>;
    style?: CSSStyleDeclaration;
  };
  node_condition?: Array<{
    node_key: string;
    expression?: string;
  }>;
  approver?: IUser[];
  node_param?: Record<string, any>;
  children: RawNode[];
}

export type ParseEdge = Edge & {
  status: NodeStatus;
  isConditionEdge?: boolean;
};

export type ParseNode = FlowNode;

export interface FlowDataParserOptions {
  /**
   * 每个node节点默认的宽度和高度
   */
  measured?: {
    width?: number;
    height?: number;
  };

  logger?: boolean;
  direction?: "TB" | "TR";
}

/**
 * 流程图解析类
 */
export class FlowDataParser {
  private rowNodes: Array<RawNode & { parent?: RawNode }> = [];
  private nodeMap: Map<string, ParseNode> = new Map();
  private edgeMap: Map<string, ParseEdge> = new Map();
  private options: FlowDataParserOptions = {
    logger: false,
    direction: "TB",
    measured: {
      width: 200,
      height: 90,
    },
  };

  constructor(flowInfo: RawNode[], options?: Partial<FlowDataParserOptions>) {
    this.options = Object.assign({}, this.options, options ?? {});

    this.collectRawNodes(flowInfo);
    this.parseNodes();
    this.parseEdges();
  }

  /**
   * 递归拍平流程节点树
   */
  private collectRawNodes(children: RawNode[], parent: RawNode = null) {
    children.forEach((node) => {
      this.rowNodes.push({ ...node, parent: parent });

      if (Array.isArray(node.children) && node.children.length) {
        this.collectRawNodes(node.children, node);
      }
    });
  }

  /** 获取节点状态 */
  private getNodeStatus(
    node_code: string,
    node_status: NodeStatus,
    parentStatus: string
  ) {
    // 如果是开始节点，直接返回 “已处理” 状态
    if (node_code == "start") return "2";

    // 如果是条件节点，后端的条件节点本身是无状态的，前端为了展示流程图状态，如果父节点状态是“已处理”，则条件节点继承
    if (node_code == "condition")
      return parentStatus == "2" ? "2" : node_status;

    return node_status;
  }

  /**
   * node 节点 css class类名
   */
  private getNodeCls(node_code: string, node_status: NodeStatus) {
    let className = "";
    if (node_code == "start") {
      className = "success";
    } else {
      switch (node_status) {
        case "0":
          className = "";
          break;
        case "1":
          className = "active";
          break;
        case "2":
          className = "success";
          break;
        case "3":
        case "4":
        case "5":
        case "6":
          className = "danger";
          break;
      }
    }
    return className;
  }

  private getNodeContent(item: RawNode) {
    const { node_code, approver = [] } = item;

    if (["applicant", "custom", "leader"].includes(node_code)) {
      return approver.map((m) => m.label).join(",");
    }
    return "";
  }

  /**
   * 遍历所有节点，建立节点 Map 图谱，方便后续连线查找节点信息
   */
  private parseNodes() {
    this.rowNodes.forEach((rawNode) => {
      const { node_key, node_code, node_status, node_name, flowInfo } = rawNode;
      const parentStatus = rawNode.parent
        ? rawNode.parent.node_status
        : undefined;

      const nodeStatus = this.getNodeStatus(
        node_code,
        node_status,
        parentStatus
      );
      const nodeCls = this.getNodeCls(node_code, node_status);
      const nodeContent = this.getNodeContent(rawNode);

      this.nodeMap.set(rawNode.node_key, {
        id: node_key,
        type: flowInfo.flow_type,
        position: flowInfo.position || { x: 0, y: 0 },
        data: {
          className: nodeCls,
          content: nodeContent,
          label: node_name,
          status: nodeStatus,
          parentNodeId: rawNode.parent?.node_key ?? null,
          isConditionNode: flowInfo.flow_type == "condition-node",
          handleBars: flowInfo.flow_handleBars,
        },
      });
    });
  }

  /** 处理连线状态，高亮 */
  private parseEdges() {
    const conditionGroup: Map<string, ParseEdge[]> = new Map();

    this.rowNodes.forEach((rawNode) => {
      rawNode.flowInfo.edges?.forEach((rawEdge) => {
        const { id, source, target } = rawEdge;
        if (this.edgeMap.has(id)) {
          return;
        }

        const sourceNode = this.nodeMap.get(source);
        const targetNode = this.nodeMap.get(target);

        const isConditionEdge = sourceNode
          ? sourceNode.data.isConditionNode
          : false;
        let edgeStatus: NodeStatus = "0";
        let edgeExtralInfo = {};

        // 审批中、审批通过条件判断
        if (["1", "2"].includes(sourceNode.data.status)) {
          // 如果为条件分支连线，则判断连线 targetNode 状态
          if (isConditionEdge) {
            // 边界1：如果条件节点的连线，指向条件节点的父节点，则连线默认为灰色
            if (sourceNode.data?.parentNodeId == targetNode.id) {
              edgeStatus = "0";
            } else {
              edgeStatus = ["1", "2"].includes(targetNode.data?.status)
                ? "2"
                : "0";
            }
          } else {
            // 不是条件节点，则继承 sourceNode 状态
            edgeStatus = sourceNode.data?.status;
          }

          const lineStyleMap = {
            "2": "var(--wk-success-color)",
            "1": "var(--wk-primary-color)",
          };
          edgeExtralInfo = {
            style: {
              stroke: lineStyleMap[edgeStatus] ?? "",
            },
            markerEnd: {
              type: "arrowclosed",
              color: lineStyleMap[edgeStatus] ?? "",
            },
          };
        } else {
          edgeStatus = sourceNode?.data.status || "0";
        }

        const edge: ParseEdge = {
          ...rawEdge,
          status: edgeStatus,
          isConditionEdge,
          animated: edgeStatus === "1",
          ...edgeExtralInfo,
        };

        if (isConditionEdge) {
          conditionGroup.set(sourceNode.id, [
            ...(conditionGroup.get(sourceNode.id) ?? []),
            edge,
          ]);
        }

        if (this.edgeMap.has(rawEdge.id)) {
          console.warn(`id: ${rawEdge.id} 已存在，请重新调整流程模板`);
        } else {
          this.edgeMap.set(rawEdge.id, edge);
        }
      });
    });

    // 仅通过首尾 Node 节点状态判断连线状态并不准确，特别是条件分支的连线，在分叉后聚合的场景，会出现判断不准确的情况，这里单独处理，

    // 1. 先过滤出正常的条件节点和连线，剩下的是有问题的
    Array.from(conditionGroup.entries()).forEach(([key, value]) => {
      if (!this.checkConditionEdgeLineStatus(value)) {
        conditionGroup.delete(key);
      }
    });

    // 2. 处理判断有误的条件节点、连线
    // todo: 因为一个条件节点下，只有一个一处理的连线，不存在多个连线都被处理了的情况，现在这里conditionGroup中的连线status都为2 "已处理"，所以这里要判断同一个条件节点下的连线，通过连线的起始节点、末尾节点、以及中间节点的状态，来判断连线的状态，修复连线的状态。
    // 修复思路：
    // 1. 先找出所有的条件节点，conditionGroup.keys()
    // 3. 找出所有的条件节点下的连线 conditionGroup.values()
    // 4. 找出所有的条件节点下的连线的起始节点
    // 5. 找出所有的条件节点下的连线的末尾节点
    // 6. 找出所有的条件节点下的连线的中间节点
    // 7. 找出所有的条件节点下的连线的中间节点的状态
    // 8. 找出所有的条件节点下的连线的中间节点的状态是否为2 "已处理"
    // 9. 如果所有中间节点的状态都是已处理，那么这个连线的状态为2 "已处理"
    // 10. 如果这条连线，没有中间节点，或中间节点存在一个
    console.log(conditionGroup);
  }

  /** 当一个条件节点下的连线超过2个状态是 “已通过、已处理”状态时，需要单独处理 */
  private checkConditionEdgeLineStatus(lines: ParseEdge[]) {
    return lines.filter((line) => line.status === "2").length > 1;
  }

  getNodes() {
    return Array.from(this.nodeMap.values());
  }

  getEdges() {
    return Array.from(this.edgeMap.values());
  }

  getLayoutedFlow() {
    return new Promise((resolve) => {
      import("@dagrejs/dagre").then(({ default: Dagre }) => {
        const { measured, direction, logger } = this.options;

        const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
        g.setGraph({ rankdir: direction });

        const edges = this.getEdges();
        const nodes = this.getNodes();

        edges.forEach((edge) => g.setEdge(edge.source, edge.target));
        nodes.forEach((node) => {
          g.setNode(node.id, {
            ...node,
            width: measured?.width ?? 200,
            height: measured.height ?? 90,
          });
        });

        Dagre.layout(g);

        const data = {
          nodes: nodes.map((node) => {
            const position = g.node(node.id);
            const x = position.x - node?.measured?.width / 2;
            const y = position.y - node?.measured?.height / 2;
            return { ...node, position: { x, y } };
          }),
          edges,
        };

        if (logger) {
          console.log(data);
        }
        resolve(data);
      });
    });
  }
}
