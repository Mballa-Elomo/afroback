import { chargerQuiz } from '@/lib/quiz';
import { QuizModule } from './QuizModule';

export const dynamic = 'force-dynamic';

/** Module Quiz (cdc-module-quiz.md). */
export default async function QuizPage() {
  const donnees = await chargerQuiz();
  if (donnees.erreur) {
    return <p style={{ color: '#e07a5f' }}>Lecture des quiz impossible : {donnees.erreur}. Exécutez schema-quiz.sql dans Supabase.</p>;
  }
  return <QuizModule donnees={donnees} />;
}
