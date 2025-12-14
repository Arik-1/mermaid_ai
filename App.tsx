import React, { useState } from 'react';
import { generateMermaidFromText, generateTextFromMermaid, generateRandomDescription } from './services/geminiService';
import { MermaidRenderer } from './components/MermaidRenderer';
import { WireframeButton } from './components/WireframeButton';
import { MarkdownViewerModal } from './components/MarkdownViewerModal';
import { PanZoomContainer } from './components/PanZoomContainer';
import { WireframeLoader } from './components/WireframeLoader';
import { EXAMPLES, FALLBACK_DIAGRAM_CODE } from './examples';

const INITIAL_DESCRIPTION = '';

const App: React.FC = () => {
  // State for inputs and outputs
  const [description, setDescription] = useState<string>(INITIAL_DESCRIPTION);
  const [mermaidCode, setMermaidCode] = useState<string>('');
  
  // UI States
  // Split loading states to prevent button text flickering on the wrong button
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const isLoading = isGenerating || isExplaining;

  const [error, setError] = useState<string | null>(null);
  const [isMdViewerOpen, setIsMdViewerOpen] = useState<boolean>(false);

  const handleGenerateDiagram = async () => {
    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
       setError("Please enter a description first.");
       return;
    }

    // Check for short description (< 20 chars)
    if (trimmedDesc.length < 20) {
        setMermaidCode(FALLBACK_DIAGRAM_CODE);
        setError(null);
        return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedCode = await generateMermaidFromText(description);
      setMermaidCode(generatedCode);
    } catch (err) {
      // If API fails, show the fallback funny diagram instead of a generic error
      console.error(err);
      setMermaidCode(FALLBACK_DIAGRAM_CODE);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplainCode = async () => {
    if (!mermaidCode.trim()) {
        setError("Please enter Mermaid code first.");
        return;
    }

    setIsExplaining(true);
    setError(null);

    try {
      const generatedDescription = await generateTextFromMermaid(mermaidCode);
      setDescription(generatedDescription);
    } catch (err) {
      setError("Failed to explain code. Please check your API key or try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleMermaidCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMermaidCode(e.target.value);
  };

  const handleClear = () => {
    setDescription('');
    setMermaidCode('');
    setError(null);
  };

  const handleRandomExample = async () => {
    setIsGenerating(true);
    setError(null);
    setDescription(''); 
    setMermaidCode(''); // Clear existing diagram immediately
    
    try {
       // 1. Generate Description First
       const randomDesc = await generateRandomDescription();
       setDescription(randomDesc);

       // 2. Then Generate Diagram from that Description
       const generatedCode = await generateMermaidFromText(randomDesc);
       setMermaidCode(generatedCode);
    } catch (err) {
       // Fallback to local examples if API fails
       const random = EXAMPLES[0];
       setMermaidCode(random.code);
       setDescription(random.description);
    } finally {
       setIsGenerating(false);
    }
  };

  const handleExampleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    const example = EXAMPLES.find(ex => ex.label === selectedLabel);
    
    if (example) {
      setDescription(example.description);
      setMermaidCode(example.code);
      setError(null);
    }
  };

  // Logic to determine which action the main button performs
  const isDescriptionEmpty = !description.trim();
  const handleMainAction = isDescriptionEmpty ? handleRandomExample : handleGenerateDiagram;
  const mainButtonLabel = isGenerating 
    ? 'Thinking...' 
    : (isDescriptionEmpty ? 'Random Description' : 'Generate Diagram ↓');

  return (
    <div className="h-screen w-screen bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] p-4 md:p-6 flex flex-col overflow-hidden box-border">
      
      {/* Global Loader Overlay */}
      <WireframeLoader isLoading={isLoading} />

      {/* Header */}
      <header className="border-b-4 border-black pb-2 mb-4 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase">Mermaid.AI</h1>
          <p className="text-[10px] md:text-xs mt-1 font-bold uppercase tracking-widest">Wireframe Generator & Explainer</p>
        </div>
        {/* Header controls moved to local cards */}
      </header>

      {/* Main Content Grid - constrained to available height */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 w-full">
        
        {/* Left Column: Controls & Input - Scrollable internally if needed, but flex constrained */}
        <div className="flex flex-col gap-4 order-2 lg:order-1 h-full min-h-0">
          
          {/* Top Card: Description */}
          <div className="border-2 border-black p-3 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col min-h-0">
            <h2 className="text-xs font-bold uppercase mb-2 border-b-2 border-black pb-1 inline-block shrink-0">
              1. Description
            </h2>
            <textarea
              className="w-full flex-1 p-2 font-mono text-xs border-2 border-black focus:outline-none resize-none bg-white mb-2"
              placeholder="e.g., A user logs in, if valid go to dashboard, else show error..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end shrink-0 gap-2">
              {!isDescriptionEmpty && (
                <WireframeButton onClick={handleClear} className="text-xs py-1" title="Clear All" disabled={isLoading}>
                  Clear
                </WireframeButton>
              )}
              <WireframeButton onClick={handleMainAction} disabled={isLoading} className="w-full md:w-auto text-xs py-1">
                {mainButtonLabel}
              </WireframeButton>
            </div>
          </div>

          {/* Bottom Card: Code Editor - Grows to fill space */}
          <div className="border-2 border-black p-3 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col relative min-h-0">
             <div className="flex justify-between items-center mb-2 border-b-2 border-black pb-1 shrink-0">
                <h2 className="text-xs font-bold uppercase inline-block">
                  2. Mermaid Code
                </h2>
                
                {/* Example Selector Dropdown */}
                <div className="relative">
                  <select 
                    onChange={handleExampleSelect} 
                    value="" 
                    className="appearance-none bg-black text-white text-[10px] font-bold uppercase px-3 py-1 pr-6 border-0 cursor-pointer hover:bg-gray-800 focus:outline-none"
                  >
                    <option value="" disabled>Load Example...</option>
                    {EXAMPLES.map(ex => (
                      <option key={ex.label} value={ex.label} className="bg-white text-black">{ex.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
             </div>
             
            <textarea
              className="w-full flex-1 p-2 font-mono text-xs border-2 border-black focus:outline-none resize-none mb-2"
              value={mermaidCode}
              onChange={handleMermaidCodeChange}
              placeholder="graph TD..."
              spellCheck={false}
            />

            <div className="flex justify-end shrink-0 gap-2">
                {mermaidCode.trim() && (
                    <WireframeButton onClick={handleClear} className="text-xs py-1" title="Clear All" disabled={isLoading}>
                        Clear
                    </WireframeButton>
                )}
                <WireframeButton onClick={handleExplainCode} disabled={isLoading} className="w-full md:w-auto text-xs py-1">
                  {isExplaining ? 'Analyzing...' : 'Describe Flow ↑'}
                </WireframeButton>
            </div>
          </div>

        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col h-full min-h-0 order-1 lg:order-2">
          <div className="flex-1 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 flex flex-col relative min-h-0">
            <div className="flex justify-between items-center mb-2 border-b-2 border-black pb-1 shrink-0">
              <h2 className="text-xs font-bold uppercase">Live Preview</h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMdViewerOpen(true)}
                  className="text-[10px] font-bold hover:underline uppercase block"
                  title="Full Screen Markdown View"
                >
                  [ Full Screen ]
                </button>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white border border-black rounded-full"></div>
                    <div className="w-2 h-2 bg-black border border-black rounded-full"></div>
                 </div>
              </div>
            </div>

            {/* Preview Area Container */}
            <div className="flex-1 relative border border-dashed border-gray-400 bg-gray-50 min-h-0 overflow-hidden">
               <PanZoomContainer>
                 <MermaidRenderer 
                    code={mermaidCode} 
                    // Important: Allow unrestricted max-width so the zoom container manages the viewport
                    className="[&_svg]:max-w-none [&_svg]:h-auto" 
                 />
               </PanZoomContainer>
            </div>
            
            <div className="mt-2 text-right shrink-0">
               <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                 Rendered with Mermaid JS
               </span>
            </div>
          </div>
        </div>

      </main>

      {/* Markdown Viewer Modal (Serves as Full Screen View) */}
      <MarkdownViewerModal 
        isOpen={isMdViewerOpen}
        onClose={() => setIsMdViewerOpen(false)}
        description={description}
        mermaidCode={mermaidCode}
      />

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 z-[60] max-w-md w-[90%] md:w-full animate-bounce">
            <span className="text-2xl font-bold">!</span>
            <p className="font-bold text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto font-bold hover:underline">CLOSE</button>
        </div>
      )}

    </div>
  );
};

export default App;
