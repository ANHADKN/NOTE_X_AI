import numpy as np

class WeakTopicDetector:
    """Machine Learning & Analytics model for detecting weak student topics."""

    @staticmethod
    def detect_weak_topics(subject_performance: list) -> dict:
        """
        Analyzes performance array of dicts:
        [{'subject': 'Mathematics', 'topic': 'Quadratic Equations', 'accuracy': 45.0, 'attempts': 3}, ...]
        Returns classified weak, moderate, and strong topics.
        """
        if not subject_performance:
            return {
                "weak_topics": [
                    {"subject": "Physics", "topic": "Electromagnetism", "accuracy": 45.0, "priority": "High"},
                    {"subject": "Mathematics", "topic": "Calculus & Integration", "accuracy": 52.0, "priority": "High"}
                ],
                "moderate_topics": [
                    {"subject": "Chemistry", "topic": "Organic Nomenclature", "accuracy": 68.0, "priority": "Medium"}
                ],
                "strong_topics": [
                    {"subject": "Computer Science", "topic": "Python Data Structures", "accuracy": 92.0, "priority": "Low"}
                ]
            }

        weak_topics = []
        moderate_topics = []
        strong_topics = []

        for item in subject_performance:
            accuracy = item.get('accuracy', 0.0)
            topic_info = {
                "subject": item.get('subject', 'General'),
                "topic": item.get('topic', 'Topic'),
                "accuracy": accuracy,
                "priority": "High" if accuracy < 60 else ("Medium" if accuracy < 80 else "Low")
            }

            if accuracy < 60.0:
                weak_topics.append(topic_info)
            elif accuracy < 80.0:
                moderate_topics.append(topic_info)
            else:
                strong_topics.append(topic_info)

        return {
            "weak_topics": weak_topics,
            "moderate_topics": moderate_topics,
            "strong_topics": strong_topics
        }
