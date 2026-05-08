import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex flex-col items-center justify-center p-4 text-white font-sans">
      
      {/* Chenarul central cu efect de sticlă */}
      <div className="text-center bg-white/20 p-10 rounded-3xl backdrop-blur-md shadow-2xl max-w-md w-full">
        
        {/* Un emoji mare pe post de logo */}
        <div className="text-7xl mb-6 drop-shadow-md">🚲</div>
        
        <h1 className="text-4xl font-extrabold mb-4 drop-shadow-md">
          Cluj Bike Explorer
        </h1>
        
        <p className="text-lg mb-10 opacity-90 font-medium">
          Găsește cea mai apropiată stație și pedalează liber prin oraș!
        </p>
        
        {/* Butonul care ne duce la pagina /harta */}
        <Link 
          href="/harta" 
          className="inline-block bg-white text-green-600 font-extrabold text-xl py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
        >
          🗺️ Deschide Harta
        </Link>
        
      </div>

    </main>
  );
}