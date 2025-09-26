import React from "react";

export const PublicFooter = () => {
  return (
     <footer className="bg-gradient-to-r from-sky-900 to-yellow-900 text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Edube</h3>
          <p className="text-purple-200 mb-4">
            AI-powered learning platform for students and instructors
          </p>
          <div className="border-t border-purple-800 pt-4">
            <p className="text-purple-200">&copy; 2025 Edube. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
