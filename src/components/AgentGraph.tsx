// ─── FloodMAS — Agent Architecture Graph (ReactFlow) ─────────────────

import { useCallback, useState, memo } from 'react';
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AGENTS, TOOLS, ML_MODELS, type Agent, type Tool, type MLModel } from '../config/intel';

// ── Custom Node Data Types ───────────────────────────────────────────

type AgentNodeData = { agent: Agent; toolCount: number };
type ToolNodeData = { tool: Tool };
type ModelNodeData = { model: MLModel };

// ── Custom Nodes ─────────────────────────────────────────────────────

const AgentNode = memo(({ data }: NodeProps<Node<AgentNodeData>>) => {
  const { agent, toolCount } = data;
  const isSupervisor = agent.role === 'supervisor';
  return (
    <div
      className="rounded-lg px-3 py-2 min-w-[130px] text-center"
      style={{
        background: 'rgba(15,23,42,0.85)',
        border: `1.5px solid ${agent.color}40`,
        boxShadow: `0 0 12px ${agent.color}15`,
      }}
    >
      {!isSupervisor && <Handle type="target" position={Position.Top} className="!bg-white/20 !w-1.5 !h-1.5 !border-0" />}
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.color }} />
        <span className="text-[10px] font-bold text-white/90">{agent.name}</span>
      </div>
      <span
        className="inline-block text-[7px] font-semibold px-1.5 py-0.5 rounded-full mb-1"
        style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
      >
        {agent.model}
      </span>
      <div className="text-[7px] text-white/30">
        {isSupervisor ? 'Supervisor' : `${toolCount} tools`}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-white/20 !w-1.5 !h-1.5 !border-0" />
    </div>
  );
});

const ToolNode = memo(({ data }: NodeProps<Node<ToolNodeData>>) => {
  const { tool } = data;
  const agent = AGENTS.find((a) => a.toolIds.includes(tool.id));
  const color = agent?.color ?? '#64748b';
  return (
    <div
      className="rounded-md px-2 py-1 min-w-[100px] text-center"
      style={{
        background: 'rgba(15,23,42,0.7)',
        border: `1px solid ${color}25`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/10 !w-1 !h-1 !border-0" />
      <div className="flex items-center justify-center gap-1">
        <span className="text-[8px] text-white/60">{tool.name}</span>
        {tool.mlModel && (
          <span className="text-[6px] font-bold px-1 py-px rounded bg-purple-500/20 text-purple-300">ML</span>
        )}
      </div>
    </div>
  );
});

const ModelNode = memo(({ data }: NodeProps<Node<ModelNodeData>>) => {
  const { model } = data;
  return (
    <div
      className="rounded-lg px-3 py-2 min-w-[140px] text-center"
      style={{
        background: 'rgba(15,23,42,0.85)',
        border: '1.5px solid rgba(168,85,247,0.35)',
        boxShadow: '0 0 16px rgba(168,85,247,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/10 !w-1.5 !h-1.5 !border-0" />
      <span className="inline-block text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 mb-1">
        {model.badge}
      </span>
      <div className="text-[8px] text-white/70 font-medium">{model.name}</div>
      <div className="text-[6px] text-white/25 mt-0.5">{model.outputs.join(' · ')}</div>
    </div>
  );
});

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  model: ModelNode,
};

// ── Layout constants ─────────────────────────────────────────────────

const CX = 550;                    // center X
const CY = 30;                     // coordinator Y
const SPEC_Y = 140;               // specialist row Y
const TOOL_Y = 270;               // tool row Y
const MODEL_Y = 400;              // model row Y
const SPEC_GAP = 280;             // gap between specialists
const TOOL_GAP = 150;             // gap between tools

// ── Build nodes & edges ──────────────────────────────────────────────

function buildGraph() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Coordinator
  const coordinator = AGENTS.find((a) => a.role === 'supervisor')!;
  nodes.push({
    id: coordinator.id,
    type: 'agent',
    position: { x: CX - 65, y: CY },
    data: { agent: coordinator, toolCount: 0 },
    draggable: false,
  });

  // Specialists (left to right)
  const specialists = AGENTS.filter((a) => a.role === 'worker');
  const specStartX = CX - ((specialists.length - 1) * SPEC_GAP) / 2;

  specialists.forEach((spec, si) => {
    const sx = specStartX + si * SPEC_GAP;
    const toolsForSpec = TOOLS.filter((t) => spec.toolIds.includes(t.id));

    nodes.push({
      id: spec.id,
      type: 'agent',
      position: { x: sx - 65, y: SPEC_Y },
      data: { agent: spec, toolCount: toolsForSpec.length },
      draggable: false,
    });

    // Edge: coordinator → specialist
    edges.push({
      id: `e-coord-${spec.id}`,
      source: coordinator.id,
      target: spec.id,
      animated: true,
      style: { stroke: spec.color, strokeWidth: 1.5, strokeDasharray: '6 3', opacity: 0.4 },
    });

    // Tool nodes for this specialist
    const toolStartX = sx - ((toolsForSpec.length - 1) * TOOL_GAP) / 2;
    toolsForSpec.forEach((tool, ti) => {
      const tx = toolStartX + ti * TOOL_GAP;
      nodes.push({
        id: tool.id,
        type: 'tool',
        position: { x: tx - 50, y: TOOL_Y + (ti % 2 === 0 ? 0 : 40) },
        data: { tool },
        draggable: false,
      });

      edges.push({
        id: `e-${spec.id}-${tool.id}`,
        source: spec.id,
        target: tool.id,
        style: { stroke: spec.color, strokeWidth: 1, opacity: 0.25 },
      });

      // If the tool uses an ML model, add model node + edge
      if (tool.mlModel) {
        const mlModel = tool.id === 'forecast_flood_levels' ? ML_MODELS[0] : ML_MODELS[1];
        const modelNodeId = `model-${mlModel.id}-${tool.id}`;
        // Only add model node if not already added
        if (!nodes.find((n) => n.id === modelNodeId)) {
          nodes.push({
            id: modelNodeId,
            type: 'model',
            position: { x: tx - 70, y: MODEL_Y },
            data: { model: mlModel },
            draggable: false,
          });
        }
        edges.push({
          id: `e-${tool.id}-${modelNodeId}`,
          source: tool.id,
          target: modelNodeId,
          style: { stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '4 3', opacity: 0.3 },
        });
      }
    });
  });

  return { nodes, edges };
}

// ── Detail Panel ─────────────────────────────────────────────────────

type Selection = { kind: 'agent'; agent: Agent } | { kind: 'tool'; tool: Tool } | { kind: 'model'; model: MLModel } | null;

function DetailPanel({ selection }: { selection: Selection }) {
  if (!selection) return null;

  if (selection.kind === 'agent') {
    const { agent } = selection;
    return (
      <div className="p-2 rounded-lg mt-2" style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${agent.color}25` }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
          <span className="text-[9px] font-bold text-white/80">{agent.name}</span>
          <span className="text-[7px] px-1 py-px rounded-full bg-white/5 text-white/30">{agent.role}</span>
        </div>
        <p className="text-[8px] text-white/40 leading-relaxed">{agent.description}</p>
        {agent.toolIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {agent.toolIds.map((tid) => {
              const t = TOOLS.find((tt) => tt.id === tid);
              return (
                <span key={tid} className="text-[6px] px-1.5 py-0.5 rounded bg-white/5 text-white/25">
                  {t?.name ?? tid}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (selection.kind === 'tool') {
    const { tool } = selection;
    const agent = AGENTS.find((a) => a.toolIds.includes(tool.id));
    return (
      <div className="p-2 rounded-lg mt-2" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-bold text-white/80">{tool.name}</span>
          {tool.mlModel && <span className="text-[6px] font-bold px-1 py-px rounded bg-purple-500/20 text-purple-300">ML</span>}
        </div>
        <p className="text-[8px] text-white/40 leading-relaxed">{tool.description}</p>
        {agent && (
          <div className="text-[7px] text-white/20 mt-1">Specialist: <span style={{ color: agent.color }}>{agent.name}</span></div>
        )}
      </div>
    );
  }

  if (selection.kind === 'model') {
    const { model } = selection;
    return (
      <div className="p-2 rounded-lg mt-2" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{model.badge}</span>
          <span className="text-[9px] font-bold text-white/80">{model.name}</span>
        </div>
        <p className="text-[8px] text-white/40 leading-relaxed mb-1">{model.description}</p>
        <div className="text-[7px] text-white/25 font-mono leading-relaxed">{model.architecture}</div>
        <div className="text-[7px] text-white/20 mt-1">Loss: {model.loss}</div>
      </div>
    );
  }

  return null;
}

// ── Main Component ───────────────────────────────────────────────────

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
      const model = ML_MODELS.find((m) => `model-${m.id}` === node.id || node.id.startsWith(`model-${m.id}`));
      if (model) setSelection({ kind: 'model', model });
    }
  }, []);

  return (
    <div className={`flex ${fullscreen ? 'flex-row gap-4 h-full' : 'flex-col'}`}>
      <div
        className={`rounded-lg overflow-hidden ${fullscreen ? 'flex-1 min-h-[500px]' : 'h-[320px]'}`}
        style={{ background: 'rgba(6,10,20,0.5)' }}
      >
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: fullscreen ? 0.25 : 0.15 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={fullscreen}
          zoomOnPinch={fullscreen}
          zoomOnDoubleClick={false}
          panOnDrag={fullscreen}
          panOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          minZoom={0.2}
          maxZoom={fullscreen ? 2 : 1}
        >
          <Background color="rgba(255,255,255,0.03)" gap={20} />
        </ReactFlow>
      </div>
      {fullscreen ? (
        <div className="w-72 shrink-0 overflow-y-auto scrollbar-thin">
          <DetailPanel selection={selection} />
          {!selection && (
            <p className="text-[9px] text-white/20 p-3">Click any node to inspect</p>
          )}
        </div>
      ) : (
        <DetailPanel selection={selection} />
      )}
    </div>
  );
}
