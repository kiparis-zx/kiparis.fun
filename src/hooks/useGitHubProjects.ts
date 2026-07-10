import { useState, useEffect } from 'react';

export interface GitHubProject {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  language: string;
  topics: string[];
  updated_at: string;
  stargazers_count: number;
  fork: boolean;
  isPinned?: boolean;
  year?: string;
}

export function useGitHubProjects() {
  const [projects, setProjects] = useState<GitHubProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        const [userRes, orgRes] = await Promise.all([
          fetch('https://api.github.com/users/kiparis-zx/repos?per_page=100'),
          fetch('https://api.github.com/orgs/Corrupted-Code/repos?per_page=100')
        ]);
        
        let repos: any[] = [];
        if (userRes.ok) repos = [...repos, ...(await userRes.json())];
        if (orgRes.ok) repos = [...repos, ...(await orgRes.json())];

        const excluded = ['osu-cbmsd', 'commit'];
        
        let filtered: GitHubProject[] = repos
          .filter(r => !r.fork && !excluded.includes(r.name.toLowerCase()))
          .map(r => ({
            id: r.id,
            name: r.name,
            description: r.description || '',
            html_url: r.html_url,
            homepage: r.name === 'Fishing_Bot_N2E' ? 'https://fishingbot.prvkey.ru/' : r.homepage,
            language: r.language || 'Unknown',
            topics: r.topics || [],
            updated_at: r.updated_at,
            stargazers_count: r.stargazers_count,
            fork: r.fork,
            year: new Date(r.created_at).getFullYear().toString()
          }));

        // Deduplicate
        const unique = Array.from(new Map(filtered.map(r => [r.name, r])).values());
        
        unique.sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        const pinnedName = "NoxVeil Client";
        const others = unique.filter(r => r.name !== pinnedName).slice(0, 5);

        const pinnedProject: GitHubProject = {
          id: 999999,
          name: "NoxVeil Client",
          year: "2026",
          description: "Кроссплатформенный лаунчер для Minecraft. Быстрый, чистый, умный.",
          language: "JavaScript",
          topics: ["Launcher", "Minecraft", "Electron"],
          html_url: "https://noxveil.prvkey.ru/",
          homepage: "https://noxveil.prvkey.ru/",
          stargazers_count: 0,
          updated_at: new Date().toISOString(),
          fork: false,
          isPinned: true
        };

        if (isMounted) {
          setProjects([pinnedProject, ...others]);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error fetching github projects', e);
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();

    return () => { isMounted = false; };
  }, []);

  return { projects, loading };
}