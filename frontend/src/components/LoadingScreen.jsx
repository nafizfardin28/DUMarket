export default function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
          D
        </span>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-200">
          <div className="h-full w-1/3 animate-[loading_1.1s_ease-in-out_infinite] rounded-full bg-brand-500" />
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
