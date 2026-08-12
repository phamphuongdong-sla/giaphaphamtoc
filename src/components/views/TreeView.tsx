import { useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';

import { PersonNode, MemberEntry } from '@/types';
import { cleanName, getNameRole, checkIsSpouseNode } from '@/utils/genealogyUtils';
import { formatBirthDisplay, formatDeathDisplay } from '@/utils/dateUtils';
import { Icon } from '@/components/ui/Icon';

interface TreeViewProps {
  treeData: PersonNode;
  onSelectPerson: (person: MemberEntry) => void;
}

const NODE_WIDTH = 300;
const NODE_HEIGHT = 240;

// ==========================================
// CUSTOM NODE COMPONENT (TỐI ƯU KHU VỰC BẤM ĐÓNG/MỞ)
// ==========================================
const FamilyMemberNode = ({ data }: NodeProps) => {
  const nodeData = data.nodeData as PersonNode;
  const currentGen = data.gen as number;
  const person = data.person as MemberEntry;
  const isExpanded = data.isExpanded as boolean;
  const onToggleExpand = data.onToggleExpand as (currentlyExpanded?: boolean) => void;
  const onSelect = data.onSelect as (person: MemberEntry) => void;

  const hasChildren = nodeData.children && nodeData.children.length > 0;
  const bDate = nodeData.birthSolar;
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  const isBirthday = !nodeData.deceased && bDate?.d && bDate?.m && bDate.m === currentMonth && bDate.d >= currentDay;
  
  const level = data.level as number;
  const dark = level === 0;
  const branch = !!nodeData.branchRoot;

  const nameRole = getNameRole(nodeData.name);
  const badge = nameRole || (nodeData.role && !getNameRole(nodeData.name) ? nodeData.role : '');

  return (
    <div style={{ width: NODE_WIDTH, height: NODE_HEIGHT, position: 'relative' }}>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: '#b8893c', width: '10px', height: '10px', zIndex: 10 }} 
      />

      <article
        className={`tree-card ${dark ? 'dark' : ''} ${branch ? 'branch' : ''} ${nodeData.gender === 'male' ? 'male' : (nodeData.gender === 'female' ? 'female' : '')} ${isBirthday ? 'birthday' : ''} gen-${Math.min(currentGen, 5)}`}
        onClick={() => onSelect(person)}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          margin: '0',
          paddingBottom: '0px',
          overflow: 'hidden'
        }}
      >
        {nodeData.deceased && <div className="deceased-mark" />}
        {isBirthday && (
          <div className="birthday-ribbon">
            <Icon name="cake" size={10} /> Sinh nhật
          </div>
        )}
        
        {/* Vùng nội dung thông tin */}
        <div style={{ padding: '16px 16px 8px 16px', flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <span className="gen-badge">Đời {currentGen}</span>
          {badge && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <span className="title-pill">{badge}</span>
            </div>
          )}
          <h3 className="name font-display">{cleanName(nodeData.name)}</h3>
          <div className="meta">
            {(nodeData.birthSolar || nodeData.birthNote) && (
              <span className="meta-item">
                <Icon name="sun" size={12} />
                Sinh: <b>{formatBirthDisplay(nodeData)}</b>
              </span>
            )}
            {nodeData.deceased && (nodeData.deathSolar || nodeData.deathNote) && (
              <span className="meta-item death">
                <Icon name="moon" size={12} />
                Mất: <b>{formatDeathDisplay(nodeData)}</b>
              </span>
            )}
          </div>
          {nodeData.bio && <div className="info">{nodeData.bio}</div>}
        </div>

        {/* NÚT BẤM ĐÓNG / MỞ NHÁNH TO, NHẠY */}
        {hasChildren && (
          <button
            className="toggle-btn-tree nodrag nopan"
            style={{
              display: 'flex',
              width: '100%',
              height: '46px',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(184,137,60,0.18)',
              border: 'none',
              borderTop: '1px solid rgba(184,137,60,0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '18px',
              flexShrink: 0,
              zIndex: 30,
              touchAction: 'manipulation',
              color: 'var(--gold-light, #f0c978)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(isExpanded);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} />
          </button>
        )}
      </article>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: '#b8893c', width: '10px', height: '10px', zIndex: 10 }} 
      />
    </div>
  );
};

const nodeTypes = {
  familyNode: FamilyMemberNode,
};

// ==========================================
// HÀM DUYỆT CÂY, ĐẢO THỨ TỰ VÀ QUẢN LÝ ĐÓNG/MỞ MẶC ĐỊNH
// ==========================================
const flattenTreeWithVisibility = (
  node: PersonNode,
  expandedNodes: Record<string, boolean>,
  onToggleExpand: (id: string, currentlyExpanded?: boolean) => void,
  onSelectPerson: (person: MemberEntry) => void,
  parentNode: PersonNode | null = null,
  level = 0,
  gen = 1,
  branchName = '',
  pathNodes: PersonNode[] = [],
  nodes: Node[] = [],
  edges: Edge[] = []
) => {
  if (!node) return { nodes, edges };

  const currentGen = parentNode === null ? 1 : gen + (checkIsSpouseNode(node) ? 0 : 1);
  const currentBranch = node.branchLine || branchName;
  const currentPath = [...pathNodes, node];
  const uniqueId = currentPath.map(n => cleanName(n.name)).join(' > ');

  // YÊU CẦU: Chỉ mở gốc để hiển thị ba bà; các node khác mặc định đóng.
  let isExpanded = expandedNodes[uniqueId];
  if (isExpanded === undefined) {
    isExpanded = parentNode === null;
  }

  const person: MemberEntry = {
    id: uniqueId,
    data: node,
    parentNode,
    gen: currentGen,
    branchName: currentBranch,
    pathNodes: currentPath,
    pathNames: currentPath.map(n => cleanName(n.name)),
    fullName: '',
    searchText: ''
  };

  nodes.push({
    id: uniqueId,
    type: 'familyNode',
    data: {
      nodeData: node,
      level,
      gen: currentGen,
      person,
      isExpanded,
      onToggleExpand: (currentlyExpanded?: boolean) => onToggleExpand(uniqueId, currentlyExpanded),
      onSelect: onSelectPerson
    },
    position: { x: 0, y: 0 },
    style: { width: NODE_WIDTH, height: NODE_HEIGHT }
  });

  if (parentNode) {
    const parentId = pathNodes.map(n => cleanName(n.name)).join(' > ');
    edges.push({
      id: `e-${parentId}-${uniqueId}`,
      source: parentId,
      target: uniqueId,
      type: 'smoothstep',
      style: { stroke: '#b8893c', strokeWidth: 2 },
    });
  }

  if (isExpanded && node.children && Array.isArray(node.children)) {
    const spouseNodes = node.children.filter(child => checkIsSpouseNode(child));
    const childrenNodes = node.children.filter(child => !checkIsSpouseNode(child));

    const reversedSpouses = [...spouseNodes].reverse();
    const reversedChildren = [...childrenNodes].reverse();

    const sortedChildren = [...reversedSpouses, ...reversedChildren];

    sortedChildren.forEach((child) => {
      flattenTreeWithVisibility(
        child,
        expandedNodes,
        onToggleExpand,
        onSelectPerson,
        node,
        level + 1,
        currentGen,
        currentBranch,
        currentPath,
        nodes,
        edges
      );
    });
  }

  return { nodes, edges };
};

// Cấu hình Layout tự động
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) return { nodes, edges };
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const TreeView = ({ treeData, onSelectPerson }: TreeViewProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const handleToggleExpand = (id: string, currentlyExpanded?: boolean) => {
    setExpandedNodes((prev) => {
      if (currentlyExpanded !== undefined) {
        return {
          ...prev,
          [id]: !currentlyExpanded,
        };
      }
      const current = prev[id];
      if (current !== undefined) {
        return {
          ...prev,
          [id]: !current,
        };
      }
      const isRoot = !id.includes(' > ');
      return {
        ...prev,
        [id]: !isRoot,
      };
    });
  };

  useEffect(() => {
    if (!treeData) return;
    
    const { nodes: rawNodes, edges: rawEdges } = flattenTreeWithVisibility(
      treeData,
      expandedNodes,
      handleToggleExpand,
      onSelectPerson
    );
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [treeData, expandedNodes, onSelectPerson]);

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 80px)',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%), var(--bg-base)',
        position: 'relative',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesConnectable={false}
        nodesDraggable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.02}
        maxZoom={1.5}
      >
        <Background
          color="var(--border-gold-md)"
          gap={24}
          size={1.5}
          variant={BackgroundVariant.Dots}
          style={{ opacity: 0.4 }}
        />
      </ReactFlow>
    </div>
  );
};