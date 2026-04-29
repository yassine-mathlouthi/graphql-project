const STAR_FIELD = [
  { x: 8, y: 18, size: 4, delay: 0.2, duration: 5.8 },
  { x: 14, y: 62, size: 3, delay: 1.8, duration: 6.5 },
  { x: 21, y: 34, size: 2, delay: 0.7, duration: 4.9 },
  { x: 29, y: 14, size: 3, delay: 2.3, duration: 7.2 },
  { x: 33, y: 72, size: 4, delay: 1.1, duration: 6.9 },
  { x: 41, y: 48, size: 2, delay: 0.4, duration: 5.4 },
  { x: 47, y: 22, size: 5, delay: 2.1, duration: 7.5 },
  { x: 53, y: 64, size: 3, delay: 0.8, duration: 5.7 },
  { x: 58, y: 38, size: 2, delay: 1.5, duration: 4.8 },
  { x: 66, y: 16, size: 4, delay: 0.1, duration: 6.8 },
  { x: 71, y: 56, size: 3, delay: 2.5, duration: 7.1 },
  { x: 76, y: 29, size: 2, delay: 0.9, duration: 5.2 },
  { x: 82, y: 68, size: 4, delay: 1.7, duration: 6.4 },
  { x: 87, y: 41, size: 3, delay: 0.5, duration: 5.6 },
  { x: 91, y: 19, size: 2, delay: 2.2, duration: 6.3 },
  { x: 94, y: 76, size: 4, delay: 1.3, duration: 7.4 },
];

export default function BackgroundFX() {
  return (
    <div className="atlas-background-fx" aria-hidden="true">
      <div className="atlas-background-base" />
      <div className="atlas-background-grid" />
      <div className="atlas-background-beam atlas-background-beam-cyan" />
      <div className="atlas-background-beam atlas-background-beam-pink" />
      <div className="atlas-background-spotlight atlas-background-spotlight-one" />
      <div className="atlas-background-spotlight atlas-background-spotlight-two" />
      <div className="atlas-background-orb atlas-background-orb-left" />
      <div className="atlas-background-orb atlas-background-orb-right" />
      <div className="atlas-background-stars">
        {STAR_FIELD.map((star, index) => (
          <span
            key={index}
            className="atlas-background-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="atlas-background-vignette" />
    </div>
  );
}
