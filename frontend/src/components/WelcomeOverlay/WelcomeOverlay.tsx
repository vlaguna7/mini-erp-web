import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import styles from './WelcomeOverlay.module.css';

const WelcomeOverlay: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const justLoggedIn = useAuthStore((s) => s.justLoggedIn);
  const clearJustLoggedIn = useAuthStore((s) => s.clearJustLoggedIn);
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'done'>('intro');

  useEffect(() => {
    if (!justLoggedIn) {
      setPhase('done');
      return;
    }
    // Phase timing
    const t1 = setTimeout(() => setPhase('reveal'), 2000);
    const t2 = setTimeout(() => {
      setPhase('done');
      clearJustLoggedIn();
    }, 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [justLoggedIn, clearJustLoggedIn]);

  if (phase === 'done') return null;

  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-overlay"
        className={styles.overlay}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
          {/* Animated background particles */}
          <div className={styles.particleField}>
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.span
                key={i}
                className={styles.particle}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0,
                }}
                animate={phase === 'reveal' ? {
                  x: (Math.random() - 0.5) * window.innerWidth * 1.2,
                  y: (Math.random() - 0.5) * window.innerHeight * 1.2,
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                } : {
                  scale: [0, 0.4, 0],
                  opacity: [0, 0.15, 0],
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                }}
                transition={{
                  duration: phase === 'reveal' ? 0.8 : 2.5,
                  delay: phase === 'reveal' ? i * 0.02 : i * 0.08,
                  ease: 'easeOut',
                  repeat: phase === 'reveal' ? 0 : Infinity,
                  repeatType: 'loop',
                }}
              />
            ))}
          </div>

          {/* Radial glow */}
          <motion.div
            className={styles.glow}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={phase === 'reveal'
              ? { scale: 4, opacity: 0 }
              : { scale: [0.5, 1.2, 0.8, 1], opacity: [0, 0.4, 0.3, 0.35] }
            }
            transition={phase === 'reveal'
              ? { duration: 0.8, ease: 'easeOut' }
              : { duration: 2, ease: 'easeInOut' }
            }
          />

          {/* Center content */}
          <div className={styles.center}>
            {/* Logo */}
            <motion.div
              className={styles.logoWrap}
              initial={{ scale: 0, rotate: -180 }}
              animate={phase === 'reveal'
                ? { scale: 0, rotate: 180, opacity: 0 }
                : { scale: 1, rotate: 0, opacity: 1 }
              }
              transition={phase === 'reveal'
                ? { duration: 0.4, ease: 'easeIn' }
                : { type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }
              }
            >
              <div className={styles.logoRing}>
                <motion.div
                  className={styles.logoRingBorder}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
                />
              </div>
              <img src="/logo.png" alt="Logo" className={styles.logo} />
            </motion.div>

            {/* Welcome text */}
            <motion.div
              className={styles.textBlock}
              initial={{ opacity: 0, y: 30 }}
              animate={phase === 'reveal'
                ? { opacity: 0, y: -30 }
                : { opacity: 1, y: 0 }
              }
              transition={phase === 'reveal'
                ? { duration: 0.3 }
                : { delay: 0.5, duration: 0.6, ease: 'easeOut' }
              }
            >
              <motion.h1
                className={styles.welcomeTitle}
                initial={{ opacity: 0, y: 20 }}
                animate={phase === 'intro' ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Bem-vindo de volta
              </motion.h1>
              <motion.p
                className={styles.welcomeName}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={phase === 'intro' ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.85, type: 'spring', stiffness: 200, damping: 20 }}
              >
                {firstName}
              </motion.p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className={styles.progressTrack}
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={phase === 'reveal'
                ? { opacity: 0, scaleX: 0 }
                : { opacity: 1, scaleX: 1 }
              }
              transition={phase === 'reveal'
                ? { duration: 0.2 }
                : { delay: 1.1, duration: 0.3 }
              }
            >
              <motion.div
                className={styles.progressBar}
                initial={{ scaleX: 0 }}
                animate={phase === 'intro' ? { scaleX: 1 } : {}}
                transition={{ delay: 1.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </motion.div>
          </div>

          {/* Curtain reveal - top half slides up, bottom half slides down */}
          {phase === 'reveal' && (
            <>
              <motion.div
                className={`${styles.curtain} ${styles.curtainTop}`}
                initial={{ y: '0%' }}
                animate={{ y: '-100%' }}
                transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
              />
              <motion.div
                className={`${styles.curtain} ${styles.curtainBottom}`}
                initial={{ y: '0%' }}
                animate={{ y: '100%' }}
                transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
              />
            </>
          )}
        </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
