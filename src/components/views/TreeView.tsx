import { useEffect, useState, useCallback } from 'react';
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
  ReactFlowProvider,
  useReactFlow,
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

const NODE_WIDTH = 250;
const NODE_HEIGHT = 130;

// ==========================================
// CUSTOM NODE COMPONENT (UI/UX PRO MAX DESIGN)
// ==========================================
const FamilyMemberNode = ({ data }: NodeProps) => {
  const nodeData = data.nodeData as PersonNode;
  const currentGen = data.gen as number;
  const person = data.person as MemberEntry;
  const isExpanded = data.isExpanded as boolean;
  const onToggleExpand = data.onToggleExpand as (currentlyExpanded?: boolean) => void;
  const onSelect = data.onSelect as (person: MemberEntry) => void;

  const hasChildren = nodeData.children && nodeData.children.length > 0;
  const childrenCount = nodeData.children ? nodeData.children.filter(c => !checkIsSpouseNode(c)).length : 0;
  
  const bDate = nodeData.birthSolar;
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  const isBirthday = !nodeData.deceased && bDate?.d && bDate?.m && bDate.m === currentMonth && bDate.d >= currentDay;
  
  const level = data.level as number;
  const isRoot = level === 0;
  const branch = !!nodeData.branchRoot;

  const nameRole = getNameRole(nodeData.name);
  const badge = nameRole || (nodeData.role && !getNameRole(nodeData.name) ? nodeData.role : '');
  const gender = nodeData.gender || 'unknown';

  return (
    <div style={{ width: NODE_WIDTH, height: NODE_HEIGHT, position: 'relative' }}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="tree-node-handle"
      />

      <article
        className={`tree-card ${isRoot ? 'root-node ancestor' : ''} ${branch ? 'branch' : ''} ${gender === 'male' ? 'male' : (gender === 'female' ? 'female' : '')} ${isBirthday ? 'birthday' : ''} gen-${Math.min(currentGen, 5)}`}
        onClick={() => onSelect(person)}
      >
        {/* Dải băng đen chéo góc phải dành cho người đã mất (không có chữ) */}
        {nodeData.deceased && (
          <div className="deceased-ribbon-wrapper">
            <div className="deceased-ribbon" title="Đã mất" />
          </div>
        )}

        {/* Thanh accent màu nổi trên đầu thẻ */}
        <div className="tree-card-accent-line" />

        <div className="tree-card-inner">
          {/* Header row: Badge Đời & Vai vế xếp sát nhau */}
          <div className="tree-card-header">
            <div className="tree-card-badges">
              <span className="gen-badge">Đời {currentGen}</span>
              {badge && <span className="title-pill">{badge}</span>}
              {isBirthday && (
                <span className="status-pill birthday" title="Sinh nhật tháng này">
                  <Icon name="cake" size={10} /> Sinh nhật
                </span>
              )}
            </div>
          </div>
          
          {/* Tên thành viên & Biểu tượng giới tính */}
          <div className="tree-card-name-row">
            {isRoot ? (
              <span className="gender-tag root" title="Cụ Thủy Tổ">
                <Icon name="crown" size={12} />
              </span>
            ) : gender === 'male' ? (
              <span className="gender-tag male" title="Nam">
                <Icon name="mars" size={11} />
              </span>
            ) : gender === 'female' ? (
              <span className="gender-tag female" title="Nữ">
                <Icon name="venus" size={11} />
              </span>
            ) : null}
            <h3 className="name font-display">{cleanName(nodeData.name)}</h3>
          </div>

          {/* Ngày sinh & Ngày mất */}
          <div className="tree-card-meta">
            {(nodeData.birthSolar || nodeData.birthNote) && (
              <div className="meta-row">
                <Icon name="sun" size={11} className="meta-icon birth" />
                <span className="meta-label">Sinh:</span>
                <span className="meta-val">{formatBirthDisplay(nodeData)}</span>
              </div>
            )}
            {nodeData.deceased && (nodeData.deathSolar || nodeData.deathNote) && (
              <div className="meta-row death">
                <span className="meta-label">Mất:</span>
                <span className="meta-val">{formatDeathDisplay(nodeData)}</span>
              </div>
            )}
          </div>
        </div>

        {/* NÚT TOGGLE FLOATING PILL TINH TẾ Ở ĐÁY THẺ */}
        {hasChildren && (
          <button
            className={`tree-toggle-pill nodrag nopan ${isExpanded ? 'expanded' : 'collapsed'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(isExpanded);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={isExpanded ? 'Thu gọn nhánh' : 'Mở rộng nhánh'}
            title={isExpanded ? 'Thu gọn nhánh' : `Mở rộng (${childrenCount > 0 ? `${childrenCount} con` : 'chi tiết'})`}
          >
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={13} />
            {!isExpanded && childrenCount > 0 && (
              <span className="toggle-count">+{childrenCount}</span>
            )}
          </button>
        )}
      </article>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="tree-node-handle"
      />
    </div>
  );
};

const nodeTypes = {
  familyNode: FamilyMemberNode,
};

// ==========================================
// HÀM DUYỆT CÂY VÀ BỐ TRÍ LAYOUT (DAGRE)
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
      pathOptions: { borderRadius: 16 },
      animated: false,
      style: { stroke: 'var(--tree-edge-color, #ca8a04)', strokeWidth: 2.5, opacity: 0.9 },
    } as unknown as Edge);
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

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) return { nodes, edges };
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 35, ranksep: 60 });

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

// ==========================================
// FLOATING CONTROL TOOLBAR & LEGEND
// ==========================================
interface FloatingToolbarProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const FloatingToolbar = ({ onExpandAll, onCollapseAll }: FloatingToolbarProps) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [showLegend, setShowLegend] = useState(false);

  return (
    <>
      {/* BAR ĐIỀU KHIỂN NỔI (TOP RIGHT) */}
      <div className="tree-floating-toolbar">
        <button 
          className="tree-toolbar-btn" 
          onClick={() => fitView({ duration: 400, padding: 0.2 })}
          title="Căn chỉnh toàn màn hình (Fit View)"
        >
          <Icon name="route" size={16} />
        </button>
        <button 
          className="tree-toolbar-btn" 
          onClick={() => zoomIn({ duration: 300 })}
          title="Phóng to (+)"
        >
          <Icon name="plus" size={16} />
        </button>
        <button 
          className="tree-toolbar-btn" 
          onClick={() => zoomOut({ duration: 300 })}
          title="Thu nhỏ (-)"
        >
          <Icon name="minus" size={16} />
        </button>

        <div className="tree-toolbar-divider" />

        <button 
          className="tree-toolbar-btn text-btn" 
          onClick={onExpandAll}
          title="Mở rộng toàn bộ nhánh phả hệ"
        >
          <Icon name="folder-plus" size={15} />
          <span>Mở tất cả</span>
        </button>
        <button 
          className="tree-toolbar-btn text-btn" 
          onClick={onCollapseAll}
          title="Thu gọn phả hệ"
        >
          <Icon name="folder-minus" size={15} />
          <span>Thu gọn</span>
        </button>

        <div className="tree-toolbar-divider" />

        <button 
          className={`tree-toolbar-btn ${showLegend ? 'active' : ''}`} 
          onClick={() => setShowLegend(!showLegend)}
          title="Xem chú thích sơ đồ"
        >
          <Icon name="info" size={16} />
        </button>
      </div>

      {/* CHÚ THÍCH LEGEND (BOTTOM LEFT / POPUP) */}
      {showLegend && (
        <div className="tree-legend-card">
          <div className="tree-legend-header">
            <span className="tree-legend-title">Chú thích Sơ đồ</span>
            <button className="tree-legend-close" onClick={() => setShowLegend(false)}>
              <Icon name="x" size={14} />
            </button>
          </div>
          <div className="tree-legend-grid">
            <div className="legend-item">
              <span className="legend-badge root">
                <Icon name="award" size={11} />
              </span>
              <span>Thủy Tổ gia tộc</span>
            </div>
            <div className="legend-item">
              <span className="legend-badge male">
                <Icon name="user" size={11} />
              </span>
              <span>Nam (Thành viên)</span>
            </div>
            <div className="legend-item">
              <span className="legend-badge female">
                <Icon name="user" size={11} />
              </span>
              <span>Nữ (Dâu / Nữ)</span>
            </div>
            <div className="legend-item">
              <span className="legend-badge deceased">🕯</span>
              <span>Đã mất</span>
            </div>
            <div className="legend-item">
              <span className="legend-badge birthday">🎂</span>
              <span>Sinh nhật tháng này</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================
// INNER TREE COMPONENT
// ==========================================
const TreeViewInner = ({ treeData, onSelectPerson }: TreeViewProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const handleToggleExpand = useCallback((id: string, currentlyExpanded?: boolean) => {
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
  }, []);

  // Hàm mở rộng toàn bộ
  const handleExpandAll = useCallback(() => {
    if (!treeData) return;
    const allExpanded: Record<string, boolean> = {};
    const collectAllKeys = (node: PersonNode, path: string[]) => {
      const currentPath = [...path, cleanName(node.name)];
      const id = currentPath.join(' > ');
      allExpanded[id] = true;
      if (node.children) {
        node.children.forEach(child => collectAllKeys(child, currentPath));
      }
    };
    collectAllKeys(treeData, []);
    setExpandedNodes(allExpanded);
  }, [treeData]);

  // Hàm thu gọn toàn bộ (chỉ giữ Root)
  const handleCollapseAll = useCallback(() => {
    setExpandedNodes({});
  }, []);

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
  }, [treeData, expandedNodes, handleToggleExpand, onSelectPerson]);

  return (
    <div className="tree-container-wrapper">
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
          color="var(--tree-dot-color, rgba(212,175,55,0.25))"
          gap={28}
          size={1.5}
          variant={BackgroundVariant.Dots}
          style={{ opacity: 0.5 }}
        />
        <FloatingToolbar onExpandAll={handleExpandAll} onCollapseAll={handleCollapseAll} />
      </ReactFlow>
    </div>
  );
};

export const TreeView = (props: TreeViewProps) => {
  return (
    <ReactFlowProvider>
      <TreeViewInner {...props} />
    </ReactFlowProvider>
  );
};