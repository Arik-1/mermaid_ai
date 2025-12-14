import React, { useMemo } from 'react';
import { WireframeButton } from './WireframeButton';
import { MermaidRenderer } from './MermaidRenderer';

interface MarkdownViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  mermaidCode: string;
}

export const MarkdownViewerModal: React.FC<MarkdownViewerModalProps> = ({
  isOpen,
  onClose,
  description,
  mermaidCode,
}) => {
  // Generate the markdown string
  const markdownContent = useMemo(() => {
    return `# Mermaid Diagram Description
${description || '(No description provided)'}

# Mermaid Code
\`\`\`mermaid
${mermaidCode}
\`\`\`
`;
  }, [description, mermaidCode]);

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram-export.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white p-4 md:p-8 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-4 shrink-0">
        <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-3xl font-bold uppercase">Markdown Viewer</h2>
            <span className="text-xs bg-black text-white px-2 py-1 font-mono hidden md:inline-block">PREVIEW MODE</span>
        </div>
        <div className="flex gap-2">
            <WireframeButton onClick={handleDownload} className="hidden md:block">
                Download .MD
            </WireframeButton>
            <WireframeButton onClick={onClose} active>
                Close [X]
            </WireframeButton>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 border-2 border-black bg-gray-50 relative flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left Column: Source (Raw Markdown) */}
        <div className="flex-1 flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-black min-h-0">
            <div className="bg-gray-200 border-b-2 border-black p-2 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold uppercase">Source (Raw)</span>
                <span className="text-[10px] font-mono text-gray-500">READ ONLY</span>
            </div>
            <textarea 
                readOnly
                className="flex-1 w-full p-4 font-mono text-xs bg-gray-100 resize-none focus:outline-none overflow-auto"
                value={markdownContent}
            />
        </div>

        {/* Right Column: Preview (Rendered) */}
        <div className="flex-1 flex flex-col bg-white min-h-0">
             <div className="bg-white border-b-2 border-black p-2 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold uppercase">Preview</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full border border-black bg-gray-200"></div>
                    <div className="w-2 h-2 rounded-full border border-black bg-white"></div>
                </div>
            </div>
            
            {/* Custom Renderer mimicking rendered markdown */}
            <div className="flex-1 overflow-auto p-6 prose prose-sm max-w-none">
                <h1 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-4 mt-0">
                    Mermaid Diagram Description
                </h1>
                <p className="mb-8 leading-relaxed whitespace-pre-wrap font-sans text-gray-800">
                    {description || <span className="text-gray-400 italic">(No description provided)</span>}
                </p>

                <h1 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-4">
                    Mermaid Diagram
                </h1>
                <div className="bg-white p-4 rounded border border-gray-200 overflow-x-auto min-h-[200px] flex items-center justify-center">
                    <MermaidRenderer 
                        code={mermaidCode} 
                        className="[&_svg]:max-w-full [&_svg]:h-auto"
                    />
                </div>
            </div>
        </div>

      </div>
      
      {/* Mobile only download button at bottom */}
      <div className="md:hidden mt-4 shrink-0">
        <WireframeButton onClick={handleDownload} className="w-full">
            Download .MD
        </WireframeButton>
      </div>
    </div>
  );
};
