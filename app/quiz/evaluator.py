class QuizEvaluator:
    """Evaluates student quiz submissions, calculates accuracy, and generates explanations."""

    @staticmethod
    def evaluate_submission(questions: list, student_answers: dict, time_taken: int) -> dict:
        """
        student_answers: {"1": 0, "2": 1, "3": 0, ...}
        """
        total_score = 0
        total_questions = len(questions)
        answers_breakdown = []

        for q in questions:
            q_id = str(q.get("id"))
            selected_idx = student_answers.get(q_id)
            correct_idx = q.get("correct_index", 0)

            is_correct = (selected_idx is not None) and (selected_idx == correct_idx)
            if is_correct:
                total_score += q.get("marks", 1)

            answers_breakdown.append({
                "question_id": q_id,
                "question": q.get("question"),
                "options": q.get("options", []),
                "selected_index": selected_idx,
                "correct_index": correct_idx,
                "is_correct": is_correct,
                "explanation": q.get("explanation", "The selected option aligns with core principles.")
            })

        accuracy = (total_score / total_questions * 100.0) if total_questions > 0 else 0.0

        return {
            "score": total_score,
            "total": total_questions,
            "accuracy": round(accuracy, 1),
            "time_taken": time_taken,
            "answers_breakdown": answers_breakdown
        }
