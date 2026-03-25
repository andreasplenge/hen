const GeometricBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
      {/* Triangle outlines using SVG */}
      <svg className="absolute top-16 left-8 w-40 h-40 rotate-12" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--primary))" strokeWidth="1" />
      </svg>
      
      <svg className="absolute top-32 right-16 w-24 h-24 rotate-[-20deg]" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--accent))" strokeWidth="1" />
      </svg>
      
      <svg className="absolute top-1/4 left-1/3 w-32 h-32 rotate-45" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--primary))" strokeWidth="1" />
      </svg>
      
      <svg className="absolute top-20 right-1/3 w-20 h-20 rotate-[70deg]" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
      </svg>
      
      <svg className="absolute bottom-40 left-16 w-28 h-28 rotate-[-15deg]" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
      </svg>
      
      <svg className="absolute bottom-24 right-24 w-36 h-36 rotate-[30deg]" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--primary))" strokeWidth="1" />
      </svg>
      
      <svg className="absolute bottom-1/3 left-1/4 w-16 h-16 rotate-[120deg]" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--accent))" strokeWidth="1" />
      </svg>
      
      <svg className="absolute top-1/2 right-10 w-20 h-20 rotate-[-45deg]" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--primary))" strokeWidth="1" />
      </svg>
      
      <svg className="absolute bottom-16 left-1/2 w-24 h-24 rotate-[85deg]" viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,90 10,90" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
      </svg>
    </div>
  );
};

export default GeometricBackground;