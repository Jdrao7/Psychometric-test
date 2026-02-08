/**
 * Reusable role fit display card
 */

import { RoleFitResult } from '@/lib/role-matching';
import { getBadgeClass } from '@/lib/constants';

interface RoleFitCardProps {
    fit: RoleFitResult;
}

export default function RoleFitCard({ fit }: RoleFitCardProps) {
    return (
        <div className="bg-[var(--surface-elevated)] rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[var(--text-primary)] font-medium">
                    {fit.title}
                </h3>
                <span className={`amara-badge ${getBadgeClass(fit.ratingColor)}`}>
                    {fit.rating}
                </span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
                {fit.fitPercentage}%
            </p>
        </div>
    );
}
