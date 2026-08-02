import { useState, useCallback } from 'react';

export function useExamState(questions = []) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});      // { questionId: optionIndex }
  const [marked, setMarked] = useState(new Set()); // question IDs marked for review
  const [visited, setVisited] = useState(new Set([questions[0]?.id]));

  const goTo = useCallback((index) => {
    const q = questions[index];
    if (!q) return;
    setCurrentIndex(index);
    setVisited(prev => new Set([...prev, q.id]));
  }, [questions]);

  const next = useCallback(() => {
    if (currentIndex < questions.length - 1) goTo(currentIndex + 1);
  }, [currentIndex, questions.length, goTo]);

  const prev = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const selectAnswer = useCallback((questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const clearAnswer = useCallback((questionId) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const toggleMark = useCallback((questionId) => {
    setMarked(prev => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  }, []);

  const getStatus = useCallback((questionId) => {
    if (marked.has(questionId) && answers[questionId] !== undefined) return 'marked-answered';
    if (marked.has(questionId)) return 'marked';
    if (answers[questionId] !== undefined) return 'answered';
    if (visited.has(questionId)) return 'visited';
    return 'not-visited';
  }, [answers, marked, visited]);

  const summary = {
    total: questions.length,
    answered: Object.keys(answers).length,
    marked: marked.size,
    notAnswered: questions.length - Object.keys(answers).length,
  };

  const calculateScore = useCallback(() => {
    return questions.reduce((acc, q) => {
      if (answers[q.id] === q.correct) return acc + (q.marks || 3);
      return acc;
    }, 0);
  }, [questions, answers]);

  return {
    currentIndex,
    currentQuestion: questions[currentIndex],
    answers,
    marked,
    visited,
    summary,
    goTo,
    next,
    prev,
    selectAnswer,
    clearAnswer,
    toggleMark,
    getStatus,
    calculateScore,
  };
}
