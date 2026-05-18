import { Facebook, Github, Instagram, MessageCircle, Newspaper, Send, Twitter, Youtube, Disc, MessagesSquare, Globe } from "lucide-react";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/24tradex", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/24tradex/", icon: Instagram },
  { label: "Twitter", href: "https://x.com/24tradex16158", icon: Twitter },
  { label: "Telegram", href: "https://t.me/24tradex", icon: Send },
  { label: "WhatsApp", href: "https://wa.me/0000000000", icon: MessageCircle },
  { label: "TikTok", href: "https://www.tiktok.com/@24tradex?lang=en", icon: Disc },
  { label: "Discord", href: "https://discord.gg/3c5hc84P", icon: MessagesSquare },
  { label: "Reddit", href: "https://www.reddit.com/user/24tradex/", icon: Globe },
  { label: "GitHub", href: "https://github.com/24tradex", icon: Github },
  { label: "YouTube", href: "https://www.youtube.com/@24Tradex", icon: Youtube },
  { label: "Medium", href: "https://medium.com/@24tradexinfo", icon: Newspaper },
];

export function SocialLinks() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {socialLinks.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/15 bg-white/3 text-gray-400 transition-colors hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}