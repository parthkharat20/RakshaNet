import React from 'react';
import { ROLE_COLORS, ROLE_LABELS } from '../../utils/constants';

export const RoleBadge = ({ role = 'CLEAN', size = 'sm' }) => {
  const color = ROLE_COLORS[role] || ROLE_COLORS.CLEAN;
  const label = ROLE_LABELS[role] || role;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border ${
        isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: `${color}1A`, // 10% opacity
        borderColor: `${color}4D`,     // 30% opacity
        color: color
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
};
