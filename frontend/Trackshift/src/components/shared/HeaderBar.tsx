interface HeaderBarProps {
  left: React.ReactNode;
  right?: React.ReactNode;
}

export default function HeaderBar({ left, right }: HeaderBarProps) {
  return (
    <header
      className="flex items-center justify-between h-11 px-4 sm:px-6 border-b flex-shrink-0 relative z-10"
      style={{
        background: 'linear-gradient(180deg, #181818 0%, #141414 100%)',
        borderBottom: '1px solid #3A3A3A',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#F5F5F5] truncate">
        {left}
      </div>
      {right && (
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold tracking-[0.18em] uppercase text-[#CFCFCF]">
          {right}
        </div>
      )}
    </header>
  );
}