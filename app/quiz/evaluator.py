class QuizEvaluator:
    """Evaluates student quiz submissions, calculates accuracy, and generates explanations."""

    @staticmethod
    def evaluate_submission(questions: list, student_answers: dict, time_taken: int) -> dict:
        """
        student_answers can be {"0": 1, "1": 0} or {"q_1": 1, "q_2": 0}
        """
        total_score = 0
        total_questions = len(questions)
        answers_breakdown = []

        for idx, q in enumerate(questions):
            q_id = str(q.get("id", f"q_{idx}"))
            
            # Lookup selected option by question_id or 0-based index
            selected_idx = student_answers.get(q_id)
            if selected_idx is None:
                selected_idx = student_answers.get(str(idx))
            if selected_idx is None:
                selected_idx = student_answers.get(idx)

            if selected_idx is not None:
                try:
                    selected_idx = int(selected_idx)
                except Exception:
                    pass

            correct_idx = q.get("correct_index", 0)
            try:
                correct_idx = int(correct_idx)
            except Exception:
                correct_idx = 0

            is_correct = (selected_idx is not None) and (selected_idx == correct_idx)
            if is_correct:
                total_score += q.get("marks", 1)

            answers_breakdown.append({
                "question_id": q_id,
                "question_index": idx,
                "question": q.get("question"),
                "options": q.get("options", []),
                "selected_index": selected_idx,
                "correct_index": correct_idx,
                "is_correct": is_correct,
                "explanation": q.get("explanation", "The selected option aligns with core syllabus concepts.")
            })

        accuracy = (total_score / total_questions * 100.0) if total_questions > 0 else 0.0

        return {
            "score": total_score,
            "total": total_questions,
            "accuracy": round(accuracy, 1),
            "time_taken": time_taken,
            "answers_breakdown": answers_breakdown
        }
