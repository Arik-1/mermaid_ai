import React from 'react';

interface WireframeLoaderProps {
  isLoading: boolean;
}

export const WireframeLoader: React.FC<WireframeLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-[2px] flex items-center justify-center cursor-wait transition-all duration-300">
      <div className="bg-white border-[3px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center max-w-sm w-full mx-6 relative">
        
        {/* Decorative corner brackets */}
        <div className="absolute top-2 left-2 w-4 h-1 bg-black"></div>
        <div className="absolute top-2 left-2 w-1 h-4 bg-black"></div>
        
        <div className="absolute top-2 right-2 w-4 h-1 bg-black"></div>
        <div className="absolute top-2 right-2 w-1 h-4 bg-black"></div>

        <div className="absolute bottom-2 left-2 w-4 h-1 bg-black"></div>
        <div className="absolute bottom-2 left-2 w-1 h-4 bg-black"></div>

        <div className="absolute bottom-2 right-2 w-4 h-1 bg-black"></div>
        <div className="absolute bottom-2 right-2 w-1 h-4 bg-black"></div>

        {/* Central Animation: Concentric Squares */}
        <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
           <div className="absolute w-full h-full border-4 border-black animate-[spin_4s_linear_infinite]"></div>
           <div className="absolute w-2/3 h-2/3 border-4 border-black animate-[spin_3s_reverse_infinite]"></div>
           <div className="absolute w-1/3 h-1/3 bg-black animate-pulse"></div>
        </div>

        {/* Status Text */}
        <div className="text-xl font-bold font-mono tracking-widest uppercase mb-4 animate-pulse">
            Processing
        </div>

        {/* Indeterminate Progress Bar */}
        <div className="w-full h-4 border-2 border-black p-[2px] relative overflow-hidden">
            <div className="h-full bg-black w-full origin-left animate-[progress_2s_ease-in-out_infinite]"></div>
        </div>
        
        <div className="mt-2 text-[10px] font-mono text-gray-400 uppercase tracking-wide">
            Please wait...
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(1); }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
    </div>
  );
};
