export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Liverollespil App</h1>

      <a href="/login" className="block underline">Login</a>
      <a href="/create-character" className="block underline">Opret karakter</a>
      <a href="/my-characters" className="block underline">Mine karakterer</a>
      <a href="/admin" className="block underline">GM dashboard</a>
    </div>
  )
}