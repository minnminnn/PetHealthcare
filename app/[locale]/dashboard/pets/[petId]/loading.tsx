export default function PetPassportLoading() {
  return (
    <div className="passport-shell min-h-screen bg-[#efefeb] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] animate-pulse">
        <div className="mb-6 h-5 w-48 rounded bg-black/10" />
        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="h-[500px] rounded-[28px] bg-black/10" />
          <div className="space-y-5">
            <div className="h-52 rounded-[28px] bg-black/10" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 rounded-2xl bg-black/10" />
              ))}
            </div>
            <div className="h-80 rounded-[28px] bg-black/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
