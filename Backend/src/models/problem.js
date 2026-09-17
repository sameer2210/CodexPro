import mongoose from 'mongoose';
const { Schema } = mongoose;

const ProblemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    tags: {
      type: [String],
      enum: [
        'array',
        'string',
        'linkedList',
        'stack',
        'queue',
        'hashmap',
        'set',
        'tree',
        'graph',
        'binary search',
        'binary tree',
        'binary search tree',
        'sorting',
        'searching',
        'recursion',
        'backtracking',
        'greedy',
        'dynamic programming',
        'dp',
        'two pointers',
        'sliding window',
        'expand around center',
        'heap',
        'priority queue',
        'AVL tree',
        'red-black tree',
        'B-tree',
        'segment tree',
        'Fenwick tree',
        'trie',
        'disjoint set union',
        'bit manipulation',
        'bitwise operations',
        'math',
        'number manipulation',
        'number theory',
        'geometry',
        'combinatorics',
        'probability',
        'function',
        'loop',
        'hashing',
        'combinatorial optimization',
        'game theory',
        'data structures',
        'algorithms',
        'optimization',
        'machine learning',
        'artificial intelligence',
        'natural language processing',
        'computer vision',
        'deep learning',
        'reinforcement learning',
        'networking',
        'security',
        'cryptography',
        'parallel processing',
        'distributed systems',
        'conditional',
        'condition',
        'digits',
        'parsing',
        'explanation',
      ],
      required: true,
    },
    visibleTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          required: true,
        },
      },
    ],
    hiddenTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
      },
    ],
    startCode: [
      {
        language: {
          type: String,
          required: true,
        },
        initialCode: {
          type: String,
          required: true,
        },
      },
    ],
    referenceSolution: [
      {
        language: {
          type: String,
          required: true,
        },
        completeCode: {
          type: String,
          required: true,
        },
        default: [],
      },
    ],
    secureUrl: {
      type: String,
      required: false,
    },
    thumbnailUrl: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: false,
    },
    problemCreator: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true }
);

const Problem = mongoose.models.problem || mongoose.model('problem', ProblemSchema);
export default Problem;
