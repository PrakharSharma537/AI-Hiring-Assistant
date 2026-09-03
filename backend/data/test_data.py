# test_data.py

TEST_DATABASE = {
    # -------------------------------------------------------------
    # 1. JAVA ASSESSMENTS
    # -------------------------------------------------------------
    "java": [
        {
            "question": "What is the primary function of Garbage Collection in Java?",
            "options": [
                "To compile Java code into bytecode",
                "To automatically reclaim memory occupied by unreferenced objects",
                "To execute thread synchronization",
                "To manage network connections"
            ],
            "answer": 1
        },
        {
            "question": "Which keyword prevents a class from being subclassed in Java?",
            "options": ["static", "abstract", "final", "volatile"],
            "answer": 2
        },
        {
            "question": "Which collection type in Java guarantees unique elements and no ordering?",
            "options": ["ArrayList", "HashSet", "LinkedList", "Vector"],
            "answer": 1
        }
    ],

    # -------------------------------------------------------------
    # 2. JAVASCRIPT ASSESSMENTS
    # -------------------------------------------------------------
    "javascript": [
        {
            "question": "What will 'typeof NaN' evaluate to in JavaScript?",
            "options": ["undefined", "number", "nan", "object"],
            "answer": 1
        },
        {
            "question": "Which method is used to create a new array with the results of calling a function on every element?",
            "options": ["forEach()", "filter()", "map()", "reduce()"],
            "answer": 2
        },
        {
            "question": "What is the key difference between 'let' and 'var'?",
            "options": [
                "'let' is function-scoped while 'var' is block-scoped",
                "'let' is block-scoped while 'var' is function-scoped",
                "'var' cannot be re-assigned",
                "There is no functional difference"
            ],
            "answer": 1
        }
    ],

    # -------------------------------------------------------------
    # 3. .NET / C# ASSESSMENTS
    # -------------------------------------------------------------
    ".net": [
        {
            "question": "What is the Common Language Runtime (CLR) in .NET?",
            "options": [
                "A database engine for SQL queries",
                "The execution engine that manages running .NET applications",
                "A front-end UI framework",
                "A package manager for NuGet"
            ],
            "answer": 1
        },
        {
            "question": "In C# .NET, what is the difference between value types and reference types?",
            "options": [
                "Value types are stored on the heap; reference types on the stack",
                "Value types are stored on the stack; reference types on the heap",
                "Value types cannot be modified once created",
                "Both are stored in the application's global register"
            ],
            "answer": 1
        },
        {
            "question": "Which keyword is used in C# to allow a method to be overridden in a derived class?",
            "options": ["override", "virtual", "abstract", "new"],
            "answer": 1
        }
    ],

    # -------------------------------------------------------------
    # 4. SQL / DATABASE ASSESSMENTS
    # -------------------------------------------------------------
    "sql": [
        {
            "question": "Which clause is used in SQL to filter groups created by GROUP BY?",
            "options": ["WHERE", "ORDER BY", "HAVING", "JOIN"],
            "answer": 2
        },
        {
            "question": "What type of JOIN returns all records when there is a match in either left or right table?",
            "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
            "answer": 3
        },
        {
            "question": "Which SQL command is used to delete all rows from a table without logging individual row deletions?",
            "options": ["DELETE", "TRUNCATE", "DROP", "REMOVE"],
            "answer": 1
        }
    ],

    # -------------------------------------------------------------
    # 5. PYTHON ASSESSMENTS
    # -------------------------------------------------------------
    "python": [
        {
            "question": "Which of the following built-in data structures is immutable in Python?",
            "options": ["List", "Dictionary", "Tuple", "Set"],
            "answer": 2
        },
        {
            "question": "What is the primary function of Python's 'GIL' (Global Interpreter Lock)?",
            "options": [
                "To optimize loop iterations",
                "To ensure only one thread executes Python bytecode at a time",
                "To lock memory during garbage collection",
                "To restrict access to private variables"
            ],
            "answer": 1
        },
        {
            "question": "Which decorator is used to define a method that belongs to the class rather than an instance?",
            "options": ["@staticmethod", "@classmethod", "@property", "@abstractmethod"],
            "answer": 1
        }
    ],

    # -------------------------------------------------------------
    # 6. C++ ASSESSMENTS
    # -------------------------------------------------------------
    "c++": [
        {
            "question": "What is a 'dangling pointer' in C++?",
            "options": [
                "A pointer pointing to a NULL value",
                "A pointer pointing to a memory location that has been deleted/freed",
                "A pointer that hasn't been initialized yet",
                "A pointer pointing to a constant variable"
            ],
            "answer": 1
        },
        {
            "question": "Which C++ feature allows multiple functions to have the same name with different parameters?",
            "options": [
                "Function Overriding",
                "Function Overloading",
                "Virtual Functions",
                "Template Specialization"
            ],
            "answer": 1
        },
        {
            "question": "What keyword is used to allocate memory dynamically in C++?",
            "options": ["malloc", "alloc", "new", "create"],
            "answer": 2
        }
    ]
}