"""
Management command to seed the database with demo data.
Usage: python manage.py seed_data [--clear]
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random


class Command(BaseCommand):
    help = "Peuple la base de données avec des données de démonstration"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Vide les données existantes avant de les recréer",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self._clear_data()

        self.stdout.write("Création des utilisateurs...")
        users = self._create_users()

        self.stdout.write("Création des catégories et cours...")
        courses = self._create_courses(users)

        self.stdout.write("Création des inscriptions...")
        self._create_enrollments(users, courses)

        self.stdout.write("Création des quiz...")
        self._create_quizzes(courses)

        self.stdout.write("Création des devoirs...")
        self._create_assignments(courses)

        self.stdout.write(self.style.SUCCESS("Données de démonstration créées avec succès !"))
        self.stdout.write(f"  Admin:      admin@esatic.ci / admin123")
        self.stdout.write(f"  Enseignant: kofi.asante@esatic.ci / teacher123")
        self.stdout.write(f"  Étudiant:   aminata.diallo@esatic.ci / student123")

    def _clear_data(self):
        from apps.accounts.models import User
        from apps.courses.models import Category, Course
        self.stdout.write(self.style.WARNING("Suppression des données existantes..."))
        User.objects.filter(email__endswith="@esatic.ci").exclude(is_superuser=True).delete()
        Category.objects.all().delete()

    def _create_users(self):
        from apps.accounts.models import User

        users = {}

        admin, _ = User.objects.get_or_create(
            email="admin@esatic.ci",
            defaults={
                "first_name": "Admin",
                "last_name": "ESATIC",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_verified": True,
            },
        )
        if _:
            admin.set_password("admin123")
            admin.save()
        users["admin"] = admin

        teachers_data = [
            ("Kofi", "Asante", "kofi.asante@esatic.ci"),
            ("Adjoua", "Kouamé", "adjoua.kouame@esatic.ci"),
            ("Brice", "Yao", "brice.yao@esatic.ci"),
        ]
        users["teachers"] = []
        for first, last, email in teachers_data:
            t, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "role": User.Role.TEACHER,
                    "is_verified": True,
                    "bio": f"Enseignant en {first}'s domaine",
                },
            )
            if created:
                t.set_password("teacher123")
                t.save()
            users["teachers"].append(t)

        students_data = [
            ("Aminata", "Diallo", "aminata.diallo@esatic.ci"),
            ("Seydou", "Traoré", "seydou.traore@esatic.ci"),
            ("Fatoumata", "Coulibaly", "fatoumata.coulibaly@esatic.ci"),
            ("Ibrahim", "Sanogo", "ibrahim.sanogo@esatic.ci"),
            ("Mariam", "Bamba", "mariam.bamba@esatic.ci"),
            ("Oumar", "Cissé", "oumar.cisse@esatic.ci"),
        ]
        users["students"] = []
        for first, last, email in students_data:
            s, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "role": User.Role.STUDENT,
                    "is_verified": True,
                },
            )
            if created:
                s.set_password("student123")
                s.save()
            users["students"].append(s)

        return users

    def _create_courses(self, users):
        from apps.courses.models import Category, Course, Section

        categories_data = [
            ("Informatique", "informatique"),
            ("Mathématiques", "mathematiques"),
            ("Réseaux & Télécoms", "reseaux-telecoms"),
            ("Gestion de Projets", "gestion-projets"),
        ]
        categories = {}
        for name, slug in categories_data:
            cat, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})
            categories[slug] = cat

        courses_data = [
            {
                "title": "Introduction à Python",
                "slug": "intro-python",
                "description": "Apprenez les bases de la programmation Python, de la syntaxe aux concepts orientés objet.",
                "short_description": "Cours d'initiation à Python pour débutants",
                "category": "informatique",
                "teacher_idx": 0,
                "sections": ["Variables et types", "Structures de contrôle", "Fonctions", "POO", "Modules"],
            },
            {
                "title": "Algorithmes et Structures de Données",
                "slug": "algo-structures-donnees",
                "description": "Maîtrisez les algorithmes fondamentaux et les structures de données essentielles.",
                "short_description": "Tri, recherche, arbres, graphes",
                "category": "informatique",
                "teacher_idx": 0,
                "sections": ["Complexité", "Tri et recherche", "Listes et piles", "Arbres", "Graphes"],
            },
            {
                "title": "Réseaux Informatiques",
                "slug": "reseaux-informatiques",
                "description": "Comprendre les protocoles TCP/IP, les architectures réseau et la sécurité.",
                "short_description": "TCP/IP, routage, sécurité réseau",
                "category": "reseaux-telecoms",
                "teacher_idx": 2,
                "sections": ["Modèle OSI", "TCP/IP", "Routage", "DNS & DHCP", "Sécurité"],
            },
            {
                "title": "Mathématiques Discrètes",
                "slug": "maths-discretes",
                "description": "Logique, théorie des ensembles, combinatoire et théorie des graphes.",
                "short_description": "Fondements mathématiques de l'informatique",
                "category": "mathematiques",
                "teacher_idx": 1,
                "sections": ["Logique propositionnelle", "Ensembles", "Relations", "Combinatoire", "Graphes"],
            },
            {
                "title": "Gestion de Projet Agile",
                "slug": "gestion-projet-agile",
                "description": "Scrum, Kanban et méthodes agiles pour la conduite de projets informatiques.",
                "short_description": "Scrum, Kanban, management de projet",
                "category": "gestion-projets",
                "teacher_idx": 1,
                "sections": ["Introduction Agile", "Scrum", "Kanban", "User Stories", "Rétrospectives"],
            },
        ]

        courses = []
        for data in courses_data:
            course, created = Course.objects.get_or_create(
                slug=data["slug"],
                defaults={
                    "title": data["title"],
                    "description": data["description"],
                    "short_description": data["short_description"],
                    "category": categories[data["category"]],
                    "teacher": users["teachers"][data["teacher_idx"]],
                    "status": Course.Status.PUBLISHED,
                },
            )
            if created:
                for i, section_title in enumerate(data["sections"], 1):
                    Section.objects.create(course=course, title=section_title, order=i)
            courses.append(course)

        return courses

    def _create_enrollments(self, users, courses):
        from apps.courses.models import Enrollment

        for student in users["students"]:
            enrolled_courses = random.sample(courses, min(3, len(courses)))
            for course in enrolled_courses:
                Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        "status": Enrollment.Status.ACTIVE,
                        "progress": round(random.uniform(0, 80), 1),
                    },
                )

    def _create_quizzes(self, courses):
        from apps.courses.models import Section
        from apps.quizzes.models import Question, Choice, Quiz, QuizQuestion

        teacher = courses[0].teacher

        quiz_data = [
            {
                "course_idx": 0,
                "title": "Quiz Python — Les bases",
                "pass_score": 60.0,
                "time_limit": 20,
                "questions": [
                    {
                        "text": "Quel mot-clé sert à définir une fonction en Python ?",
                        "type": "mcq",
                        "choices": [("def", True), ("function", False), ("func", False), ("define", False)],
                    },
                    {
                        "text": "Python est un langage interprété.",
                        "type": "true_false",
                        "choices": [("Vrai", True), ("Faux", False)],
                    },
                    {
                        "text": "Quel type de données est immuable en Python ?",
                        "type": "mcq",
                        "choices": [("list", False), ("dict", False), ("tuple", True), ("set", False)],
                    },
                    {
                        "text": "Quelle est la sortie de print(type(3.14)) ?",
                        "type": "mcq",
                        "choices": [("<class 'float'>", True), ("<class 'int'>", False), ("<class 'str'>", False), ("<class 'double'>", False)],
                    },
                ],
            },
            {
                "course_idx": 1,
                "title": "Quiz Algorithmes — Complexité",
                "pass_score": 70.0,
                "time_limit": 30,
                "questions": [
                    {
                        "text": "Quelle est la complexité temporelle du tri par insertion dans le pire cas ?",
                        "type": "mcq",
                        "choices": [("O(n)", False), ("O(n log n)", False), ("O(n²)", True), ("O(log n)", False)],
                    },
                    {
                        "text": "La recherche binaire nécessite que le tableau soit trié.",
                        "type": "true_false",
                        "choices": [("Vrai", True), ("Faux", False)],
                    },
                    {
                        "text": "Quel algorithme de tri a une complexité O(n log n) dans tous les cas ?",
                        "type": "mcq",
                        "choices": [("Tri fusion", True), ("Tri à bulles", False), ("Tri par insertion", False), ("Tri rapide", False)],
                    },
                ],
            },
        ]

        for qdata in quiz_data:
            course = courses[qdata["course_idx"]]
            section = course.sections.first()
            if not section:
                continue

            quiz, created = Quiz.objects.get_or_create(
                title=qdata["title"],
                section=section,
                defaults={
                    "pass_score": qdata["pass_score"],
                    "time_limit_minutes": qdata["time_limit"],
                    "show_results_immediately": True,
                },
            )

            if created:
                for order, q_info in enumerate(qdata["questions"], 1):
                    question = Question.objects.create(
                        text=q_info["text"],
                        question_type=q_info["type"],
                        points=1,
                        created_by=teacher,
                    )
                    for choice_text, is_correct in q_info["choices"]:
                        Choice.objects.create(question=question, text=choice_text, is_correct=is_correct)
                    QuizQuestion.objects.create(quiz=quiz, question=question, order=order)

    def _create_assignments(self, courses):
        from apps.assignments.models import Assignment

        now = timezone.now()
        assignments_data = [
            {
                "course_idx": 0,
                "title": "TP1 — Implémentation d'une calculatrice Python",
                "description": "Créez une calculatrice en Python supportant les opérations +, -, *, / avec gestion des erreurs.",
                "deadline_days": 14,
                "max_score": 20,
            },
            {
                "course_idx": 0,
                "title": "Projet Final — Application CLI",
                "description": "Développez une application en ligne de commande complète utilisant les concepts vus en cours.",
                "deadline_days": 30,
                "max_score": 40,
            },
            {
                "course_idx": 1,
                "title": "TP Algorithmes — Implémentation de tris",
                "description": "Implémentez et comparez les algorithmes de tri par sélection, insertion et fusion.",
                "deadline_days": 10,
                "max_score": 20,
            },
            {
                "course_idx": 2,
                "title": "Configuration d'un réseau local",
                "description": "Configurez un réseau LAN avec routage statique et DHCP en utilisant Cisco Packet Tracer.",
                "deadline_days": 21,
                "max_score": 30,
            },
        ]

        for data in assignments_data:
            course = courses[data["course_idx"]]
            section = course.sections.first()
            if not section:
                continue
            Assignment.objects.get_or_create(
                title=data["title"],
                section=section,
                defaults={
                    "description": data["description"],
                    "deadline": now + timedelta(days=data["deadline_days"]),
                    "max_score": data["max_score"],
                },
            )
