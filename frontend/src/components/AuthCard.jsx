export default function AuthCard({ title, subtitle, children, maxWidthClass = "max-w-md" }) {
  return (
    <div className="flex min-h-screen items-start justify-center overflow-y-auto bg-stone-100 px-4 py-8 sm:items-center sm:px-6 sm:py-10">
      <div className={`w-full ${maxWidthClass} rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8`}>
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-base font-bold text-white">
            D
          </span>
          <span className="text-lg font-bold tracking-tight text-stone-900">DUMarket</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
