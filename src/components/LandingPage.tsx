import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Heart, Clock, Users, Star, ChevronRight, ArrowUpRight, Search, Shield, Brain } from 'lucide-react';
import LightRays from './LightRays';
import './CardNav.css';
import ProfessorImage from "../assets/images/professor.jpg";

// CardNav Component

interface LandingPageProps {
  onGetStarted?: () => void;
}
type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

interface CardNavProps {
  logo: React.ReactNode;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  onGetStarted?: () => void;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#fff',
  menuColor,
  buttonBgColor,
  buttonTextColor,
  onGetStarted
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        void contentEl.offsetHeight; // Force reflow

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight(),
      duration: 0.4,
      ease
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#000' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            {logo}
          </div>

         <button
  type="button"
  className="card-nav-cta-button"
  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
  onClick={onGetStarted}
>
  Get Started
</button>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <a key={`${lnk.label}-${i}`} className="nav-card-link" href={lnk.href} aria-label={lnk.ariaLabel}>
                    <ArrowUpRight className="nav-card-link-icon w-4 h-4" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

// Recipe Card Component
interface RecipeCardProps {
  title: string;
  description: string;
  cookTime: string;
  servings: number;
  rating: number;
  verified: boolean;
  image: string;
  tags: string[];
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  description,
  cookTime,
  servings,
  rating,
  verified,
  image,
  tags
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%"
          }
        }
      );
    }
  }, []);

  return (
    <div ref={cardRef} className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {verified && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-20">
            AICR Verified
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-4">{description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{rating}/5</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
          View Recipe
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Landing Page Component
const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const navItems: CardNavItem[] = [
    {
      label: "Resources",
      bgColor: "#1e3a8a",
      textColor: "#fff",
      links: [
        { label: "Recipe Database", href: "#recipes", ariaLabel: "View Recipe Database" },
        { label: "Meal Plans", href: "#meals", ariaLabel: "Browse Meal Plans" },
        { label: "Nutrition Guide", href: "#guide", ariaLabel: "Read Nutrition Guide" }
      ]
    },
    {
      label: "Research", 
      bgColor: "#1e40af",
      textColor: "#fff",
      links: [
        { label: "Publications", href: "#publications", ariaLabel: "Research Publications" },
        { label: "Clinical Trials", href: "#trials", ariaLabel: "View Clinical Trials" },
        { label: "Partners", href: "#partners", ariaLabel: "Research Partners" }
      ]
    },
    {
      label: "Support",
      bgColor: "#2563eb", 
      textColor: "#fff",
      links: [
        { label: "Patient Stories", href: "#stories", ariaLabel: "Read Patient Stories" },
        { label: "Community", href: "#community", ariaLabel: "Join Community" },
        { label: "Contact Team", href: "#contact", ariaLabel: "Contact Research Team" }
      ]
    }
  ];

  const recipes: RecipeCardProps[] = [
    {
      title: "Anti-Inflammatory Turmeric Bowl",
      description: "Packed with cancer-fighting compounds and gentle on the digestive system",
      cookTime: "25 min",
      servings: 2,
      rating: 4.8,
      verified: true,
      image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400&h=300&fit=crop",
      tags: ["Anti-inflammatory", "Easy to digest", "High protein"]
    },
    {
      title: "Ginger Miso Soup",
      description: "Soothing and hydrating soup perfect for managing nausea during treatment",
      cookTime: "15 min",
      servings: 4,
      rating: 4.9,
      verified: true,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      tags: ["Nausea relief", "Hydrating", "Low fat"]
    },
    {
      title: "Berry Antioxidant Smoothie",
      description: "Rich in antioxidants and easy to consume when appetite is low",
      cookTime: "5 min",
      servings: 1,
      rating: 4.7,
      verified: true,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      tags: ["Antioxidant-rich", "Quick", "High calorie"]
    }
  ];

  const features = [
    {
      icon: <Search className="w-6 h-6 text-white" />,
      title: "AI-Powered Recipe Search",
      description: "Find recipes tailored to your treatment phase and dietary needs"
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "AICR Verified",
      description: "All recipes reviewed and approved by cancer nutrition experts"
    },
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      title: "Smart Recommendations",
      description: "Personalized meal suggestions based on your health profile"
    },
    {
      icon: <Heart className="w-6 h-6 text-white" />,
      title: "Compassionate Care",
      description: "Designed with empathy for the cancer journey"
    }
  ];

  const testimonials = [
    {
      quote: "NutriThrive helped me maintain my strength during chemotherapy. The personalized recipes made eating enjoyable again.",
      author: "Sarah M.",
      role: "Breast Cancer Survivor"
    },
    {
      quote: "The AI recommendations adapted perfectly to my changing needs throughout treatment. It felt like having a nutritionist by my side.",
      author: "David L.",
      role: "Lymphoma Patient"
    },
    {
      quote: "Finding recipes that worked with my side effects was life-changing. This platform gave me hope and control.",
      author: "Maria K.",
      role: "Colon Cancer Survivor"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);
  

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Light Rays Effect */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#3b82f6"
          raysSpeed={0.3}
          lightSpread={0.8}
          rayLength={1.5}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.02}
          distortion={0.02}
          fadeDistance={0.9}
          saturation={0.7}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Navigation */}
        <CardNav
          logo={
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold">NutriThrive</span>
            </div>
          }
          items={navItems}
          baseColor="rgba(255, 255, 255, 0.1)"
          menuColor="#fff"
          buttonBgColor="#3b82f6"
          buttonTextColor="#fff"
           onGetStarted={onGetStarted} 
        />

        {/* Hero Section */}
        <section className="px-6 py-32 md:px-12 lg:px-20 text-center mt-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Nourish Your Body
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                During Your Journey
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              AI-powered nutrition guidance with AICR-verified recipes designed specifically for cancer patients
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button 
  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
  onClick={onGetStarted}
>
  Explore Recipes
  <ChevronRight className="w-5 h-5" />
</button>
              <button className="border-2 border-blue-600 text-blue-400 hover:bg-blue-600/10 px-8 py-4 rounded-full font-bold text-lg transition-all">
                Learn About Research
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                How We Support Your
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Nutrition Journey</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 hover:border-blue-600/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
{/* Professor Section */}
<section className="px-6 py-20 md:px-12 lg:px-20 relative">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold mb-4">
        Developed with
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Leading Research</span>
      </h2>
      <p className="text-xl text-gray-300 max-w-2xl mx-auto">
        NutriThrive is guided by acclaimed cancer nutrition research from the University of Illinois
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Professor Image */}
      <div className="relative">
        <div className="relative z-10 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition-all duration-300"></div>
          <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden z-20 bg-gray-800">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10"></div>
            <img 
              src={ProfessorImage} 
              alt="Dr. Jean Miki Reading" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-6 left-6 z-20">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold">
                Principal Investigator
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Professor Details */}
      <div className="space-y-6">
        <div>
          <h3 className="text-3xl font-bold text-white">Jean Miki Reading, PhD</h3>
          <p className="text-blue-400 text-lg mt-1">Assistant Professor</p>
          <p className="text-gray-400 mt-2">Department of Family and Community Medicine</p>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm bg-blue-900/30 px-3 py-1.5 rounded-full">
              <span className="text-blue-400">Pronouns:</span>
              <span className="text-gray-300">She/her</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-blue-900/30 px-3 py-1.5 rounded-full">
              <span className="text-blue-400">Email:</span>
              <span className="text-gray-300">jreading@uic.edu</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
          <h4 className="text-xl font-semibold text-white mb-3">Research Focus</h4>
          <p className="text-gray-300">
            Dr. Reading is a social and behavioral scientist specializing in cancer prevention and control. 
            Her work focuses on developing digital health interventions addressing diet, physical activity, 
            and weight control for diverse populations across the lifespan.
          </p>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
          <h4 className="text-xl font-semibold text-white mb-3">Current Research</h4>
          <p className="text-gray-300">
            Recipient of an NCI Clinical Research Loan Repayment Award to develop a multilevel lifestyle 
            intervention for cancer survivors to improve reach, access, and engagement with diet and 
            physical activity.
          </p>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
          <h4 className="text-xl font-semibold text-white mb-3">Research Interests</h4>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2.5 flex-shrink-0"></div>
              <span>Optimizing multilevel lifestyle interventions for behavioral obesity treatment and cancer survivorship</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2.5 flex-shrink-0"></div>
              <span>Identifying strategies to reach and engage underrepresented populations in clinical trials</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2.5 flex-shrink-0"></div>
              <span>Applying mixed method approaches to implement digital lifestyle interventions into clinical care</span>
            </li>
          </ul>
        </div>
        
        <div className="pt-4">
          <a 
            href="https://chicago.medicine.uic.edu/family-community-medicine/fcm-research/labs/vitality-lab/" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
          >
            Learn more about our research
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

        {/* Featured Recipes Section */}
        <section id="recipes" className="px-6 py-20 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                AICR-Verified Recipes for
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Your Health</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Every recipe is carefully crafted and verified by the American Institute for Cancer Research
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe, index) => (
                <RecipeCard key={index} {...recipe} />
              ))}
            </div>

            <div className="text-center mt-12">
              <button 
  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all inline-flex items-center gap-2"
  onClick={onGetStarted}
>
  View All Recipes
  <ChevronRight className="w-5 h-5" />
</button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-6 py-20 md:px-12 lg:px-20 bg-white/5 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Stories of Hope and Healing</h2>
            
            <div className="relative h-48">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === activeTestimonial ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <blockquote className="text-xl text-gray-300 italic mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="text-blue-400">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial ? 'bg-blue-400 w-8' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 md:px-12 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Start Your Journey to
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Better Nutrition</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands who have found hope and healing through proper nutrition
            </p>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-400">100+</div>
                  <p className="text-gray-300">Verified Recipes</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-400">0</div>
                  <p className="text-gray-300">Patients Helped</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-400">95%</div>
                  <p className="text-gray-300">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 md:px-12 lg:px-20 border-t border-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-blue-400" />
                  <span className="text-xl font-bold">NutriThrive</span>
                </div>
                <p className="text-gray-400 text-sm">
                  A non-profit initiative dedicated to improving cancer patient outcomes through nutrition.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-blue-400">Recipe Database</a></li>
                  <li><a href="#" className="hover:text-blue-400">Meal Plans</a></li>
                  <li><a href="#" className="hover:text-blue-400">Nutrition Guide</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Research</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-blue-400">Publications</a></li>
                  <li><a href="#" className="hover:text-blue-400">Clinical Trials</a></li>
                  <li><a href="#" className="hover:text-blue-400">Partners</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Connect</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-blue-400">Contact Us</a></li>
                  <li><a href="#" className="hover:text-blue-400">Support Groups</a></li>
                  <li><a href="#" className="hover:text-blue-400">Newsletter</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
              © 2024 NutriThrive Research. All rights reserved. | 501(c)(3) Non-Profit Organization
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;