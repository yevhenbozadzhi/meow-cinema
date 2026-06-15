export default function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-white/10">
      <div className="container mx-auto px-4 py-6">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MeowFilms. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
