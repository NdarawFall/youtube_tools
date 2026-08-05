export default function MobileRestrictedPage() {
  return (
    <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center p-6 text-center text-slate-200">
      <div className="text-6xl mb-6">🖥️</div>
      <h1 className="text-3xl font-bold mb-4 text-white">Site optimisé pour Ordinateur</h1>
      <p className="text-slate-400 max-w-sm">
        Pour une expérience optimale de CreatorStudio, veuillez ouvrir ce site sur un ordinateur ou une tablette.
      </p>
    </div>
  );
}
