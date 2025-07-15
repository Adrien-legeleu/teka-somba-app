export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Mon Dashboard</h1>
      <p>Bienvenue ! (Tu es connecté et vérifié.)</p>
      <form action="/api/auth/logout" method="POST">
        <button type="submit" className="mt-6 bg-red-500 text-white py-1 px-3">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
