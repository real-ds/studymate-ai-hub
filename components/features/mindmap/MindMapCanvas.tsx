"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  type ReactFlowInstance,
} from "reactflow"
import "reactflow/dist/style.css"
import dagre from "@dagrejs/dagre"
import MindMapNode from "./MindMapNode"
import type { MindMapNode as MindMapNodeType } from "@/types/feature.types"

const nodeTypes = { mindMapNode: MindMapNode }

const NODE_WIDTH = 180
const NODE_HEIGHT = 60

function flattenTree(
  node: MindMapNodeType,
  parentId: string | null = null,
  depth: number = 0,
  nodes: Node[] = [],
  edges: Edge[] = []
) {
  const nodeId = node.id || `node-${nodes.length}`
  nodes.push({
    id: nodeId,
    type: "mindMapNode",
    position: { x: 0, y: 0 },
    data: { label: node.label, detail: node.detail || "", depth },
  })

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#C8A96E", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#C8A96E" },
    })
  }

  if (node.children) {
    node.children.forEach((child) => flattenTree(child, nodeId, depth + 1, nodes, edges))
  }

  return { nodes, edges }
}

interface MindMapCanvasProps {
  data: MindMapNodeType
}

export default function MindMapCanvas({ data }: MindMapCanvasProps) {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNode, setSelectedNode] = useState<MindMapNodeType | null>(null)

  const { nodes: flatNodes, edges: flatEdges } = useMemo(() => flattenTree(data), [data])

  const layouted = useMemo(() => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 100 })

    flatNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
    })

    flatEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    return flatNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        },
      }
    })
  }, [flatNodes, flatEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(layouted)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flatEdges)

  useEffect(() => {
    setNodes(layouted)
    setEdges(flatEdges)
  }, [layouted, flatEdges, setNodes, setEdges])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const findNode = (n: MindMapNodeType): MindMapNodeType | null => {
        if (n.id === node.id) return n
        if (n.children) {
          for (const child of n.children) {
            const found = findNode(child)
            if (found) return found
          }
        }
        return null
      }
      setSelectedNode(findNode(data))
    },
    [data]
  )

  return (
    <div className="relative h-[600px] w-full rounded-xl border border-stone-200 bg-white shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      onInit={setReactFlowInstance}
      
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.3}
        maxZoom={2}
      >
        <Controls className="rounded-lg border border-stone-200 !bg-white" />
        <Background color="#e5e5e5" gap={20} size={1} />
        <MiniMap
          className="rounded-lg border border-stone-200"
          nodeStrokeColor="#C8A96E"
          nodeColor="#FAF8F4"
          maskColor="rgba(0,0,0,0.08)"
        />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-10 rounded-xl border border-amber-200 bg-white p-4 shadow-lg sm:left-auto sm:right-4 sm:w-80">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-heading text-sm font-semibold text-darkPrimary">
                {selectedNode.label}
              </h4>
              {selectedNode.detail && (
                <p className="mt-1 text-xs text-stone-600">{selectedNode.detail}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="shrink-0 text-mutedText hover:text-darkPrimary"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
