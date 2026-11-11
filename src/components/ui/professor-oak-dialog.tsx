"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { sfx } from "@/lib/sound-effects";

interface ProfessorOakDialogProps {
  imageSrc?: string;
  title?: string;
  speech?: string;
  actionButtonText?: string;
  onAction?: () => void;
  onClose: () => void;
}

const DEFAULT_WELCOME_SPEECH =
  "¡Hola, explorador! ¡Te doy la bienvenida al mundo de POKÉMON!\n\n" +
  "Mi nombre es OAK, aunque todos me conocen como el PROFESOR POKÉMON. " +
  "He sintonizado este PokéRadar Geoespacial para rastrear especies en tiempo real en los biomas de Argentina.\n\n" +
  "¡Explora las zonas del mapa, analiza el clima y forma un equipo legendario de hasta 6 compañeros! ¡Tu aventura comienza ahora!";

export function ProfessorOakDialog({
  imageSrc = "/images/professor-oak.png",
  title = "Profesor Oak",
  speech = DEFAULT_WELCOME_SPEECH,
  actionButtonText = "¡Entendido!",
  onAction,
  onClose,
}: ProfessorOakDialogProps) {
  const [typedState, setTypedState] = useState({ speech, text: "" });
  const textIndexRef = useRef(0);

  const displayedText = typedState.speech === speech ? typedState.text : "";
  const isTyping = displayedText.length < speech.length;

  // Play pop entrance SFX when Oak appears
  useEffect(() => {
    sfx.playPop();
  }, []);

  // Typewriter effect (delayed briefly so initial spring entrance stays smooth on mobile)
  useEffect(() => {
    textIndexRef.current = 0;

    let interval: ReturnType<typeof setInterval> | null = null;
    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        if (textIndexRef.current < speech.length) {
          textIndexRef.current = Math.min(textIndexRef.current + 2, speech.length);
          const currentSlice = speech.slice(0, textIndexRef.current);
          setTypedState({ speech, text: currentSlice });

          // Subtle vintage typewriter blip every 2 ticks (~4 chars, excluding spaces/newlines)
          const char = speech[textIndexRef.current - 1];
          if (textIndexRef.current % 4 < 2 && char !== " " && char !== "\n") {
            sfx.playTypewriterBlip();
          }
        } else {
          if (interval) clearInterval(interval);
        }
      }, 32);
    }, 180);

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, [speech]);

  // Skip typing if clicked on the speech text
  const handleBubbleClick = () => {
    if (isTyping) {
      textIndexRef.current = speech.length;
      setTypedState({ speech, text: speech });
      sfx.playButtonPress();
    }
  };

  const handleClose = () => {
    sfx.playMenuClose();
    onClose();
  };

  const handleAction = () => {
    sfx.playButtonPress();
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end items-start p-3 sm:p-6 select-none overflow-hidden">
      <div className="relative flex flex-col sm:flex-row items-end sm:items-end gap-2 sm:gap-4 max-w-2xl w-full">
        {/* Professor Oak Portrait (Bottom-Left Corner) */}
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 80, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
          exit={{
            scale: 0.2,
            opacity: 0,
            y: 80,
            transition: { duration: 0.25 },
          }}
          transition={{
            type: 'spring',
            stiffness: 340,
            damping: 22,
          }}
          className="relative pointer-events-auto shrink-0 z-20"
        >
          {/* Subtle glow behind Oak (closest-side fade ensures zero clipped straight edges) */}
          <div
            className="absolute -inset-6 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse closest-side, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.12) 50%, transparent 95%)',
            }}
          />

          {/* Professor Oak Artwork */}
          <Image
            src={imageSrc}
            alt="Profesor Oak"
            width={208}
            height={260}
            unoptimized
            className="w-28 sm:w-44 md:w-52 h-auto object-contain md:drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] select-none pointer-events-none"
          />
        </motion.div>

        {/* Speech Bubble with Typewriter Effect */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{
            scale: 0.7,
            opacity: 0,
            y: 20,
            transition: { duration: 0.2 },
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 26,
            delay: 0.12,
          }}
          onClick={handleBubbleClick}
          className="relative pointer-events-auto w-full sm:max-w-md bg-white rounded-2xl sm:rounded-3xl border-2 border-red-300 p-4 sm:p-5 shadow-2xl text-slate-800 z-30 cursor-pointer mb-2 sm:mb-6"
        >
          {/* Seamless Speech Bubble Tail integrated into left border (Desktop) */}
          <div className="hidden sm:block absolute -left-2.25 bottom-8 w-4 h-4 bg-white border-l-2 border-b-2 border-red-300 rotate-45 rounded-bl-xs" />

          {/* Seamless Speech Bubble Tail integrated into top border (Mobile) */}
          <div className="sm:hidden absolute -top-2.25 left-11 w-4 h-4 bg-white border-l-2 border-t-2 border-red-300 rotate-45 rounded-tl-xs" />

          {/* Top Bar: Badge & "X" Close Button in Top-Right Corner */}
          <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white shadow-xs">
                <Image
                  src="/pokeball-icon.webp"
                  alt=""
                  width={14}
                  height={14}
                  unoptimized
                  className="w-3.5 h-3.5 object-contain"
                />
              </span>
              <span className="font-sans font-extrabold text-xs sm:text-sm tracking-wider text-slate-900 uppercase">
                {title}
              </span>
            </div>

            {/* "X" Close Button in Top-Right Corner */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              title="Cerrar mensaje"
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
            >
              <Icon icon="lucide:x" width={16} height={16} />
            </button>
          </div>

          {/* Message Content with Typewriter Effect */}
          <div className="min-h-24 text-xs sm:text-[13px] font-sans font-medium text-slate-700 leading-relaxed whitespace-pre-line select-text">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-1.5 h-3.5 bg-red-600 ml-0.5 align-middle animate-pulse" />
            )}
          </div>

          {/* Footer action / skip hint */}
          <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400 font-sans">
            <span className="italic">
              {isTyping ? 'Toca para completar texto' : '¡Listo para explorar!'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>{actionButtonText}</span>
              <Icon icon="solar:arrow-right-linear" width={13} height={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
