import React, { useEffect, useState, useRef } from 'react';

/**
 * SignalWaveform component that renders two overlapping wave ribbons.
 * The overlap region represents the matching resonance between Resume and Job Description.
 */
function SignalWaveform({ matchPercentage = 0 }) {
  const [phaseOffset, setPhaseOffset] = useState(0);
  const animationRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Animation loop for a subtle wave motion (if motion is allowed)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const animate = () => {
      setPhaseOffset((prev) => (prev + 0.015) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion]);

  // Dimension helpers
  const width = 800;
  const height = 240;
  const centerY = height / 2;
  const waveHeight = 28; // ribbon thickness
  const frequency = 0.022; // wave frequency

  // Calculate coordinates based on match percentage (0 to 100)
  // Higher match = greater width of both signals towards center, and therefore greater overlap area.
  // At 0%:
  // - Resume signal: Left side only (x = 40 to 360)
  // - JD signal: Right side only (x = 440 to 760)
  // - No overlap.
  // At 100%:
  // - Resume signal: Full width (x = 40 to 760)
  // - JD signal: Full width (x = 40 to 760)
  // - Total overlap in the center (x = 40 to 760).
  const minSignalWidth = 320;
  const maxSignalWidth = 720;
  
  // Calculate dynamic signal widths
  const signalWidth = minSignalWidth + (matchPercentage / 100) * (maxSignalWidth - minSignalWidth);
  
  const resumeStart = 40;
  const resumeEnd = resumeStart + signalWidth;
  
  const jdEnd = 760;
  const jdStart = jdEnd - signalWidth;

  // Overlap boundaries
  const hasOverlap = resumeEnd > jdStart;
  const overlapStart = hasOverlap ? jdStart : 0;
  const overlapEnd = hasOverlap ? resumeEnd : 0;

  // Generate a smooth ribbon path
  const generateRibbonPath = (startX, endX, phaseShift, waveAmp = 18) => {
    if (endX <= startX) return '';
    
    const topPoints = [];
    const bottomPoints = [];
    const steps = 120;
    
    for (let i = 0; i <= steps; i++) {
      const x = startX + (i / steps) * (endX - startX);
      
      // Calculate dynamic wave amplitude that tapers at the ends for a premium organic look
      const t = i / steps;
      const taper = Math.sin(t * Math.PI); // 0 at start, 1 in middle, 0 at end
      
      const waveValue = Math.sin(x * frequency + phaseShift);
      
      const yTop = centerY - waveHeight / 2 + waveValue * waveAmp * taper;
      const yBottom = centerY + waveHeight / 2 + waveValue * waveAmp * taper;
      
      topPoints.push(`${x.toFixed(1)},${yTop.toFixed(1)}`);
      bottomPoints.unshift(`${x.toFixed(1)},${yBottom.toFixed(1)}`);
    }
    
    return `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
  };

  // Generate paths
  // Use a slight phase difference between Resume and JD to make their individual signals distinct
  const resumePath = generateRibbonPath(resumeStart, resumeEnd, phaseOffset);
  const jdPath = generateRibbonPath(jdStart, jdEnd, phaseOffset + 1.2);
  
  // Overlap path uses a unified phase to show "Resonance" (the matched signal)
  // We can interpolate the phase for the overlap to be a clean resonance wave
  const overlapPath = hasOverlap 
    ? generateRibbonPath(overlapStart, overlapEnd, phaseOffset + 0.6, 22) 
    : '';

  return (
    <div className="signal-waveform-container" style={{ width: '100%', overflow: 'hidden' }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto" 
        style={{ display: 'block', pointerEvents: 'none' }}
      >
        {/* Subtle grid lines for that oscilloscope/editorial look */}
        <g stroke="var(--color-mist)" strokeWidth="1" opacity="0.6">
          <line x1="40" y1={centerY} x2="760" y2={centerY} strokeDasharray="3 3" />
          <line x1="400" y1="20" x2="400" y2="220" strokeDasharray="3 3" />
          
          {/* Outer framing box */}
          <rect x="40" y="20" width="720" height="200" fill="none" stroke="var(--color-mist)" strokeWidth="1" rx="8" />
        </g>

        {/* Resume Signal Waveform */}
        <path 
          d={resumePath} 
          fill="none" 
          stroke="var(--color-clay)" 
          strokeWidth="1.5" 
          strokeDasharray="4 2"
          opacity="0.35" 
        />
        <path 
          d={resumePath} 
          fill="var(--color-clay)" 
          opacity="0.04" 
        />

        {/* JD Signal Waveform */}
        <path 
          d={jdPath} 
          fill="none" 
          stroke="var(--color-ink)" 
          strokeWidth="1.5" 
          strokeDasharray="4 2"
          opacity="0.25" 
        />
        <path 
          d={jdPath} 
          fill="var(--color-ink)" 
          opacity="0.03" 
        />

        {/* Overlapping Resonant Signal Waveform */}
        {hasOverlap && (
          <>
            {/* Soft backdrop glow for the matched signal */}
            <path 
              d={overlapPath} 
              fill="var(--color-moss)" 
              opacity="0.08" 
              className="pulse-glow"
            />
            {/* The main solid resonant wave */}
            <path 
              d={overlapPath} 
              fill="var(--color-moss)" 
              opacity="0.8" 
              stroke="var(--color-moss)"
              strokeWidth="1"
            />
            {/* Core energy line inside the resonant wave */}
            <path
              d={generateRibbonPath(overlapStart, overlapEnd, phaseOffset + 0.6, 0.5)}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.9"
            />
          </>
        )}

        {/* Signal Source Indicators */}
        <text x="55" y="42" className="label-caps" fill="var(--color-clay)" opacity="0.8" fontSize="10">
          [Resume Signal]
        </text>
        <text x="745" y="42" className="label-caps" fill="var(--color-ink)" opacity="0.6" textAnchor="end" fontSize="10">
          [JD Frequency]
        </text>

        {hasOverlap ? (
          <g>
            <text x="400" y="210" className="label-caps text-data" fill="var(--color-moss)" textAnchor="middle" fontSize="11" fontWeight="600">
              Resonance Overlap: {matchPercentage}%
            </text>
          </g>
        ) : (
          <text x="400" y="210" className="label-caps" fill="var(--color-clay)" textAnchor="middle" fontSize="11">
            No Resonance / 0% Overlap
          </text>
        )}
      </svg>
    </div>
  );
}

export default SignalWaveform;
