import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm select-none">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-900 shadow-2xl shadow-emerald-500/10">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-4 sm:p-5 text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">ℹ️</span>
            <h2 className="text-lg sm:text-xl font-bold tracking-wide">Comment Manoir Valombre a été fait</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-3.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong className="text-emerald-400">Stack :</strong> React 19, TypeScript 5.9, Tailwind CSS 4, Vite 7, sans framework tiers lourd.
          </p>
          <p>
            <strong className="text-emerald-400">Graphismes :</strong> Scène vectorielle et SVG stylisée avec animations d ambiance (flammes vacillantes, chauves-souris oscillantes, reflets spectraux), filtre lanterne obscurcissant le manoir.
          </p>
          <p>
            <strong className="text-emerald-400">Musique &amp; sons :</strong> Bruitages Web Audio synthétisés pour frottements de parchemins, allumages de bougies, déverrouillage de coffres et tic-tac de minuit.
          </p>
          <p>
            <strong className="text-emerald-400">Interactions :</strong> Point and click immersif au clic ou tap tactile, manipulation directe des énigmes, zoom sur les objets secrets.
          </p>
          <p>
            <strong className="text-emerald-400">Architecture :</strong> Machine à états narrative (salle active, drapeaux d énigmes résolues, inventaire, réserve de cire), rendu réactif React pur.
          </p>
          <p>
            <strong className="text-emerald-400">Algorithmes notables :</strong> Système de masque d obscurité dynamique centré sur la lanterne du joueur, chronomètre de fusion de cire avec malus d indice, validation de codes secrets.
          </p>
        </div>

        <p className="px-4 pb-1 text-center text-[11px] text-slate-400">Créé par Geoffroy Streit (Hylst) avec l'aide d'une IA.</p>
        <div className="bg-slate-950 p-3 sm:p-4 text-center border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition cursor-pointer text-sm shadow-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
