import { create } from 'zustand';

const usePlayerStore = create((set) => ({
    isVisible: false,
    paragraphs: [],
    currentParagraphIndex: 0,
    isPlaying: false,
    volume: 1,
    rate: 1,
    elapsedTime: 0,
    totalDuration: 0,
    utterance: null,
    sintesis: window.speechSynthesis,
    currentCharIndexRef: 0,
    isMuted: false, // Nuevo estado para mute

    setParagraphs: (paragraphs) => set({
        paragraphs,
        totalDuration: paragraphs.reduce((total, paragraph) => total + (paragraph.split(' ').length * 0.75), 0)
    }),
    setCurrentParagraphIndex: (index) => set({ currentParagraphIndex: index }),
    togglePlay: () => set((state) => {
        if (state.isPlaying) {
            state.sintesis.pause();
        } else {
            state.sintesis.resume();
        }
        return { isPlaying: !state.isPlaying };
    }),
    handleVolumeChange: (newVolume) => set((state) => {
        if (state.utterance) {
            state.utterance.volume = newVolume;
        }
        return { volume: newVolume, isMuted: newVolume === 0 };
    }),
    handleRateChange: (newRate) => set((state) => {
        if (state.utterance) {
            state.sintesis.cancel();
            state.startReadingFromParagraph(state.currentParagraphIndex, state.currentCharIndexRef, newRate);
        }
        return { rate: newRate };
    }),
    toggleMute: () => set((state) => {
        const newVolume = state.isMuted ? 1 : 0;
        if (state.utterance) {
            state.utterance.volume = newVolume;
        }
        return { volume: newVolume, isMuted: !state.isMuted };
    }),
    showPlayer: (paragraphs) => set({ isVisible: true, paragraphs, currentParagraphIndex: 0 }),
    hidePlayer: () => set({ isVisible: false }),
    setElapsedTime: (newTime) => set({ elapsedTime: newTime }),

    startReadingFromParagraph: (index, charIndex = 0, rate) => set((state) => {
        if (index >= state.paragraphs.length) return;

        const selectedText = state.paragraphs[index].slice(charIndex);
        const newUtterance = new SpeechSynthesisUtterance(selectedText);
        newUtterance.lang = 'es-MX';
        newUtterance.volume = state.volume;
        newUtterance.rate = rate || state.rate;
        newUtterance.pitch = 1;

        let cumulativeDuration = state.paragraphs.slice(0, index).reduce((total, paragraph) => total + (paragraph.split(' ').length * 0.75), 0);

        newUtterance.onboundary = (event) => {
            if (event.name === "word") {
                const wordsSoFar = selectedText.slice(0, event.charIndex).split(" ").length;
                const elapsedTimeForCurrentParagraph = wordsSoFar * 0.75;
                set({ elapsedTime: cumulativeDuration + elapsedTimeForCurrentParagraph });
                state.currentCharIndexRef = event.charIndex;
            }
        };

        newUtterance.onend = () => {
            const nextIndex = index + 1;
            if (nextIndex < state.paragraphs.length) {
                set({ currentParagraphIndex: nextIndex });
                state.startReadingFromParagraph(nextIndex, 0, state.rate);
            } else {
                set({ isPlaying: false, elapsedTime: state.totalDuration });
            }
        };

        state.sintesis.cancel();
        state.sintesis.speak(newUtterance);
        return { utterance: newUtterance, isPlaying: true };
    }),
}));

export default usePlayerStore;
