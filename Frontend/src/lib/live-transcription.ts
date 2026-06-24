import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => SpeechRecognition;

type SpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export type TranscriptLine = {
  t: string;
  speaker: string;
  text: string;
};

const timestamp = (start: number) => {
  const elapsed = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function useLiveTranscription(
  onFinalLine?: (line: TranscriptLine) => void,
) {
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  );
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startAtRef = useRef(Date.now());
  const manuallyStoppedRef = useRef(false);

  const stop = useCallback(() => {
    manuallyStoppedRef.current = true;
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor || recognitionRef.current) return;

    manuallyStoppedRef.current = false;
    startAtRef.current = Date.now();
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let interimText = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const text = result[0]?.transcript?.trim();
        if (!text) continue;
        if (result.isFinal) {
          const line = {
            t: timestamp(startAtRef.current),
            speaker: "You",
            text,
          };
          setLines((items) => [...items, line]);
          onFinalLine?.(line);
        } else {
          interimText += `${text} `;
        }
      }
      setInterim(interimText.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      if (!manuallyStoppedRef.current) window.setTimeout(start, 600);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onFinalLine]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, interim, lines, start, stop };
}
