import React, { useState } from "react";
import { PublicNavigate } from "./PublicNavigate";
import {
  ArrowRight,
  Users,
  GraduationCap,
  Brain,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "antd";

export const HomePage = () => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);

  const steps = [
    {
      number: "01",
      title: "Sign Up & Choose Your Path",
      description:
        "Create your account and select whether you're a student looking to learn or an mentor ready to teach.",
    },
    {
      number: "02",
      title: "Access Learning Materials",
      description:
        "mentors upload courses and materials. Students browse our extensive library of AI-powered courses.",
    },
    {
      number: "03",
      title: "Learn with AI Assistance",
      description:
        "Get personalized learning paths, instant feedback, and adaptive quizzes tailored to your progress.",
    },
  ];

  const handleCloseSignInSignUp = () => {
    setOpenSignIn(false);
    setOpenSignUp(false);
  };

  return (
    <div>
      <PublicNavigate
        openSignIn={openSignIn}
        openSignUp={openSignUp}
        onCloseSignInSignUp={handleCloseSignInSignUp}
      />
      {/* Hero Section */}
      <section id="platform" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 via-sky-800 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div> */}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-sky-300 to-amber-300 bg-clip-text text-transparent">
                Learning Journey
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-sky-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join students and educators using Edube's platform to achieve
              exceptional learning outcomes
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                  For Students
                </h3>
                <p className="text-sky-100 text-sm">
                  Personalized learning paths
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                  For mentors
                </h3>
                <p className="text-sky-100 text-sm">
                  Advanced content creation tools
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                  For Everyone
                </h3>
                <p className="text-sky-100 text-sm">
                  24/7 access to premium resources
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setOpenSignUp(true)}
                className="cursor-pointer bg-gradient-to-r from-sky-600 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-sky-700 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-sky-600 bg-clip-text text-transparent mb-4">
              Why Choose Edube?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of education with our comprehensive platform
              designed for modern learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-sky-50 to-amber-50 border border-sky-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-600 to-amber-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                AI-Powered Learning
              </h3>
              <p className="text-gray-600 mb-4">
                Personalized study paths and intelligent recommendations
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Adaptive learning algorithms</li>
                <li>• Smart content suggestions</li>
                <li>• Progress optimization</li>
              </ul>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-sky-50 to-amber-50 border border-sky-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-600 to-amber-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Always Available
              </h3>
              <p className="text-gray-600 mb-4">
                Learn anytime, anywhere with 24/7 platform access
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Interface friendly design</li>
                <li>• Offline content access</li>
                <li>• Cross-device sync</li>
              </ul>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-sky-50 to-amber-50 border border-sky-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-600 to-amber-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Unlimited Access
              </h3>
              <p className="text-gray-600 mb-4">
                Access many of courses and learning materials
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Many premium courses</li>
                <li>• Expert-created content</li>
                <li>• Regular updates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-sky-600 bg-clip-text text-transparent mb-4">
              How Edube Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with AI-powered learning in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-sky-600 to-amber-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6 shadow-md">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sky-900 via-amber-900 to-sky-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-sky-100 mb-12 max-w-2xl mx-auto">
              Join thousands of learners who are already experiencing
              personalized, AI-powered education.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <Users className="w-12 h-12 text-sky-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  For Students
                </h3>
                <ul className="text-sky-100 space-y-2 mb-6">
                  <li>• Personalized learning paths</li>
                  <li>• 24/7 AI tutoring support</li>
                  <li>• Adaptive quiz system</li>
                  <li>• Progress tracking</li>
                </ul>
                <button
                  onClick={() => setOpenSignUp(true)}
                  className="cursor-pointer w-full bg-gradient-to-r from-sky-600 to-sky-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-sky-700 hover:to-sky-800 transition-all duration-300 transform hover:scale-105"
                >
                  Start Learning
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <GraduationCap className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  For mentors
                </h3>
                <ul className="text-amber-100 space-y-2 mb-6">
                  <li>• AI-powered course creation</li>
                  <li>• Student analytics dashboard</li>
                  <li>• Automated grading system</li>
                  <li>• Content optimization tools</li>
                </ul>
                <button
                  onClick={() => setOpenSignUp(true)}
                  className="cursor-pointer w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105"
                >
                  Create Your Course
                </button>
              </div>
            </div>

            {/* <button
              onClick={() => setOpenSignIn(true)}
              className="cursor-pointer bg-white text-purple-900 font-bold py-4 px-8 rounded-xl hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2 text-lg"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </button> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
