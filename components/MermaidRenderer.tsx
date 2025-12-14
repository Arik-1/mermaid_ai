import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { FALLBACK_DIAGRAM_CODE } from '../examples';
import { sanitizeMermaidCode } from '../services/geminiService';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

// Standard "Pretty" Config
const STANDARD_CONFIG = {
  startOnLoad: false,
  theme: 'neutral' as const,
  securityLevel: 'loose' as const,
  fontFamily: 'Courier Prime',
  logLevel: 'error' as const, // Only show errors
  flowchart: {
    curve: 'linear' as const,
    htmlLabels: true,
    padding: 15,
    nodeSpacing: 50,
    rankSpacing: 50,
  },
  sequence: {
    showSequenceNumbers: true,
    actorMargin: 50,
  },
  gantt: {
    barHeight: 20,
    fontSize: 11,
    topPadding: 15,
  },
};

// Fallback "Robust" Config
// Strategies to fix "suitable point" and layout errors:
// 1. Disable htmlLabels (calculating DOM size is error prone)
// 2. Increase spacing (gives the router more room)
// 3. Use linear curve (simplest math)
const ROBUST_CONFIG = {
  startOnLoad: false,
  theme: 'neutral' as const,
  securityLevel: 'loose' as const,
  fontFamily: 'Courier Prime',
  logLevel: 'error' as const,
  flowchart: {
    curve: 'linear' as const, // Strict straight lines are safest
    htmlLabels: false, // SVG labels are more stable for layout sizing
    padding: 20,
    nodeSpacing: 80, // Increased spacing
    rankSpacing: 80,
  },
  sequence: {
    showSequenceNumbers: true,
    actorMargin: 50,
  },
};

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    
    const renderDiagram = async () => {
      // Clear content if empty code
      if (!code || !code.trim()) {
        if (mounted) {
            setSvgContent('');
            setError(null);
        }
        return;
      }

      // Pre-process code to fix common AI syntax errors (like double quotes in labels)
      const cleanCode = sanitizeMermaidCode(code);

      if (mounted) {
        setIsRendering(true);
        // Do not clear existing SVG immediately to avoid flash, unless explicit error later
        setError(null); 
      }

      try {
        // Always reset to Standard Config before a fresh render
        mermaid.initialize(STANDARD_CONFIG);
        
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        
        // Direct render attempt using clean code
        const { svg } = await mermaid.render(id, cleanCode);
        
        if (mounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        console.warn("Mermaid Standard Render Failed:", err);
        
        const errorMessage = err?.message || '';
        // "suitable point" is a D3/Dagre layout pathing error
        const isLayoutError = 
            errorMessage.includes('suitable point') || 
            errorMessage.includes('Reading from undefined') ||
            errorMessage.includes('layout') ||
            errorMessage.includes('d3'); 

        // 1. Try Retry Strategy (Robust Config)
        if (isLayoutError && mounted) {
           console.log('Retrying with Robust Config (No HTML Labels, High Spacing)...');
           try {
               // Re-initialize with robust settings
               mermaid.initialize(ROBUST_CONFIG);
               
               const idRetry = `mermaid-retry-${Math.random().toString(36).substring(2, 9)}`;
               // Retry with clean code
               const { svg } = await mermaid.render(idRetry, cleanCode);
               
               if (mounted) {
                   setSvgContent(svg);
                   setError(null);
               }
               return; // Success on retry
           } catch (retryErr: any) {
               console.error('Mermaid Retry Failed:', retryErr);
           }
        }

        // 2. If Failed (Syntax error or Retry failed), Show Humor Diagram
        if (mounted) {
           console.log('Rendering humor fallback...');
           try {
             mermaid.initialize(STANDARD_CONFIG); // Reset to standard for the simple humor diagram
             const idFallback = `mermaid-fallback-${Math.random().toString(36).substring(2, 9)}`;
             // Use the shared fallback code
             const { svg: fallbackSvg } = await mermaid.render(idFallback, FALLBACK_DIAGRAM_CODE);
             
             setSvgContent(fallbackSvg);
             
             let msg = 'Unable to render diagram.';
             if (errorMessage) {
                 msg = errorMessage.split('\n')[0];
             }
             if (msg.includes('Parse error')) {
                 msg = 'Syntax Error';
             } else if (msg.includes('suitable point')) {
                 msg = 'Complexity Limit';
             }
             setError(msg);
           } catch (fallbackErr) {
             // 3. If even the humor diagram fails (unlikely), show raw error
             setSvgContent('');
             setError('Critical Error');
           }
        }
      } finally {
        if (mounted) {
            setIsRendering(false);
        }
      }
    };

    // Increase debounce to ensure DOM and React are settled
    const timeoutId = setTimeout(renderDiagram, 300);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [code]);

  if (error && !svgContent) {
     return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${className}`}>
            <div className="w-full max-w-md border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="border-b-2 border-black pb-2 mb-2 flex items-center justify-between">
                    <span className="font-bold text-sm uppercase">Render Error</span>
                    <span className="text-xl font-bold">!</span>
                </div>
                <div className="font-mono text-xs mb-4 p-2 bg-gray-100 border border-gray-300 overflow-auto max-h-32">
                  {error}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest text-center">
                    Try simplifying the connections
                </div>
            </div>
        </div>
     );
  }

  return (
    <div 
      ref={containerRef}
      className={`transition-opacity duration-300 w-full flex justify-center ${isRendering ? 'opacity-50' : 'opacity-100'} ${className}`}
    >
      {svgContent ? (
        <div className="flex flex-col items-center w-full">
            <div 
                dangerouslySetInnerHTML={{ __html: svgContent }} 
                className="flex justify-center items-center w-full [&_svg]:max-w-none [&_svg]:h-auto" 
            />
            {error && (
                <div className="mt-4 p-2 border-dashed border-2 border-red-300 bg-red-50 text-red-900 text-[10px] font-mono uppercase tracking-wide text-center">
                    Render failed: {error}
                </div>
            )}
        </div>
      ) : (
        !isRendering && (
            <div className="text-gray-400 italic text-center opacity-50 p-8">
              Diagram will appear here...
            </div>
        )
      )}
    </div>
  );
};