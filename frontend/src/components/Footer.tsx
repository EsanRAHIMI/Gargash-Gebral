// /frontend/src/components/Footer.tsx
const Footer = () => {
    return (
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-6 flex justify-between">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Gargash AI Hackathon. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  
  export default Footer