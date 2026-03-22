import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

/* ─── SVG Icon Helper ─── */
const Ico = ({ d, size = 14, sw = 1.8, fill = "none", stroke = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);


const ICONS = {
  

  save:    <Ico size={13} d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" />,
  menu:    <Ico size={18} d="M3 12h18M3 6h18M3 18h18" />,
  close:   <Ico size={18} d="M18 6 6 18M6 6l12 12" />,
};

const NAV_ITEMS = [
  { label: "TRIGGERS",  icon: ICONS.zap,     active: true  }
  
];

/* ─── Custom Input Node ─── */
function InputNode({ data }) {
  return (
    <div className="w-52 bg-white rounded-2xl border border-violet-100 overflow-hidden shadow-lg shadow-violet-100/50">
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-violet-50">
        <span className="text-xs font-bold text-gray-700">User Input</span>
        <span className="text-gray-300 text-base cursor-pointer leading-none">⋮</span>
      </div>
      <div className="p-3">
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2">Prompt Text</p>
        <textarea
          value={data.input}
          onChange={e => data.setInput(e.target.value)}
          placeholder="Ask Anything."
          rows={4}
          className="w-full text-[11px] text-gray-600 bg-gray-50 rounded-lg p-2.5 border border-gray-100 resize-none outline-none leading-relaxed focus:border-violet-200 focus:ring-1 focus:ring-violet-100 transition-all placeholder:text-gray-300"
        />
      </div>
      <div className="flex items-center justify-between px-3 pb-3">
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Trigger</span>
        <div className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-md shadow-violet-300" />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-violet-600 !border-2 !border-white !shadow-md"
      />
    </div>
  );
}



function ResultNode({ data }) {
  const [expanded, setExpanded] = useState(false);

  //  Format text into paragraphs
  const formatText = (text) => {
    return text.split("\n").map((line, index) => (
      <p key={index} className="mb-1">
        {line}
      </p>
    ));
  };

  
  const MAX_LENGTH = 180;
  const isLong = data.result && data.result.length > MAX_LENGTH;
  const displayText =
    !expanded && isLong
      ? data.result.slice(0, MAX_LENGTH) + "..."
      : data.result;

  return (
    <div className="w-56 bg-white rounded-2xl border border-violet-100 overflow-hidden shadow-lg shadow-violet-100/50">
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-violet-600 !border-2 !border-white !shadow-md"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-violet-50">
        <span className="text-xs font-bold text-gray-700">Result</span>
        <div className="flex items-center gap-2">
          
          {/* Loader */}
          {data.loading && (
            <div className="w-3 h-3 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
          )}

          {/* Expand/Collapse */}
          <span
            onClick={() => setExpanded(!expanded)}
            className="text-gray-300 cursor-pointer leading-none text-lg"
          >
            {expanded ? "−" : "+"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-violet-100 text-violet-600 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
            AI Generated
          </span>
          {data.result && (
            <span className="text-[9px] text-gray-300">Done</span>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 min-h-[72px] max-h-40 overflow-y-auto">
          
          {/* Text Display */}
          <div
            className={`text-[11px] leading-relaxed whitespace-pre-wrap break-words ${
              data.result ? "text-gray-600 italic" : "text-gray-300"
            }`}
          >
            {data.result
              ? formatText(displayText)
              : data.loading
              ? "Processing your request..."
              : "Waiting for input trigger..."}
          </div>
        </div>

        {/* Show More / Less */}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-[10px] text-violet-600 font-semibold hover:underline"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            data.result
              ? "bg-emerald-400 shadow-md shadow-emerald-200"
              : "bg-gray-200"
          }`}
        />
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
          Output
        </span>
      </div>
    </div>
  );
}



const nodeTypes = { inputNode: InputNode, resultNode: ResultNode };

/* ─── Sidebar Content ─── */
function SidebarContent() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200 shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-800 leading-none">Node Library</p>
            <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-0.5 leading-none">drag to canvas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ label, icon, active }) => (
          <button
            key={label}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[11px] font-bold w-full transition-all ${
              active
                ? "bg-violet-50 text-violet-700"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className={active ? "text-violet-500" : "text-gray-300"}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      
    </div>
  );
}


export const  App=()=> {
  const [input, setInput]         = useState("");
  const [result, setResult]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sideOpen, setSideOpen]   = useState(false);
  const [saved, setSaved]         = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: "1", type: "inputNode",  position: { x: 60,  y: 100 }, data: { input: "", setInput: () => {} } },
    { id: "2", type: "resultNode", position: { x: 380, y: 100 }, data: { result: "", loading: false } },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: "e1-2", source: "1", target: "2", style: { stroke: "#7c3aed", strokeWidth: 2 } },
  ]);
  const onConnect = useCallback(p => setEdges(e => addEdge(p, e)), []);

  React.useEffect(() => {
    setNodes(ns =>
      ns.map(n =>
        n.id === "1" ? { ...n, data: { input, setInput } }
        : n.id === "2" ? { ...n, data: { result, loading } }
        : n
      )
    );
    setEdges(es =>
      es.map(e => e.id === "e1-2" ? { ...e, animated: loading } : e)
    );
  }, [input, result, loading]);

  const runFlow = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await axios.post("https://future-blink-backend.onrender.com/api/ask-ai", { prompt: input });
      setResult(res.data.result);
    } catch {
      setResult("Error fetching response. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  

  const saveData = async () => {
    try {
      await axios.post("http://localhost:5000/api/save", { prompt: input, response: result });
    } catch { /* silent */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-violet-50/30 overflow-hidden" style={{ fontFamily: "'Outfit','Nunito','Segoe UI',sans-serif" }}>

      {/* ── Top Navbar ── */}
      <header className="h-12 bg-white border-b border-violet-100 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3">
          {/* Mobile  */}
          <button
            onClick={() => setSideOpen(!sideOpen)}
            className="sm:hidden text-gray-400 hover:text-gray-600 transition-colors flex items-center"
          >
            {sideOpen ? ICONS.close : ICONS.menu}
          </button>

          <span className="text-sm font-extrabold text-gray-800 tracking-tight">AI Flow Builder</span>

          <nav className="hidden sm:flex gap-0.5">
            {["Dashboard"].map(t => {
              const k = t.toLowerCase();
              const isActive = activeTab === k;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(k)}
                  className={`px-3 py-1 text-xs font-bold transition-all border-b-2 ${
                    isActive
                      ? "text-violet-600 border-violet-600"
                      : "text-gray-400 border-transparent hover:text-gray-600"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </nav>
        </div>

      
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay sidebar */}
        {sideOpen && (
          <div className="sm:hidden absolute inset-0 z-40 flex">
            <div className="w-44 bg-white border-r border-violet-100 shadow-2xl shadow-violet-100/50 flex flex-col">
              <SidebarContent />
            </div>
            <div
              className="flex-1 bg-black/30 backdrop-blur-sm"
              onClick={() => setSideOpen(false)}
            />
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden sm:flex sm:w-44 bg-white border-r border-violet-100 flex-col shrink-0">
          <SidebarContent />
        </aside>

        {/* Canvas area */}
        <main className="flex-1 relative overflow-hidden bg-slate-50/80">

          {/* Live badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white border border-violet-100 rounded-full px-3 py-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-300" />
            <span className="text-[10px] text-gray-500 font-semibold">Live Connection: Stable</span>
          </div>

          {/* ReactFlow */}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.35 }}
            defaultEdgeOptions={{ style: { stroke: "#7c3aed", strokeWidth: 2 } }}
          >
            <Background color="#c4b5fd" gap={24} size={1} variant="dots" />
            <Controls className="!shadow-md !border !border-violet-100 !rounded-xl overflow-hidden" />
          </ReactFlow>

          {/* Bottom action bar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            <button
              onClick={runFlow}
              disabled={loading}
              className={`flex items-center gap-2 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-violet-300/50 transition-all active:scale-95 ${
                loading
                  ? "bg-violet-400 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              {loading ? (
                <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                ICONS.play
              )}
              {loading ? "Running..." : "Run Flow"}
            </button>

            <button
              onClick={saveData}
              className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border shadow-md transition-all active:scale-95 ${
                saved
                  ? "bg-violet-50 text-violet-600 border-violet-300"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200"
              }`}
            >
              {ICONS.save}
              {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}



