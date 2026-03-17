import { motion } from 'framer-motion';
import { BadgeCheck, ShieldCheck, CheckCircle } from 'lucide-react';

/**
 * VerifiedBadge Component
 * Displays a verification badge next to user names
 * 
 * @param {Object} props
 * @param {string} props.type - Type of badge: 'email', 'verified', 'premium'
 * @param {string} props.size - Size of the badge: 'sm', 'md', 'lg'
 * @param {boolean} props.showTooltip - Whether to show tooltip on hover
 * @param {string} props.className - Additional classes
 */
export default function VerifiedBadge({ 
  type = 'email', 
  size = 'sm', 
  showTooltip = true,
  className = '' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const badgeConfig = {
    email: {
      icon: CheckCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      tooltip: 'Email Verified',
    },
    verified: {
      icon: BadgeCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      tooltip: 'Verified User',
    },
    premium: {
      icon: ShieldCheck,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      tooltip: 'Premium Member',
    },
  };

  const config = badgeConfig[type] || badgeConfig.email;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={`relative inline-flex items-center justify-center group ${className}`}
      title={showTooltip ? config.tooltip : undefined}
    >
      <Icon className={`${sizeClasses[size]} ${config.color} drop-shadow-sm`} />
      
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {config.tooltip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
        </span>
      )}
    </motion.div>
  );
}

/**
 * UserNameWithBadge Component
 * Displays a username with verification badge if applicable
 */
export function UserNameWithBadge({ 
  name, 
  isEmailVerified = false, 
  isVerified = false, 
  isPremium = false,
  className = '',
  nameClassName = '',
  size = 'sm',
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={nameClassName}>{name}</span>
      {isEmailVerified && <VerifiedBadge type="email" size={size} />}
      {isVerified && <VerifiedBadge type="verified" size={size} />}
      {isPremium && <VerifiedBadge type="premium" size={size} />}
    </span>
  );
}
