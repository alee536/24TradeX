export function CryptoBackground({ intensity = 1 }: { intensity?: number }) {
  const opacity = Math.min(1, intensity);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,${0.04 * opacity}) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59,130,246,${0.04 * opacity}) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glowing orbs — pure CSS, no JS animation loop */}
      <div
        className="absolute rounded-full"
        style={{
          width: "600px",
          height: "600px",
          top: "-100px",
          right: "5%",
          background: `radial-gradient(circle, rgba(37,99,235,${0.09 * opacity}) 0%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "orb-pulse1 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "500px",
          height: "500px",
          bottom: "-80px",
          left: "5%",
          background: `radial-gradient(circle, rgba(59,130,246,${0.07 * opacity}) 0%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "orb-pulse2 11s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "350px",
          height: "350px",
          top: "40%",
          left: "45%",
          background: `radial-gradient(circle, rgba(99,102,241,${0.05 * opacity}) 0%, transparent 70%)`,
          filter: "blur(30px)",
          animation: "orb-pulse3 14s ease-in-out infinite",
        }}
      />

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes orb-pulse1 {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.8; }
          33%       { transform: scale(1.12) translate(-20px, 30px); opacity: 1; }
          66%       { transform: scale(0.92) translate(15px, -20px); opacity: 0.7; }
        }
        @keyframes orb-pulse2 {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.75; }
          40%       { transform: scale(1.1) translate(25px, -15px); opacity: 1; }
          70%       { transform: scale(0.9) translate(-10px, 25px); opacity: 0.6; }
        }
        @keyframes orb-pulse3 {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.6; }
          50%       { transform: scale(1.2) translate(-15px, -20px); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
