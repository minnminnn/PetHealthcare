export default function OwnerDashboardLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#efefeb] dark:bg-[#151614]">
      <div className="mx-auto max-w-7xl animate-pulse px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="h-5 w-36 rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-6 h-16 max-w-2xl rounded-xl bg-black/10 dark:bg-white/10 sm:h-20" />
        <div className="mt-5 h-6 max-w-xl rounded bg-black/[0.07] dark:bg-white/[0.07]" />

        <div className="mt-10 overflow-hidden rounded-2xl bg-[#20211f] p-6 dark:bg-[#242523] sm:p-9">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="h-6 w-6 rounded bg-white/10" />
              <div className="mt-8 h-9 w-56 rounded bg-white/10" />
              <div className="mt-4 h-5 max-w-sm rounded bg-white/[0.07]" />
            </div>
            <div className="h-44 rounded-2xl bg-white/[0.055]" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-80 rounded-2xl bg-black/[0.07] dark:bg-white/[0.07] lg:col-span-8" />
          <div className="h-80 rounded-2xl bg-black/[0.07] dark:bg-white/[0.07] lg:col-span-4" />
        </div>
      </div>
    </div>
  );
}
