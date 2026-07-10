import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface JapiProfile {
  bannerURL?: string;
  avatar_decoration_data?: { asset: string; animated?: boolean } | null;
  public_flags_array?: string[];
}

interface DiscordWidgetProps {
  lanyard: any;
  loading: boolean;
}

export default function DiscordWidget({ lanyard, loading }: DiscordWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [japiProfile, setJapiProfile] = useState<JapiProfile | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Fetch banner + avatar decoration from japi.rest
  useEffect(() => {
    const USER_ID = '594485816408014848';
    fetch(`https://japi.rest/discord/v1/user/${USER_ID}`)
      .then(r => r.ok ? r.json() : null)
      .then((json: { data?: JapiProfile } | null) => {
        if (json?.data) setJapiProfile(json.data);
      })
      .catch(() => { /* silently ignore */ });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const handleCopyClick = () => {
    navigator.clipboard.writeText('.kiparis_');
    setCopied(true);
    setTimeout(() => {
      window.open('https://discord.com/users/594485816408014848', '_blank');
      setTimeout(() => setCopied(false), 2000);
    }, 800);
  };

  if (loading || !lanyard) {
    return (
      <div className="w-full max-w-[360px] mx-auto h-[400px] bg-surface rounded-xl border border-border animate-pulse flex items-center justify-center">
        <span className="font-mono text-text-muted text-sm">CONNECTING TO LANYARD...</span>
      </div>
    );
  }

  const user = lanyard.discord_user;
  const statusColors: Record<string, string> = {
    online: '#23a55a',
    idle: '#f0b232',
    dnd: '#f23f43',
    offline: '#747f8d',
  };
  const statusColor = statusColors[lanyard.discord_status as string] ?? statusColors.offline;

  const avatarExt = user.avatar?.startsWith('a_') ? 'gif' : 'png';
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExt}?size=128`
    : `https://github.com/kiparis-zx.png`;

  // Avatar decoration: prefer Lanyard data, fall back to japi
  const decorationAsset =
    lanyard.discord_user?.avatar_decoration_data?.asset ??
    japiProfile?.avatar_decoration_data?.asset ?? null;
  const decorationUrl = decorationAsset
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${decorationAsset}.png?size=160&passthrough=true`
    : null;

  // Banner: from japi.rest
  const bannerUrl = japiProfile?.bannerURL
    ? (japiProfile.bannerURL.includes('?')
        ? `${japiProfile.bannerURL}&size=600`
        : `${japiProfile.bannerURL}?size=600`)
    : null;

  const customStatus = lanyard.activities?.find((a: any) => a.type === 4);
  const gameActivity = lanyard.activities?.find((a: any) => a.type === 0);
  const spotify = lanyard.spotify;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="w-full max-w-[360px] mx-auto bg-surface-2 rounded-xl border border-border-strong overflow-hidden shadow-2xl"
    >
      {/* Banner */}
      <div className="h-[90px] w-full relative overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-accent to-accent-2" />
        )}
      </div>

      {/* Profile Header */}
      <div className="px-4 pb-4 relative" style={{ transform: "translateZ(30px)" }}>
        {/* Avatar */}
        <div className="absolute -top-10 left-4">
          <div className="relative rounded-full p-[4px] bg-surface-2" style={{ width: 80, height: 80 }}>
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full rounded-full object-cover bg-surface"
            />
            {/* Avatar decoration overlay */}
            {decorationUrl && (
              <img
                src={decorationUrl}
                alt=""
                className="absolute inset-0 w-[110%] h-[110%] -translate-x-[5%] -translate-y-[5%] pointer-events-none"
                style={{ zIndex: 3 }}
              />
            )}
            {/* Status dot */}
            <div
              className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-[3px] border-surface-2"
              style={{ backgroundColor: statusColor, zIndex: 4 }}
            />
          </div>
        </div>

        {/* Badges */}
        <div className="flex justify-end pt-3 pb-2 gap-1 h-12">
          <div className="bg-surface p-1 rounded" title="Active Developer">
            <img
              src="https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png"
              alt="Active Developer"
              className="w-5 h-5"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className="bg-surface p-1 rounded" title="Discord Subscriber">
            <img
              src="https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png"
              alt="Discord"
              className="w-5 h-5"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Name Info */}
        <div className="bg-surface p-3 rounded-lg border border-border mt-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-bold text-text">
              {user.global_name ?? user.display_name ?? user.username}
            </h3>
            <span className="text-sm text-text-muted font-mono">
              {user.discriminator && user.discriminator !== '0'
                ? `${user.username}#${user.discriminator}`
                : `@${user.username}`}
            </span>
          </div>

          {customStatus && (
            <div className="mt-2 text-sm text-text flex items-center gap-2">
              {customStatus.emoji?.id ? (
                <img
                  src={`https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? 'gif' : 'png'}?size=44`}
                  alt=""
                  className="w-4 h-4"
                />
              ) : customStatus.emoji?.name ? (
                <span>{customStatus.emoji.name}</span>
              ) : null}
              <span className="text-text-muted">{customStatus.state}</span>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-border my-4" />

        {/* About Me */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">Обо мне</h4>
          <p className="text-sm text-text-muted leading-relaxed">
            не понимаю почему гугл у меня спрашивает пол и там какой то мужской и женский, у меня пол ламинат
          </p>
        </div>

        {/* Activity */}
        {(spotify || gameActivity) && (
          <div className="mb-4">
            <h4 className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">
              {spotify ? 'Слушает Spotify' : 'Играет в'}
            </h4>
            <div className="flex items-center gap-3">
              {spotify ? (
                <img src={spotify.album_art_url} alt="album" className="w-12 h-12 rounded-md flex-shrink-0" />
              ) : gameActivity?.assets?.large_image ? (
                (() => {
                  const img = gameActivity.assets.large_image;
                  const src = img.startsWith('mp:external/')
                    ? `https://${img.split('/https/')[1]}`
                    : `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${img}.png`;
                  return <img src={src} alt="game" className="w-12 h-12 rounded-md flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
                })()
              ) : (
                <div className="w-12 h-12 rounded-md bg-surface flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-gamepad text-text-muted" />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold text-text truncate">
                  {spotify ? spotify.song : gameActivity?.name}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {spotify ? `от ${spotify.artist}` : gameActivity?.details}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {spotify ? `${spotify.album}` : gameActivity?.state}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleCopyClick}
          className="w-full py-2.5 bg-[#5865f2] hover:bg-[#4752c4] active:scale-[0.98] transition-all text-white font-medium rounded text-sm flex items-center justify-center gap-2"
          data-interactive
        >
          {copied ? (
            <><i className="fa-solid fa-check" /> Скопировано!</>
          ) : (
            <><i className="fa-brands fa-discord" /> Скопировать ник &amp; Написать</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
