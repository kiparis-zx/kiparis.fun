import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { GitHubProject } from '../hooks/useGitHubProjects';

interface ProjectCardProps {
  project?: GitHubProject;
  isLoading?: boolean;
}

const getLanguageIcon = (lang: string) => {
  const map: Record<string, string> = {
    'JavaScript': 'fa-brands fa-js',
    'TypeScript': 'fa-brands fa-js text-blue-400',
    'C#': 'fa-brands fa-microsoft',
    'Python': 'fa-brands fa-python',
    'HTML': 'fa-brands fa-html5',
    'CSS': 'fa-brands fa-css3-alt',
  };
  return map[lang] || 'fa-solid fa-code';
};

export default function ProjectCard({ project, isLoading }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-surface-2 rounded-xl border border-border overflow-hidden animate-pulse">
        <div className="h-40 bg-surface" />
        <div className="p-5 space-y-4">
          <div className="h-6 bg-surface rounded w-2/3" />
          <div className="space-y-2">
            <div className="h-4 bg-surface rounded w-full" />
            <div className="h-4 bg-surface rounded w-4/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-surface rounded w-16" />
            <div className="h-6 bg-surface rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group h-full bg-surface-2 rounded-xl border border-border overflow-hidden hover:border-accent hover:shadow-[0_0_30px_rgba(124,92,255,0.15)] transition-colors duration-300 flex flex-col relative"
    >
      <div 
        className="h-40 relative overflow-hidden bg-surface flex items-center justify-center border-b border-border transition-colors group-hover:border-accent"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-soft to-transparent opacity-50" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, rgba(124, 92, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(124, 92, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        {project.isPinned && (
          <div className="absolute top-3 left-3 bg-accent text-white text-xs font-mono px-2 py-1 rounded shadow-lg flex items-center gap-1 z-10">
            <span>📌</span> Закреплён
          </div>
        )}

        <i 
          className={`${getLanguageIcon(project.language)} text-6xl text-text-dim group-hover:text-accent group-hover:scale-110 transition-all duration-500 z-10 drop-shadow-xl`} 
          style={{ transform: "translateZ(20px)" }}
        />
      </div>

      <div className="p-5 flex flex-col flex-1" style={{ transform: "translateZ(10px)" }}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-xl text-text group-hover:text-accent transition-colors">
            {project.name}
          </h3>
          <span className="font-mono text-xs text-text-muted mt-1">{project.year}</span>
        </div>
        
        <p className="text-text-muted text-sm mb-6 flex-1 group-hover:text-text transition-colors line-clamp-3">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {project.topics.slice(0, 3).map(topic => (
            <span key={topic} className="px-2 py-1 text-[10px] font-mono text-text bg-surface border border-border rounded group-hover:bg-accent-soft group-hover:border-accent/30 transition-colors">
              {topic}
            </span>
          ))}
          {project.language && (
            <span className="px-2 py-1 text-[10px] font-mono text-text bg-surface border border-border rounded group-hover:bg-accent-soft group-hover:border-accent/30 transition-colors flex items-center gap-1">
              <i className={getLanguageIcon(project.language)} /> {project.language}
            </span>
          )}
        </div>

        <div className="flex gap-3 mt-auto">
          {project.homepage && (
            <a 
              href={project.homepage} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 py-2 text-center text-sm font-medium bg-accent text-white rounded hover:bg-accent-2 transition-colors"
              data-interactive
            >
              Сайт <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-xs" />
            </a>
          )}
          <a 
            href={project.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 py-2 text-center text-sm font-medium border border-border text-text hover:border-text hover:bg-surface rounded transition-all"
            data-interactive
          >
            Код <i className="fa-brands fa-github ml-1 text-xs" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}