import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Menu latéral */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
            <Link href="/dashboard/particulier" className="block px-4 py-2 rounded-lg hover:bg-orange-50">
              Tableau de bord
            </Link>
            <Link href="/dashboard/particulier/demandes" className="block px-4 py-2 rounded-lg hover:bg-orange-50">
              Mes demandes
            </Link>
            <Link href="/dashboard/particulier/profil" className="block px-4 py-2 rounded-lg hover:bg-orange-50">
              Mon profil
            </Link>
            <hr className="my-2" />
            <Link href="/dashboard/artisan" className="block px-4 py-2 rounded-lg hover:bg-orange-50">
              Espace Artisan
            </Link>
          </nav>
        </aside>

        {/* Contenu */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}