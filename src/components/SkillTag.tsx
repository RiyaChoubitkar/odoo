
import { cn } from "@/lib/utils";

interface SkillTagProps {
  skill: string;
  variant?: 'offered' | 'wanted' | 'default';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function SkillTag({ 
  skill, 
  variant = 'default', 
  size = 'md', 
  onClick, 
  removable = false, 
  onRemove 
}: SkillTagProps) {
  const variants = {
    offered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    wanted: 'bg-blue-100 text-blue-700 border-blue-200',
    default: 'bg-purple-100 text-purple-700 border-purple-200'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium transition-all duration-200',
        variants[variant],
        sizes[size],
        onClick && 'cursor-pointer hover:scale-105',
        'animate-fade-in'
      )}
      onClick={onClick}
    >
      {skill}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}
