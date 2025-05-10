'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

// Using JSDelivr CDN for more reliable technology icons
const technologies = [
  {
    name: "JavaScript",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
  },
  {
    name: "Python", 
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
  },
  {
    name: "React",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
  },
  {
    name: "Node.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
  },
  {
    name: "TypeScript",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
  },
  {
    name: "Java",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"
  },
  {
    name: "PHP",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg"
  },
  {
    name: "Go",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
  },
  {
    name: "Ruby",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg"
  },
  {
    name: "Swift",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg"
  },
  {
    name: "Angular",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg"
  },
  {
    name: "Vue.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
  },
  {
    name: "Django",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg"
  },
  {
    name: "MongoDB",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
  },
  {
    name: "Docker",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
  },
  {
    name: "AWS",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg"
  }
];

export default function TechIconsMarquee() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollerRef.current) return;
    
    const scrollers = document.querySelectorAll('.scroller');
    
    // If a user prefers reduced motion, disable the animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scrollers.forEach(scroller => {
        (scroller as HTMLElement).style.setProperty('--play-state', 'paused');
      });
      return;
    }
    
    // Add animation duration based on the number of technologies
    scrollerRef.current.style.setProperty('--animation-duration', `${technologies.length * 3}s`);
    
    // Add data-animated attribute to start the animation
    scrollers.forEach(scroller => {
      scroller.setAttribute('data-animated', 'true');
    });
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-white py-10">
      <div className="container-custom">
        <p className="text-center text-gray-500 mb-8">Your Gateway to Modern Tech Skills</p>
      </div>
      
      <div className="scroller" ref={scrollerRef} data-speed="slow">
        <div className="scroller__inner">
          {/* Create 2 sets of icons to ensure seamless infinite loop */}
          {[...technologies, ...technologies].map((tech, i) => (
            <TechLogo key={`${tech.name}-${i}`} tech={tech} />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .scroller {
          max-width: 100%;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        
        .scroller__inner {
          display: flex;
          flex-wrap: nowrap;
          gap: 2rem;
          padding-block: 1rem;
          width: max-content;
        }
        
        .scroller[data-animated="true"] {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        
        .scroller[data-animated="true"] .scroller__inner {
          width: max-content;
          animation: scroll var(--animation-duration, 30s) linear infinite;
          animation-play-state: var(--play-state, running);
        }
        
        .scroller[data-speed="slow"] {
          --animation-duration: 40s;
        }
        
        @keyframes scroll {
          to {
            transform: translateX(calc(-50%));
          }
        }
      `}</style>
    </div>
  );
}

function TechLogo({ tech }: { tech: { name: string; logo: string } }) {
  return (
    <div className="flex flex-col items-center justify-center w-24 h-20">
      <div className="relative h-12 w-12 mb-2">
        <Image 
          src={tech.logo}
          alt={`${tech.name} logo`}
          fill
          className="object-contain drop-shadow-sm"
          loading="eager"
          priority
        />
      </div>
      <span className="text-xs text-gray-600 text-center font-medium">{tech.name}</span>
    </div>
  );
} 