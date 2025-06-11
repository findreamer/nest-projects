import { Node, Edge } from 'reactflow';

type NodeStatus = '0' | '1' | '2' | '3' | '4' | '5' | '6';

interface RawNode {
  node_key: string;
  node_code: string;
  node_name: string;
  node_status: NodeStatus;
  node_type: string; // 新增：节点类型（0-条件节点，2-普通节点等）
  flowInfo: {
    position: { x: number; y: number };
    edges?: Array<{
      id: string;
      source: string;
      target: string;
      type?: string;
      label?: string;
      isMain?: string;
      isConditionLine?: boolean; // 新增：是否为条件分支边
    }>;
  };
  node_condition?: Array<{ // 新增：条件节点的分支条件
    node_key: string;
    expression?: string;
  }>;
  children?: RawNode[];
}

interface ParsedEdge extends Edge<{ 
  status: NodeStatus | 'pending' | 'selected' | 'unselected'; // 扩展边状态类型
  isConditionLine: boolean;
  label: string;
  [key: string]: any 
}> {}

interface ParsedNode extends Node<{ 
  status: NodeStatus; 
  name: string; 
  isCondition: boolean; // 标记是否为条件节点
  [key: string]: any 
}> {}

export class FlowDataParser {
  private rawNodes: RawNode[] = [];
  private nodeMap: Map<string, ParsedNode> = new Map();
  private edgeMap: Map<string, ParsedEdge> = new Map();

  constructor(flowData: { children: RawNode[] }) {
    this.collectRawNodes(flowData.children);
    this.parseNodes();
    this.parseEdges();
  }

  private collectRawNodes(children: RawNode[], parent?: RawNode) {
    children.forEach(node => {
      this.rawNodes.push(node);
      if (node.children) {
        this.collectRawNodes(node.children, node);
      }
    });
  }

  private parseNodes() {
    this.rawNodes.forEach(rawNode => {
      this.nodeMap.set(rawNode.node_key, {
        id: rawNode.node_key,
        type: rawNode.node_code,
        position: rawNode.flowInfo.position,
        data: {
          name: rawNode.node_name,
          status: rawNode.node_status,
          isCondition: rawNode.node_type === '0', // 标记是否为条件节点
          ...(rawNode.node_condition && { conditions: rawNode.node_condition }),
          ...(rawNode.node_event && { events: rawNode.node_event }),
          ...(rawNode.node_tag && { tag: rawNode.node_tag })
        }
      });
    });
  }

  private parseEdges() {
    this.rawNodes.forEach(rawNode => {
      rawNode.flowInfo.edges?.forEach(rawEdge => {
        if (this.edgeMap.has(rawEdge.id)) return;

        const sourceNode = this.nodeMap.get(rawEdge.source);
        const isConditionEdge = !!rawEdge.isConditionLine;
        let edgeStatus: ParsedEdge['data']['status'] = '0';

        // 条件节点分支边状态处理
        if (sourceNode?.data.isCondition) {
          switch (sourceNode.data.status) {
            case '0': // 条件节点待审批
              edgeStatus = 'pending'; 
              break;
            case '1': // 条件节点审批中
              edgeStatus = 'pending'; 
              break;
            case '2': // 条件节点已通过（需根据实际流程选择分支）
              // 这里模拟：假设主分支为选中状态（实际需结合流程执行数据）
              edgeStatus = rawEdge.isMain === '1' ? 'selected' : 'unselected'; 
              break;
            default: // 其他状态（驳回/撤回等）
              edgeStatus = sourceNode.data.status;
          }
        } else {
          // 普通节点边直接继承状态
          edgeStatus = sourceNode?.data.status || '0';
        }

        this.edgeMap.set(rawEdge.id, {
          id: rawEdge.id,
          source: rawEdge.source,
          target: rawEdge.target,
          type: rawEdge.type || 'step-edge',
          data: {
            status: edgeStatus,
            isConditionLine: isConditionEdge,
            label: rawEdge.label || '',
            isMain: rawEdge.isMain,
            ...(rawEdge.isConditionLine && { expression: sourceNode?.data.conditions?.find(c => c.node_key === rawEdge.target)?.expression })
          }
        });
      });
    });
  }

  getNodes(): ParsedNode[] {
    return Array.from(this.nodeMap.values());
  }

  getEdges(): ParsedEdge[] {
    return Array.from(this.edgeMap.values());
  }

  // 新增：获取条件节点的有效分支边（模拟流程执行时的状态）
  getActiveConditionEdges(conditionNodeId: string): ParsedEdge[] {
    const conditionNode = this.nodeMap.get(conditionNodeId);
    if (!conditionNode?.data.isCondition) return [];
    
    return this.getEdges()
      .filter(edge => edge.source === conditionNodeId && edge.data.status === 'selected');
  }
}