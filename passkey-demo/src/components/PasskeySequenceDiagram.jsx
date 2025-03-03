import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

function FlowWithFitView({ nodes, edges, onNodesChange, onEdgesChange, setViewportFitter }) {
  const reactFlow = useReactFlow();
  
  // Allow parent component to trigger fitView
  useEffect(() => {
    setViewportFitter(() => () => {
      reactFlow.fitView({ padding: 0.2, duration: 500 });
    });
  }, [reactFlow, setViewportFitter]);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      fitViewOptions={{ 
        padding: 0.2, 
        duration: 300
      }}
      maxZoom={1.5}
      minZoom={0.3}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Controls />
      <Background color="#f8f8f8" gap={16} variant="dots" />
    </ReactFlow>
  );
}

// Inner component that uses React Flow hooks
function SequenceDiagramInner({ state, showAuthentication = false, showCrossDevice = false }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [fitView, setFitView] = useState(() => () => {});
  
  // Registration flow steps with actor information
  const registrationSteps = [
    { id: 'reg-1', message: 'User requests registration', from: 'user', to: 'browser' },
    { id: 'reg-2', message: 'Browser forwards request to server', from: 'browser', to: 'server' },
    { id: 'reg-3', message: 'Server generates challenge', from: 'server', to: 'browser' },
    { id: 'reg-4', message: 'Browser prompts for biometrics', from: 'browser', to: 'user' },
    { id: 'reg-5', message: 'User provides biometrics', from: 'user', to: 'browser' },
    { id: 'reg-6', message: 'Browser generates keypair', from: 'browser', to: 'browser' },
    { id: 'reg-7', message: 'Browser sends public key to server', from: 'browser', to: 'server' },
    { id: 'reg-8', message: 'Server stores public key', from: 'server', to: 'server' },
    { id: 'reg-9', message: 'Server confirms registration', from: 'server', to: 'browser' },
    { id: 'reg-10', message: 'Browser notifies registration success', from: 'browser', to: 'user' },
  ];
  
  // Authentication flow steps with actor information
  const authenticationSteps = [
    { id: 'auth-1', message: 'User initiates login', from: 'user', to: 'browser' },
    { id: 'auth-2', message: 'Browser forwards request to server', from: 'browser', to: 'server' },
    { id: 'auth-3', message: 'Server sends challenge with passkey options', from: 'server', to: 'browser' },
    { id: 'auth-4', message: 'Browser shows available passkeys to user', from: 'browser', to: 'user' },
    { id: 'auth-5', message: 'User selects which passkey to use', from: 'user', to: 'browser' },
    { id: 'auth-6', message: 'Browser prompts for biometrics', from: 'browser', to: 'user' },
    { id: 'auth-7', message: 'User provides biometrics', from: 'user', to: 'browser' },
    { id: 'auth-8', message: 'Browser signs challenge with private key', from: 'browser', to: 'browser' },
    { id: 'auth-9', message: 'Browser sends signature to server', from: 'browser', to: 'server' },
    { id: 'auth-10', message: 'Server verifies signature with public key', from: 'server', to: 'server' },
    { id: 'auth-11', message: 'Server confirms authentication', from: 'server', to: 'browser' },
    { id: 'auth-12', message: 'Browser grants access to user', from: 'browser', to: 'user' },
  ];
  
  // Cross-device flow steps with mobile device actor
  const crossDeviceSteps = [
    { id: 'cross-1', message: 'User initiates login on desktop', from: 'user', to: 'browser' },
    { id: 'cross-2', message: 'Browser forwards request to server', from: 'browser', to: 'server' },
    { id: 'cross-3', message: 'Server sends authentication challenge', from: 'server', to: 'browser' },
    { id: 'cross-4', message: 'Browser looks for passkey on device', from: 'browser', to: 'browser' },
    { id: 'cross-5', message: 'No passkey found, browser generates QR code', from: 'browser', to: 'browser' },
    { id: 'cross-6', message: 'Browser displays QR code to user', from: 'browser', to: 'user' },
    { id: 'cross-7', message: 'User scans QR code with mobile device', from: 'user', to: 'mobile' },
    { id: 'cross-8', message: 'Mobile establishes Bluetooth connection', from: 'mobile', to: 'browser' },
    { id: 'cross-9', message: 'Browser verifies device proximity', from: 'browser', to: 'browser' },
    { id: 'cross-10', message: 'Mobile requests authentication details', from: 'mobile', to: 'server' },
    { id: 'cross-11', message: 'Server sends challenge to mobile device', from: 'server', to: 'mobile' },
    { id: 'cross-12', message: 'Mobile prompts for biometrics', from: 'mobile', to: 'user' },
    { id: 'cross-13', message: 'User provides biometrics on mobile', from: 'user', to: 'mobile' },
    { id: 'cross-14', message: 'Mobile signs challenge with private key', from: 'mobile', to: 'mobile' },
    { id: 'cross-15', message: 'Mobile sends signature to server', from: 'mobile', to: 'server' },
    { id: 'cross-16', message: 'Server verifies signature', from: 'server', to: 'server' },
    { id: 'cross-17', message: 'Server notifies browser of success', from: 'server', to: 'browser' },
    { id: 'cross-18', message: 'Browser grants access to user', from: 'browser', to: 'user' },
  ];
  
  let steps = registrationSteps;
  if (showAuthentication) {
    steps = authenticationSteps;
  } else if (showCrossDevice) {
    steps = crossDeviceSteps;
  }

  // Initialize the base actor nodes when the diagram type changes
  useEffect(() => {
    initializeFlow();
  }, [showAuthentication, showCrossDevice]);

  const initializeFlow = useCallback(() => {
    let initialNodes = [
      {
        id: 'user',
        data: { 
          label: (
            <div className="actor-node user-actor">
              <div className="actor-icon">👤</div>
              <div className="actor-label">User</div>
            </div>
          )
        },
        position: { x: 100, y: 60 },
        style: { width: 'auto', zIndex: 5 }, // Higher z-index to ensure it's above step nodes
        sourcePosition: Position.Right
      },
      {
        id: 'browser',
        data: { 
          label: (
            <div className="actor-node browser-actor">
              <div className="actor-icon">🌐</div>
              <div className="actor-label">Browser</div>
            </div>
          )
        },
        position: { x: 300, y: 60 },
        style: { width: 'auto', zIndex: 5 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      },
      {
        id: 'server',
        data: { 
          label: (
            <div className="actor-node server-actor">
              <div className="actor-icon">🖥️</div>
              <div className="actor-label">Server</div>
            </div>
          )
        },
        position: { x: 500, y: 60 },
        style: { width: 'auto', zIndex: 5 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right
      }
    ];
    
    // Add mobile device node for cross-device flow
    if (showCrossDevice) {
      console.log("Adding mobile device node for cross-device flow");
      initialNodes.push({
        id: 'mobile',
        data: { 
          label: (
            <div className="actor-node mobile-actor">
              <div className="actor-icon">📱</div>
              <div className="actor-label">Mobile</div>
            </div>
          )
        },
        position: { x: 700, y: 60 }, // Position mobile in its own column
        style: { width: 'auto', zIndex: 5 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right
      });
    }
    
    setNodes(initialNodes);
    setEdges([]);
    setCurrentStep(0);
    
    // Fit view after initializing
    setTimeout(() => fitView(), 100);
  }, [setNodes, setEdges, setCurrentStep, fitView]);
  
  // Function to add a single step to the animation
  const nextStep = useCallback(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      const isSelfReferential = step.from === step.to;
      
      // Calculate gradient color based on step number
      const calculateColor = (index, total) => {
        // Create a gradient from blue to green
        const startColor = { r: 59, g: 130, b: 246 }; // Blue (#3b82f6)
        const endColor = { r: 16, g: 185, b: 129 };   // Green (#10b981)
        
        // Calculate percentage through the steps
        const percent = index / (total - 1);
        
        // Interpolate between colors
        const r = Math.round(startColor.r + percent * (endColor.r - startColor.r));
        const g = Math.round(startColor.g + percent * (endColor.g - startColor.g));
        const b = Math.round(startColor.b + percent * (endColor.b - startColor.b));
        
        return { 
          background: `rgb(${r}, ${g}, ${b})`,
          border: `rgb(${Math.max(r-30, 0)}, ${Math.max(g-30, 0)}, ${Math.max(b-30, 0)})`
        };
      };
      
      const color = calculateColor(currentStep, steps.length);
      
      // Create a new step node
      const stepNode = {
        id: `step-${currentStep}`,
        data: { 
          label: (
            <div className="step-node" style={{ borderColor: color.border }}>
              <div className="step-number" style={{ backgroundColor: color.background }}>{currentStep + 1}</div>
              <div className="step-message">{step.message}</div>
            </div>
          )
        },
        position: { 
          // Position the step nodes based on their source, with spacing
          x: step.from === 'user' ? 100 : 
             step.from === 'browser' ? 300 : 
             step.from === 'server' ? 500 : 700, // Mobile in its own column
          y: 180 + (currentStep * 75)  // Increased space between steps (75px instead of 60px)
        },
        style: { width: 'auto' }
      };
      
      setNodes(nodes => [...nodes, stepNode]);
      
      // Create an edge representing the message between actors
      let newEdge = null;
      
      // Calculate color for the edge
      const edgeColorData = calculateColor(currentStep, steps.length);
      const edgeColor = edgeColorData.background;
      
      // Add connection to previous step node if this isn't the first step
      if (currentStep > 0) {
        const prevStepId = `step-${currentStep - 1}`;
        const stepConnectionEdge = {
          id: `step-connection-${currentStep}`,
          source: prevStepId,
          target: `step-${currentStep}`,
          animated: false,
          style: { 
            stroke: '#94a3b8', 
            strokeWidth: 1.5,
            strokeDasharray: 5,
            opacity: 0.7
          },
          type: 'default',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
            width: 12,
            height: 12
          }
        };
        
        setEdges(edges => [...edges, stepConnectionEdge]);
      }
      
      if (isSelfReferential) {
        // Self-referential edge (loop)
        newEdge = {
          id: `edge-${currentStep}`,
          source: step.from,
          target: step.from,
          sourceHandle: null,
          targetHandle: null,
          animated: true,
          style: { 
            stroke: edgeColor, 
            strokeWidth: 2,
            strokeDasharray: 5 
          },
          label: `Step ${currentStep + 1}`,
          labelStyle: { fontWeight: 500 },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          type: 'default',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 15,
            height: 15
          }
        };
        
        // Add a self-loop
        if (step.from === 'user') {
          newEdge.pathOptions = { offset: 50, curvature: 0.5 };
        } else if (step.from === 'browser') {
          newEdge.pathOptions = { offset: 50, curvature: 0.3 };
        } else {
          newEdge.pathOptions = { offset: 50, curvature: 0.5 };
        }
      } else {
        // Regular edge between two nodes
        newEdge = {
          id: `edge-${currentStep}`,
          source: step.from,
          target: step.to,
          sourceHandle: null,
          targetHandle: null,
          animated: true,
          style: { 
            stroke: edgeColor, 
            strokeWidth: 2 
          },
          label: `Step ${currentStep + 1}`,
          labelStyle: { fontWeight: 500 },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          type: 'default',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 15,
            height: 15
          }
        };
      }
      
      setEdges(edges => [...edges, newEdge]);
      
      // Increment step counter
      setCurrentStep(prev => prev + 1);
      
      // Fit view after adding new nodes
      setTimeout(() => fitView(), 200);
    }
  }, [currentStep, steps, setNodes, setEdges, fitView]);

  const resetFlow = useCallback(() => {
    initializeFlow();
  }, [initializeFlow]);

  return (
    <div className="sequence-diagram-container">
      <div className="sequence-diagram-flow" style={{ height: 550 }}>
        <FlowWithFitView 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange}
          setViewportFitter={setFitView}
        />
      </div>
      
      <div className="sequence-controls">
        <button 
          onClick={nextStep} 
          className="sequence-button" 
          disabled={currentStep >= steps.length}
        >
          {currentStep === 0 ? 'Start Animation' : 'Next Step'} 
          {currentStep > 0 && currentStep < steps.length && ` (${currentStep}/${steps.length})`}
        </button>
        
        <button 
          onClick={resetFlow} 
          className="sequence-button reset"
          disabled={currentStep === 0}
        >
          Reset
        </button>
      </div>
      
      <div className="sequence-step-info">
        {currentStep > 0 && currentStep <= steps.length && (
          <div className="current-step-info">
            <div className="step-number">{currentStep}</div>
            <div className="step-details">
              <h4>{steps[currentStep-1].message}</h4>
              <div className="step-actors">
                <div className="step-actor">
                  <span className="actor-label">From:</span> 
                  <span className="actor-name">{steps[currentStep-1].from === 'user' ? '👤 User' : 
                    steps[currentStep-1].from === 'browser' ? '🌐 Browser' : 
                    steps[currentStep-1].from === 'server' ? '🖥️ Server' : '📱 Mobile'}</span>
                </div>
                <div className="step-actor">
                  <span className="actor-label">To:</span>
                  <span className="actor-name">{steps[currentStep-1].to === 'user' ? '👤 User' : 
                    steps[currentStep-1].to === 'browser' ? '🌐 Browser' : 
                    steps[currentStep-1].to === 'server' ? '🖥️ Server' : '📱 Mobile'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentStep === 0 && (
          <div className="default-step-info">
            Click "Start Animation" to see the {
              showAuthentication ? 'authentication' : 
              showCrossDevice ? 'cross-device authentication' : 'registration'
            } flow
          </div>
        )}
        {currentStep > steps.length && (
          <div className="complete-step-info">
            <span className="check-icon">✓</span> Animation complete! Click "Reset" to start over.
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component to provide the ReactFlow context
export function PasskeySequenceDiagram(props) {
  return (
    <ReactFlowProvider>
      <SequenceDiagramInner {...props} />
    </ReactFlowProvider>
  );
}