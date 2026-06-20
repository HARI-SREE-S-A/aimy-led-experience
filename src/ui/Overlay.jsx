import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../scroll/store';
import { chapters, brand } from '../content/chapters';

gsap.registerPlugin(ScrollTrigger);

export function Overlay() {
  const overlayRef = useRef(null);
  const activeChapter = useScrollStore((state) => state.chapter);

  useEffect(() => {
    const sections = gsap.utils.toArray('.chapter');
    
    // Overall progress
    ScrollTrigger.create({
      trigger: overlayRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        useScrollStore.setState({ progress: self.progress });
      }
    });

    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) => {
          if (self.isActive) {
            useScrollStore.setState({ 
              chapter: i,
              chapterProgress: self.progress 
            });
          }
        },
        onEnter: () => useScrollStore.setState({ chapter: i }),
        onEnterBack: () => useScrollStore.setState({ chapter: i })
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      <header className="brand-bar">
        <div className="brand-bar__logo">
          <div className="brand-bar__logo-dot" />
          {brand.name}
        </div>
        <a href={brand.legacyUrl} className="brand-bar__legacy">
          Back to Main Site
        </a>
      </header>

      <nav className="progress-rail">
        {chapters.map((chap, i) => (
          <button 
            key={`nav-${chap.id}`} 
            className={`progress-rail__item ${activeChapter === i ? 'is-active' : ''}`}
            onClick={() => {
              window.scrollTo({
                top: i * window.innerHeight,
                behavior: 'smooth'
              });
            }}
          >
            <span className="progress-rail__dot" />
            <span className="progress-rail__label">{chap.eyebrow.split('·')[0]}</span>
          </button>
        ))}
      </nav>

      <div ref={overlayRef} className="scroll-spacer">
        {chapters.map((chap, i) => (
          <section key={chap.id} className={`chapter chapter--${chap.align}`}>
            <div className="chapter__card">
              <div className="chapter__eyebrow">{chap.eyebrow}</div>
              <h2 className="chapter__title" dangerouslySetInnerHTML={{ __html: chap.title }} />
              {chap.lede && <p className="chapter__lede">{chap.lede}</p>}
              {chap.body && <p className="chapter__body">{chap.body}</p>}
              
              {chap.bullets && (
                <ul className="chapter__bullets">
                  {chap.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                </ul>
              )}
              
              {chap.stats && (
                <div className="chapter__stats">
                  {chap.stats.map((s, idx) => (
                    <div key={idx} className="chapter__stat">
                      <div className="chapter__stat-value">{s.value}</div>
                      <div className="chapter__stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {chap.cta && (
                <a className="chapter__cta" href={chap.cta.href}>{chap.cta.label}</a>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
