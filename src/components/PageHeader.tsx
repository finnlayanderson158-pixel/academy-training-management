interface Props {
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
}

export default function PageHeader({ title, subtitle, badge, badgeColor = 'bg-emerald-600' }: Props) {
  return (
    <header className="bg-[#0b1220] border-b border-slate-800 text-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-600 flex items-center justify-center font-bold text-lg">
            A
          </div>
          <div>
            <div className="font-semibold leading-tight">{title}</div>
            <div className="text-xs text-slate-400 leading-tight">{subtitle}</div>
          </div>
        </div>

        {badge && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-md text-white ${badgeColor}`}>{badge}</span>
        )}
      </div>
    </header>
  );
}
