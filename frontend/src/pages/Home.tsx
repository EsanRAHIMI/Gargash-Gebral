// /frontend/src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Gargash AI Hackathon
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Welcome to our AI-powered chat application
            </p>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              Experience the power of artificial intelligence through natural conversations.
              Our advanced AI chat platform provides intelligent responses to your questions and assists with various tasks.
            </p>
            <div className="mt-8 flex justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="mx-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/chat"
                    className="mx-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Start Chatting
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="mx-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="mx-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home