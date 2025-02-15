// components/home/Footer.js
export function Footer() {
    return (
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">API</a></li>
              </ul>
            </div>
            {/* Add more footer sections as needed */}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-center">
              © 2025 SalesGPT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }