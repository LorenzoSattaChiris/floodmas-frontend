// ─── FloodMAS — Agent Architecture Graph (ReactFlow) ─────────────────

import { useCallback, useState, memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AGENTS, TOOLS, ML_MODELS, type Agent, type Tool, type MLModel } from '../config/intel';

// ── Node Data Types ───────────────────────────────────────────────────

type AgentNodeData = { agent: Agent; toolCount: number };
type ToolNodeData  = { tool: Tool };
type ModelNodeData = { model: MLModel };

// ── Design Token ──────────────────────────────────────────────────────

const CARD_BG   = 'rgba(11,17,34,0.96)';
const HANDLE_SZ = 7;

// ── Agent Node ────────────────────────────────────────────────────────

const AgentNode = memo(({ data }: NodeProps<Node<AgentNodeData>>) => {
  const { agent, toolCount } = data;
  const isSupervisor = agent.role === 'supervisor';
  return (
    <div
      style={{
        background: isSupervisor
          ? `linear-gradient(150deg, rgba(14,165,233,0.14) 0%, ${CARD_BG} 60%)`
          : CARD_BG,
        border: `1px solid ${agent.color}30`,
        borderTop: `3px solid ${agent.color}`,
        borderRadius: 11,
        padding: '11px 16px',
        minWidth: 160,
        textAlign: 'center',
        boxShadow: `0 6px 30px ${agent.color}1a, 0 1px 4px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.035)`,
      }}
    >
      {!isSupervisor && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: agent.color, width: HANDLE_SZ, height: HANDLE_SZ, border: `2px solid ${CARD_BG}`, top: -5 }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 7 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: agent.color,
          boxShadow: `0 0 9px ${agent.color}cc`, flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.01em' }}>
          {agent.name}
        </span>
      </div>
      <div style={{
        display: 'inline-block', fontSize: 8, fontWeight: 600,
        color: agent.color, background: `${agent.color}1c`,
        border: `1px solid ${agent.color}33`,
        borderRadius: 20, padding: '2px 10px', marginBottom: 6,
        letterSpacing: '0.03em',
      }}>
        {agent.model}
      </div>
      <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.27)', marginTop: 1 }}>
        {isSupervisor ? 'Master Orchestrator' : `${toolCount} tools`}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: agent.color, width: HANDLE_SZ, height: HANDLE_SZ, border: `2px solid ${CARD_BG}`, bottom: -5 }}
      />
    </div>
  );
});
AgentNode.displayName = 'AgentNode';

// ── Tool Node ─────────────────────────────────────────────────────────

const ToolNode = memo(({ data }: NodeProps<Node<ToolNodeData>>) => {
  const { tool } = data;
  const agent = AGENTS.find((a) => a.toolIds.includes(tool.id));
  const color = agent?.color ?? '#64748b';
  return (
    <div
      style={{
        background: 'rgba(11,17,34,0.9)',
        border: `1px solid ${color}1e`,
        borderLeft: `3px solid ${color}70`,
        borderRadius: 8,
        padding: '6px 9px',
        minWidth: 128,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: `${color}80`, width: 5, height: 5, border: 'none', top: -3 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.72)', fontWeight: 500, lineHeight: 1.35, flex: 1 }}>
          {tool.name}
        </span>
        {tool.mlModel && (
          <span style={{
            fontSize: 6, fontWeight: 700, padding: '1px 4px', borderRadius: 3,
            background: 'rgba(168,85,247,0.22)', color: '#d8b4fe', flexShrink: 0,
          }}>ML</span>
        )}
      </div>
      <div style={{ fontSize: 7, color, opacity: 0.5, marginTop: 2.5, textTransform: 'capitalize' }}>
        {tool.category.replace('-', '\u00a0')}
      </div>
    </div>
  );
});
ToolNode.displayName = 'ToolNode';

// ── ML Model Node ─────────────────────────────────────────────────────

const ModelNode = memo(({ data }: NodeProps<Node<ModelNodeData>>) => {
  const { model } = data;
  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(88,28,135,0.24) 0%, rgba(11,17,34,0.96) 65%)',
        border: '1px solid rgba(168,85,247,0.32)',
        borderTop: '3px solid #a855f7',
        borderRadius: 11,
        padding: '9px 14px',
        minWidth: 155,
        textAlign: 'center',
        boxShadow: '0 6px 28px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#a855f780', width: 5, height: 5, border: 'none', top: -3 }}
      />
      <div style={{
        display: 'inline-block', fontSize: 7, fontWeight: 700,
        padding: '2px 8px', borderRadius: 20,
        background: 'rgba(168,85,247,0.2)', color: '#d8b4fe',
        marginBottom: 5, letterSpacing: '0.05em',
      }}>{model.badge}</div>
      <div style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.84)', marginBottom: 3 }}>{model.name}</div>
      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.22)', lineHeight: 1.65 }}>
        {model.outputs.join(' · ')}
      </div>
    </div>
  );
});
ModelNode.displayName = 'ModelNode';

const nodeTypes = { agent: AgentNode, tool: ToolNode, model: ModelNode };

// ── Layout Constants ──────────────────────────────────────────────────

const CX            = 680;   // canvas horizontal centre
const CY            = 60;    // coordinator Y
const SPEC_Y        = 215;   // specialist row Y
const SPEC_SPACING  = 290;   // horizontal distance between specialist centres
const AGENT_W       = 160;
const TOOL_W        = 128;
const TOOL_COL_GAP  = 12;
const TOOL_ROW_H    = 57;
const TOOLS_START_Y = 350;
const MODEL_Y       = 620;

// ── Build Nodes & Edges ───────────────────────────────────────────────

function buildGraph() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Coordinator
  const coordinator = AGENTS.find((a) => a.role === 'supervisor')!;
  nodes.push({
    id: coordinator.id,
    type: 'agent',
    position: { x: CX - AGENT_W / 2, y: CY },
    data: { agent: coordinator, toolCount: 0 },
    draggable: false,
  });

  const specialists = AGENTS.filter((a) => a.role === 'worker');
  const totalSpan   = (specialists.length - 1) * SPEC_SPACING;

  specialists.forEach((spec, si) => {
    const cx = CX - totalSpan / 2 + si * SPEC_SPACING;

    // Specialist node
    nodes.push({
      id: spec.id,
      type: 'agent',
      position: { x: cx - AGENT_W / 2, y: SPEC_Y },
      data: { agent: spec, toolCount: TOOLS.filter((t) => spec.toolIds.includes(t.id)).length },
      draggable: false,
    });

    // Coordinator → Specialist (animated, coloured, arrow)
    edges.push({
      id: `e-coord-${spec.id}`,
      source: coordinator.id,
      target: spec.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: spec.color, strokeWidth: 1.8, opacity: 0.55 },
      markerEnd: { type: MarkerType.ArrowClosed, color: spec.color, width: 13, height: 13 },
    });

    // Tool nodes — 2 per row, centred on specialist column
    const toolsForSpec = TOOLS.filter((t) => spec.toolIds.includes(t.id));
    const pairW        = TOOL_W * 2 + TOOL_COL_GAP;
    const leftX        = cx - pairW / 2;
    const rightX       = leftX + TOOL_W + TOOL_COL_GAP;

    toolsForSpec.forEach((tool, ti) => {
      const col = ti % 2;
      const row = Math.floor(ti / 2);
      const tx  = col === 0 ? leftX : rightX;
      const ty  = TOOLS_START_Y + row * TOOL_ROW_H;

      nodes.push({
        id: tool.id,
        type: 'tool',
        position: { x: tx, y: ty },
        data: { tool },
        draggable: false,
      });

      edges.push({
        id: `e-${spec.id}-${tool.id}`,
        source: spec.id,
        target: tool.id,
        type: 'smoothstep',
        style: { stroke: spec.color, strokeWidth: 1, opacity: 0.2 },
      });

      // ML model connection
      if (tool.mlModel) {
        const mlModel = tool.id === 'forecast_flood_levels' ? ML_MODELS[0] : ML_MODELS[1];
        const modelId = `model-${mlModel.id}`;
        if (!nodes.find((n) => n.id === modelId)) {
          nodes.push({
            id: modelId,
            type: 'model',
            position: { x: cx - 77, y: MODEL_Y },
            data: { model: mlModel },
            draggable: false,
          });
        }
        edges.push({
          id: `e-${tool.id}-${modelId}`,
          source: tool.id,
          target: modelId,
          type: 'smoothstep',
          style: { stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '5 3', opacity: 0.38 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7', width: 10, height: 10 },
        });
      }
    });
  });

  return { nodes, edges };
}

// ── Detail Panel ──────────────────────────────────────────────────────

type Selection =
  | { kind: 'agent'; agent: Agent }
  | { kind: 'tool';  tool: Tool   }
  | { kind: 'model'; model: MLModel }
  | null;

const BASE_PANEL = {
  padding: '12px 14px',
  borderRadius: 10,
  marginTop: 8,
  background: 'rgba(11,17,34,0.75)',
};

function DetailPanel({ selection }: { selection: Selection }) {
  if (!selection) return null;

  if (selection.kind === 'agent') {
    const { agent } = selection;
    const tools = TOOLS.filter((t) => agent.toolIds.includes(t.id));
    return (
      <div style={{ ...BASE_PANEL, border: `1px solid ${agent.color}22`, borderTop: `2px solid ${agent.color}55` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: agent.color, boxShadow: `0 0 6px ${agent.color}`, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{agent.name}</span>
          <span style={{ fontSize: 7, fontWeight: 600, padding: '1px 6px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginLeft: 'auto' }}>
            {agent.role}
          </span>
        </div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.44)', lineHeight: 1.68, marginBottom: tools.length ? 9 : 0 }}>
          {agent.description}
        </p>
        {tools.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tools.map((t) => (
              <span key={t.id} style={{ fontSize: 7.5, padding: '2px 7px', borderRadius: 5, background: `${agent.color}12`, border: `1px solid ${agent.color}1e`, color: agent.color }}>
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selection.kind === 'tool') {
    const { tool } = selection;
    const agent = AGENTS.find((a) => a.toolIds.includes(tool.id));
    const color = agent?.color ?? '#64748b';
    return (
      <div style={{ ...BASE_PANEL, border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${color}55` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{tool.name}</span>
          {tool.mlModel && (
            <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'rgba(168,85,247,0.2)', color: '#d8b4fe' }}>ML</span>
          )}
          <span style={{ fontSize: 7, color, opacity: 0.6, marginLeft: 'auto', textTransform: 'capitalize' as const }}>
            {tool.category.replace('-', '\u00a0')}
          </span>
        </div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.44)', lineHeight: 1.68, marginBottom: 6 }}>{tool.description}</p>
        {agent && (
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
            Specialist: <span style={{ color: agent.color, fontWeight: 600 }}>{agent.name}</span>
          </div>
        )}
      </div>
    );
  }

  if (selection.kind === 'model') {
    const { model } = selection;
    return (
      <div style={{ ...BASE_PANEL, border: '1px solid rgba(168,85,247,0.22)', borderTop: '2px solid rgba(168,85,247,0.48)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(168,85,247,0.2)', color: '#d8b4fe' }}>{model.badge}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{model.name}</span>
        </div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.44)', lineHeight: 1.68, marginBottom: 6 }}>{model.description}</p>
        <div style={{ fontSize: 8, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.28)', lineHeight: 1.6, marginBottom: 4 }}>{model.architecture}</div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>Loss: {model.loss}</div>
      </div>
    );
  }

  return null;
}

// ── Main Component ────────────────────────────────────────────────────

const { nodes: initialNodes, edges: initialEdges } = buildGraph();

export default function AgentGraph({ fullscreen }: { fullscreen?: boolean }) {
  const [selection, setSelection] = useState<Selection>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'agent') {
      const agent = AGENTS.find((a) => a.id === node.id);
      if (agent) setSelection({ kind: 'agent', agent });
    } else if (node.type === 'tool') {
      const tool = TOOLS.find((t) => t.id === node.id);
      if (tool) setSelection({ kind: 'tool', tool });
    } else if (node.type === 'model') {
      const model = ML_MODELS.find((m) => node.id.startsWith(`model-${m.id}`));
      if (model) setSelection({ kind: 'model', model });
    }
  }, []);

  const onPaneClick = useCallback(() => setSelection(null), []);

  return (
    <div className={`flex ${fullscreen ? 'flex-row gap-4 h-full' : 'flex-col'}`}>
      {/* Graph canvas */}
      <div
        className={`rounded-xl overflow-hidden ${fullscreen ? 'flex-1 min-h-[500px]' : 'h-[400px]'}`}
        style={{ background: 'rgba(6,9,18,0.7)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          panOnDrag
          panOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          maxZoom={2.5}
        >
          <Background color="rgba(255,255,255,0.02)" gap={24} size={1} />
          <Controls
            showInteractive={false}
            style={{
              background: 'rgba(11,17,34,0.88)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              '--xy-controls-button-background-color': 'transparent',
              '--xy-controls-button-background-color-hover': 'rgba(255,255,255,0.08)',
              '--xy-controls-button-color': 'rgba(255,255,255,0.45)',
              '--xy-controls-button-border-bottom-color': 'rgba(255,255,255,0.06)',
            } as React.CSSProperties}
          />
        </ReactFlow>
      </div>

      {/* Detail panel */}
      {fullscreen ? (
        <div className="w-72 shrink-0 overflow-y-auto scrollbar-thin flex flex-col">
          {/* Agent legend */}
          <div className="mb-3 p-3 rounded-lg" style={{ background: 'rgba(11,17,34,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[8px] font-semibold text-white/25 uppercase tracking-[0.12em] mb-2">Architecture</p>
            <div className="flex flex-col gap-1.5">
              {AGENTS.filter((a) => a.role === 'worker').map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color, boxShadow: `0 0 6px ${a.color}80` }} />
                  <span className="text-[9px] font-medium" style={{ color: a.color }}>{a.name}</span>
                  <span className="text-[8px] text-white/22 ml-auto">{a.toolIds.length} tools</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1 pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="w-2 h-2 rounded-full shrink-0 bg-purple-500" style={{ boxShadow: '0 0 6px #a855f780' }} />
                <span className="text-[9px] font-medium text-purple-400">ML Models</span>
                <span className="text-[8px] text-white/22 ml-auto">2 models</span>
              </div>
            </div>
          </div>
          {selection
            ? <DetailPanel selection={selection} />
            : <p className="text-[8px] text-white/20 px-1 mt-1">Click any node to inspect its capabilities and details.</p>
          }
        </div>
      ) : (
        selection && <DetailPanel selection={selection} />
      )}
    </div>
  );
}

