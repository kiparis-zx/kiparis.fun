import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  toggleTheme: () => void;
}

export default function CommandPalette({ toggleTheme }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = [
    { id: 'about', label: 'Go to About', action: () => document.getElementById('about')?.scrollIntoView() },
    { id: 'projects', label: 'Go to Projects', action: () => document.getElementById('projects')?.scrollIntoView() },
    { id: 'contact', label: 'Go to Contact', action: () => document.getElementById('contact')?.scrollIntoView() },
    { id: 'theme', label: 'Toggle theme', action: toggleTheme },
    { id: 'github', label: 'Open GitHub', action: () => window.open('https://github.com/kiparis-zx', '_blank') },
    { id: 'telegram', label: 'Open Telegram', action: () => window.open('https://t.me/ciskwn', '_blank') },
    { id: 'steam', label: 'Open Steam', action: () => window.open('https://steamcommunity.com/id/kiparis-/', '_blank') },
  ];

  const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
          setOpen(false);
          setQuery('');
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, filteredCommands, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[9990]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-xl bg-surface-2 border border-border-strong rounded-lg shadow-2xl overflow-hidden z-[9991]"
          >
            <div className="flex items-center px-4 py-3 border-b border-border">
              <span className="text-accent mr-3 font-mono">{'>'}</span>
              <input
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-text font-mono text-sm placeholder-text-muted"
                placeholder="Type a command..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-text-muted font-mono text-sm">
                  No commands found.
                </div>
              ) : (
                filteredCommands.map((command, i) => (
                  <div
                    key={command.id}
                    className={`px-4 py-3 rounded text-sm font-mono cursor-pointer flex justify-between items-center transition-colors ${
                      i === activeIndex ? 'bg-accent-soft text-accent' : 'text-text-muted hover:text-text hover:bg-surface'
                    }`}
                    onClick={() => {
                      command.action();
                      setOpen(false);
                      setQuery('');
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span>{command.label}</span>
                    {i === activeIndex && <span className="text-xs opacity-50">↵</span>}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}