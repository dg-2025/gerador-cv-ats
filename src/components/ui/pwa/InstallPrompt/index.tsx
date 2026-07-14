'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaDownload, FaShareSquare, FaTimes } from 'react-icons/fa';
import styles from './style.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissedPermanently, setDismissedPermanently] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
      return standalone;
    };

    const foiDispensado = localStorage.getItem('cv-prompt-dispensado');
    if (foiDispensado) {
      setDismissedPermanently(true);
      return;
    }

    if (checkStandalone()) {
      return;
    }

    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIos) {
      setPlatform('ios');
      const timer = setTimeout(() => {
        if (!dismissedPermanently && !isStandalone) {
          setShow(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallEvent);
      setPlatform('android');
      if (!dismissedPermanently && !isStandalone) {
        setTimeout(() => setShow(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissedPermanently, isStandalone]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
        localStorage.setItem('cv-prompt-dispensado', 'true');
        setDismissedPermanently(true);
      }
      setDeferredPrompt(null);
    } else if (platform === 'ios') {
      localStorage.setItem('cv-prompt-dispensado', 'true');
      setDismissedPermanently(true);
      setShow(false);
    }
  }, [deferredPrompt, platform]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem('cv-prompt-dispensado', 'true');
    setDismissedPermanently(true);
  }, []);

  if (!show || isStandalone) return null;

  return (
    <div className={`${styles.installPromptBanner} ${styles[platform]}`}>
      <div className={styles.promptHeader}>
        <img src="/imagens/logo/icons/icon-192x192.png" alt="Gerador CV ATS Icon" className={styles.appMiniIcon} />
        <div className={styles.promptText}>
          <strong>Gerador CV ATS</strong>
          <p>Instale o app para gerar currículos offline!</p>
        </div>
        <button onClick={handleDismiss} className={styles.closePrompt} aria-label="Fechar">
          <FaTimes size={18} />
        </button>
      </div>
      <div className={styles.promptBody}>
        {platform === 'ios' ? (
          <>
            <p className={styles.iosInstruction}>
              Toque em <FaShareSquare /> e <strong>"Adicionar à Tela de Início"</strong>
            </p>
            <button className={styles.btnInstallIos} onClick={handleInstall}>
              Entendi, quero instalar
            </button>
          </>
        ) : (
          <button className={styles.btnInstallAndroid} onClick={handleInstall}>
            <FaDownload /> Instalar App
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;