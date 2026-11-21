import { Subject, Task, Note, StudySchedule, StudyPlan, Quiz, StudyLog, QuizResult } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-cs201',
    userId: 'demo-user-1',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    instructor: 'Dr. Evelyn Reed',
    color: 'emerald',
    targetGrade: 'A',
    creditHours: 4,
    examDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    topics: ['Binary Search Trees', 'Graph Traversal (BFS/DFS)', 'Dynamic Programming', 'Dijkstra Algorithm', 'Heaps & Priority Queues'],
    masteryPercent: 78,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-chem302',
    userId: 'demo-user-1',
    code: 'CHEM302',
    name: 'Organic Chemistry II',
    instructor: 'Prof. David Vance',
    color: 'rose',
    targetGrade: 'A-',
    creditHours: 4,
    examDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    topics: ['Electrophilic Aromatic Substitution', 'Aldehydes & Ketones', 'Enolate Chemistry', 'NMR Spectroscopy', 'Carboxylic Acid Derivatives'],
    masteryPercent: 62,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-math240',
    userId: 'demo-user-1',
    code: 'MATH240',
    name: 'Linear Algebra & Matrices',
    instructor: 'Dr. Alan Morales',
    color: 'indigo',
    targetGrade: 'A+',
    creditHours: 3,
    examDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    topics: ['Eigenvalues & Eigenvectors', 'Orthogonal Diagonalization', 'Singular Value Decomposition (SVD)', 'Gram-Schmidt Process', 'Vector Subspaces'],
    masteryPercent: 85,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-psyc101',
    userId: 'demo-user-1',
    code: 'PSYC101',
    name: 'Cognitive Psychology',
    instructor: 'Dr. Sarah Jenkins',
    color: 'amber',
    targetGrade: 'A',
    creditHours: 3,
    examDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    topics: ['Working Memory Architecture', 'Long-term Potentiation', 'Attention & Perception', 'Problem Solving Heuristics', 'Decision Bias'],
    masteryPercent: 90,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: 'demo-user-1',
    subjectId: 'sub-cs201',
    title: 'Implement Dijkstra and A* pathfinding algorithm lab',
    description: 'Complete the Python graph assignment with weighted edge test cases.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'High',
    status: 'in-progress',
    estimatedMinutes: 90,
    actualMinutesSpent: 45,
    tags: ['Coding Lab', 'Graphs'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    userId: 'demo-user-1',
    subjectId: 'sub-math240',
    title: 'Solve Chapter 6 Problem Set: Matrix Diagonalization',
    description: 'Problems 14-28 on computing characteristic polynomials and orthogonal bases.',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'High',
    status: 'todo',
    estimatedMinutes: 75,
    actualMinutesSpent: 0,
    tags: ['Homework', 'Formulas'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    userId: 'demo-user-1',
    subjectId: 'sub-chem302',
    title: 'Review Carbonyl Reaction Mechanisms Flashcards',
    description: 'Nucleophilic addition to aldehydes and ketones with Grignard reagents.',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Medium',
    status: 'todo',
    estimatedMinutes: 45,
    actualMinutesSpent: 0,
    tags: ['Revision', 'Reactions'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-4',
    userId: 'demo-user-1',
    subjectId: 'sub-psyc101',
    title: 'Read Baddeley Model of Working Memory Paper',
    description: 'Summarize the central executive and phonological loop sections for seminar.',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Low',
    status: 'done',
    estimatedMinutes: 40,
    actualMinutesSpent: 40,
    tags: ['Reading'],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-5',
    userId: 'demo-user-1',
    subjectId: 'sub-cs201',
    title: 'Practice Dynamic Programming Knapsack Variations on LeetCode',
    description: '0/1 knapsack, unbounded knapsack, and subset sum partition problems.',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Medium',
    status: 'todo',
    estimatedMinutes: 60,
    actualMinutesSpent: 0,
    tags: ['Practice', 'DP'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    userId: 'demo-user-1',
    subjectId: 'sub-cs201',
    title: 'Dijkstra Algorithm vs Bellman-Ford: Core Properties',
    content: `# Dijkstra's Shortest Path Algorithm

Dijkstra's algorithm finds the shortest path between nodes in a graph with **non-negative edge weights**.

### Key Mechanics:
1. Initialize distance to starting vertex as \`0\`, and all other vertices as \`infinity\`.
2. Use a **Min-Heap (Priority Queue)** to greedily extract the unvisited vertex with the minimal known distance.
3. Relax all adjacent edges: \`if dist[u] + weight(u, v) < dist[v] then dist[v] = dist[u] + weight(u, v)\`.
4. Mark vertex as visited and repeat until priority queue is empty.

### Time & Space Complexity:
- **Time Complexity:** $O((V + E) \\log V)$ with binary heap.
- **Space Complexity:** $O(V)$ for distance array and visited set.

> **Crucial Rule:** Fails on graphs containing *negative edge weights*. In such cases, use **Bellman-Ford Algorithm** ($O(V \\times E)$).`,
    tags: ['Algorithms', 'Graphs', 'Shortest Path'],
    isFavorite: true,
    aiSummary: "Dijkstra's greedy shortest-path algorithm operates on non-negative weighted graphs in O((V + E) log V) using a Min-Heap. Negative weights require Bellman-Ford instead.",
    keyConcepts: [
      { term: 'Edge Relaxation', definition: 'The process of updating the shortest distance to a vertex if a new path via another vertex is shorter.', importance: 'Crucial' },
      { term: 'Min-Heap', definition: 'Data structure allowing O(log V) extraction of the minimum distance candidate vertex.', importance: 'High' },
      { term: 'Negative Edge Failure', definition: 'Greedy choice property breaks when negative edge can reduce path cost later.', importance: 'Crucial' }
    ],
    quickReviewPoints: [
      'Always verify that edge weights >= 0 before applying Dijkstra.',
      'Binary heap implementation gives O((V + E) log V).',
      'Visited nodes are finalized and never revisited.'
    ],
    cheatSheetMarkdown: '| Feature | Dijkstra | Bellman-Ford |\n|---|---|---|\n| Complexity | O((V+E) log V) | O(V * E) |\n| Negative Weights | No | Yes (detects negative cycles) |\n| Data Structure | Priority Queue | Array / Iteration |',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-2',
    userId: 'demo-user-1',
    subjectId: 'sub-math240',
    title: 'Eigenvalues, Eigenvectors & Diagonalization Guide',
    content: `# Linear Algebra: Matrix Diagonalization

A square $n \\times n$ matrix $A$ is **diagonalizable** if and only if it has $n$ linearly independent eigenvectors.

### Computation Steps:
1. **Find Eigenvalues ($\\lambda$):** Solve the characteristic equation $\\det(A - \\lambda I) = 0$.
2. **Find Eigenvectors ($v$):** For each eigenvalue $\\lambda$, solve $(A - \\lambda I)v = 0$ to determine the basis for the eigenspace.
3. **Construct Transformation Matrices:**
   - Form matrix $P = [v_1, v_2, \\dots, v_n]$ from eigenvectors.
   - Form diagonal matrix $D$ with eigenvalues on the diagonal.
4. **Decomposition:** $A = P D P^{-1}$, which implies $A^k = P D^k P^{-1}$.

### Symmetric Matrices Theorem:
Every real symmetric matrix $A = A^T$ is **orthogonally diagonalizable**:
$A = Q D Q^T$ where $Q$ is an orthogonal matrix ($Q^{-1} = Q^T$).`,
    tags: ['Matrices', 'Eigenvalues', 'Linear Transformations'],
    isFavorite: true,
    aiSummary: "Matrix diagonalization decomposes A into P D P^-1 using linearly independent eigenvectors. Simplifies powers A^k dramatically.",
    keyConcepts: [
      { term: 'Characteristic Polynomial', definition: 'det(A - λI) = 0 whose roots are the eigenvalues of matrix A.', importance: 'Crucial' },
      { term: 'Geometric Multiplicity', definition: 'The dimension of the null space null(A - λI), representing independent eigenvectors for λ.', importance: 'High' },
      { term: 'Spectral Theorem', definition: 'Real symmetric matrices are always orthogonally diagonalizable with real eigenvalues.', importance: 'Crucial' }
    ],
    quickReviewPoints: [
      'Matrix is diagonalizable iff algebraic multiplicity equals geometric multiplicity for every eigenvalue.',
      'A^k computation becomes trivially D^k where diagonal entries are raised to power k.'
    ],
    cheatSheetMarkdown: 'Formula: A = P D P^-1 \nPowers: A^k = P D^k P^-1 \nSymmetric: A = Q D Q^T',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_SCHEDULES: StudySchedule[] = [
  {
    id: 'sch-1',
    userId: 'demo-user-1',
    subjectId: 'sub-cs201',
    title: 'Graph Algorithms & Dijkstra Coding Session',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    durationMinutes: 60,
    sessionType: 'Practice Problems',
    isCompleted: false,
    actionItems: ['Review priority queue heap implementation', 'Solve 3 graph shortest path problems'],
    notes: 'Focus on time complexity edge cases.',
  },
  {
    id: 'sch-2',
    userId: 'demo-user-1',
    subjectId: 'sub-math240',
    title: 'Eigenvalues & Orthogonal Basis Drill',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:30',
    durationMinutes: 45,
    sessionType: 'Theory / Reading',
    isCompleted: false,
    actionItems: ['Compute characteristic polynomial examples', 'Check geometric multiplicity conditions'],
  },
  {
    id: 'sch-3',
    userId: 'demo-user-1',
    subjectId: 'sub-chem302',
    title: 'Carbonyl Reaction Pathways Flashcards Review',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '16:00',
    durationMinutes: 50,
    sessionType: 'Revision & Flashcards',
    isCompleted: false,
    actionItems: ['Memorize Grignard reaction conditions', 'Draw mechanism for aldol condensation'],
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    userId: 'demo-user-1',
    subjectId: 'sub-cs201',
    topic: 'Graph Algorithms & Shortest Path',
    quizTitle: 'Dijkstra and Graph Traversal Mastery Test',
    description: 'Test your understanding of shortest path algorithms, priority queues, and complexity analysis.',
    difficulty: 'Medium',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    questions: [
      {
        id: 'q1',
        question: "Why does Dijkstra's algorithm fail when applied to a graph with negative edge weights?",
        options: [
          'It creates an infinite recursion loop in the recursion stack.',
          'The greedy assumption that a visited node has reached its minimal distance no longer holds.',
          'Priority queues cannot store negative numerical values.',
          'It always converts the graph into an undirected tree.'
        ],
        correctIndex: 1,
        explanation: "Dijkstra relies on greedy choice property: once a node is extracted from min-heap, its distance is considered finalized. A negative edge encountered later could lower the distance to an already finalized node.",
        hint: 'Think about when Dijkstra marks a node as finalized.'
      },
      {
        id: 'q2',
        question: "What is the tightest upper-bound time complexity of Dijkstra's algorithm using a Min-Heap (Binary Heap)?",
        options: [
          'O(V^2)',
          'O((V + E) log V)',
          'O(V * E)',
          'O(E log E + V^2)'
        ],
        correctIndex: 1,
        explanation: 'Each vertex is inserted and extracted from the heap in O(log V) time, and each edge relaxation takes O(log V) in a binary heap, giving O((V + E) log V).',
        hint: 'Consider the cost of heap insertions and edge relaxations.'
      },
      {
        id: 'q3',
        question: 'Which algorithm is best suited for single-source shortest paths on a Directed Acyclic Graph (DAG)?',
        options: [
          'Topological Sort + Linear Edge Relaxation in O(V + E)',
          'Floyd-Warshall Algorithm in O(V^3)',
          'Kruskal Minimum Spanning Tree in O(E log E)',
          'Breadth-First Search without weights'
        ],
        correctIndex: 0,
        explanation: 'Because a DAG has no cycles, relaxing edges in topological order computes shortest paths in linear O(V + E) time, even with negative weights!',
        hint: 'Can we order DAG vertices such that all edges point forward?'
      }
    ]
  }
];

export const INITIAL_STUDY_LOGS: StudyLog[] = [
  {
    id: 'log-1',
    userId: 'demo-user-1',
    subjectId: 'sub-cs201',
    subjectName: 'Data Structures & Algorithms',
    taskOrTopicTitle: 'Graph Traversal & BFS/DFS Trees',
    durationMinutes: 50,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'Deep Focus',
  },
  {
    id: 'log-2',
    userId: 'demo-user-1',
    subjectId: 'sub-math240',
    subjectName: 'Linear Algebra & Matrices',
    taskOrTopicTitle: 'Eigenvector Orthogonality Proofs',
    durationMinutes: 45,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'Pomodoro',
  },
  {
    id: 'log-3',
    userId: 'demo-user-1',
    subjectId: 'sub-chem302',
    subjectName: 'Organic Chemistry II',
    taskOrTopicTitle: 'Aldol Reactions & Mechanisms',
    durationMinutes: 35,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'Quick Revision',
  },
  {
    id: 'log-4',
    userId: 'demo-user-1',
    subjectId: 'sub-cs201',
    subjectName: 'Data Structures & Algorithms',
    taskOrTopicTitle: 'Dijkstra Implementation',
    durationMinutes: 60,
    date: new Date().toISOString().split('T')[0],
    type: 'Deep Focus',
  }
];

export const INITIAL_QUIZ_RESULTS: QuizResult[] = [
  {
    id: 'res-1',
    userId: 'demo-user-1',
    quizId: 'quiz-1',
    quizTitle: 'Dijkstra and Graph Traversal Mastery Test',
    subjectName: 'Data Structures & Algorithms',
    score: 3,
    totalQuestions: 3,
    percentage: 100,
    answers: [
      { questionId: 'q1', selectedIndex: 1, isCorrect: true },
      { questionId: 'q2', selectedIndex: 1, isCorrect: true },
      { questionId: 'q3', selectedIndex: 0, isCorrect: true }
    ],
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
