import Contest from '../models/contest.js';
import ContestSubmission from '../models/contestSubmission.js';
import Problem from '../models/problem.js';
import User from '../models/user.js';
import { getLanguageById, SubmitBatch, submitToken } from '../services/problemUtility.js';
import { updateAndEmitLeaderboard } from './leaderboardController.js';

const calculateScore = (problem, testCasesPassed) => {
  if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
    return 0;
  }
  const difficulty = problem.difficulty.toLowerCase();
  let baseScore = 0;
  switch (difficulty) {
    case 'easy':
      baseScore = 10;
      break;
    case 'medium':
      baseScore = 20;
      break;
    case 'hard':
      baseScore = 30;
      break;
    default:
      baseScore = 10;
  }
  return (baseScore / problem.hiddenTestCases.length) * testCasesPassed;
};

export const submitContestCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const { contestId, problemId } = req.params;
    const { code, language } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Code is required',
      });
    }

    let normalizedLanguage = language?.toLowerCase();
    if (normalizedLanguage === 'cpp') {
      normalizedLanguage = 'c++';
    }

    if (!normalizedLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Language is required',
      });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem || !contest.problems.includes(problemId)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in this contest',
      });
    }

    const submission = await ContestSubmission.create({
      userId,
      contestId,
      problemId,
      code,
      language: normalizedLanguage,
      status: 'Processing',
      totalTestCases: problem.hiddenTestCases?.length || 0,
      submissionTime: new Date(),
    });

    const languageId = getLanguageById(normalizedLanguage);
    if (!languageId) {
      submission.status = 'Error';
      submission.errorMessage = 'Unsupported language';
      await submission.save();
      return res.status(400).json({
        success: false,
        message: 'Unsupported programming language',
      });
    }

    const testCases = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
    }));

    const submitResult = await SubmitBatch(testCases);
    if (!submitResult?.length) {
      throw new Error('Failed to submit to judge');
    }

    const resultTokens = submitResult.map((value) => value.token);
    const testResults = await submitToken(resultTokens);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'Accepted';
    let errorMessage = null;

    for (let i = 0; i < testResults.length; i++) {
      const result = testResults[i];
      const statusId = result.status?.id || result.status_id;
      const expectedOutput = problem.hiddenTestCases[i]?.output;
      const actualOutput = result.stdout;

      const normalizedExpected = expectedOutput?.trim() || '';
      const normalizedActual = actualOutput?.trim() || '';

      if (statusId === 3) {
        if (normalizedExpected === normalizedActual) {
          testCasesPassed++;
          runtime += parseFloat(result.time || 0);
          memory = Math.max(memory, parseInt(result.memory || 0));
        } else {
          status = 'Wrong Answer';
          errorMessage = `Expected: ${normalizedExpected.substring(0, 50)}, Got: ${normalizedActual.substring(0, 50)}`;
          break;
        }
      } else {
        if (statusId === 4) {
          status = 'Wrong Answer';
          errorMessage = result.stderr || result.compile_output || 'Wrong Answer';
        } else if (statusId === 6) {
          status = 'Compilation Error';
          errorMessage = result.compile_output || result.stderr || 'Compilation Error';
        } else if (statusId === 5) {
          status = 'Time Limit Exceeded';
          errorMessage = 'Time Limit Exceeded';
        } else if ([7, 8, 9, 10, 11, 12].includes(statusId)) {
          status = 'Runtime Error';
          errorMessage = result.stderr || result.message || 'Runtime Error';
        } else {
          status = result.status?.description || 'Error';
          errorMessage = result.stderr || result.compile_output || result.message || 'Test case failed';
        }
        break;
      }
    }

    submission.status = status;
    submission.testCasesPassed = testCasesPassed;
    submission.runtime = runtime;
    submission.memory = memory;
    submission.errorMessage = errorMessage;
    submission.score = calculateScore(problem, testCasesPassed);
    await submission.save();

    if (status === 'Accepted') {
      const user = await User.findById(userId);
      if (user) {
        const totalProblemsInContest = contest.problems.length;
        const solvedProblems = await ContestSubmission.find({
          userId,
          contestId,
          status: 'Accepted',
        }).distinct('problemId');

        if (solvedProblems.length === totalProblemsInContest) {
          if (!user.contestsCompleted.some((c) => c.toString() === contestId)) {
            user.contestsCompleted.push(contestId);
            const today = new Date();
            const lastCompletion = user.lastContestCompletion ? new Date(user.lastContestCompletion) : null;

            if (lastCompletion) {
              const diffTime = Math.abs(today - lastCompletion);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays === 1) {
                user.streak = (user.streak || 0) + 1;
              } else if (diffDays > 1) {
                user.streak = 1;
              }
            } else {
              user.streak = 1;
            }
            user.lastContestCompletion = today;
          }
        }
        await user.save();
      }
    }

    updateAndEmitLeaderboard(contestId);

    return res.status(200).json({
      success: true,
      submission: {
        id: submission._id,
        status,
        testCasesPassed,
        totalTestCases: problem.hiddenTestCases.length,
        runtime,
        memory,
        errorMessage,
        score: submission.score,
      },
    });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while processing submission',
    });
  }
};

export const runContestCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const { contestId, problemId } = req.params;
    const { code, language } = req.body;

    if (!userId || !contestId || !problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }

    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (now < startTime) {
      return res.status(400).json({
        success: false,
        message: 'Contest has not started yet',
      });
    }

    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: 'Contest has ended',
      });
    }

    if (!contest.problems.includes(problemId)) {
      return res.status(400).json({
        success: false,
        message: 'Problem is not part of this contest',
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    let normalizedLanguage = language;
    if (language === 'cpp') {
      normalizedLanguage = 'c++';
    }

    const languageId = getLanguageById(normalizedLanguage);
    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language',
      });
    }

    const testCases = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
    }));

    const submitResult = await SubmitBatch(testCases);
    if (!submitResult || !Array.isArray(submitResult)) {
      return res.status(500).json({
        success: false,
        message: 'Code evaluation failed',
      });
    }

    const resultTokens = submitResult.map((value) => value.token);
    const testResults = await submitToken(resultTokens);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    const transformedTestCases = testResults.map((test, index) => {
      const statusId = test.status?.id || test.status_id;
      const expectedOutput = problem.visibleTestCases[index]?.output;
      const actualOutput = test.stdout;

      const normalizedExpected = expectedOutput?.trim() || '';
      const normalizedActual = actualOutput?.trim() || '';

      const passed = statusId === 3 && normalizedExpected === normalizedActual;

      if (passed) {
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, parseInt(test.memory || 0));
      } else {
        status = false;
        if (statusId === 3 && normalizedExpected !== normalizedActual) {
          errorMessage = 'Wrong Answer';
        } else {
          errorMessage = test.stderr || test.compile_output || 'Execution Error';
        }
      }

      return {
        passed,
        input: problem.visibleTestCases[index].input,
        expectedOutput: problem.visibleTestCases[index].output,
        actualOutput: test.stdout || test.output || '',
        error: test.stderr || test.compile_output || null,
        runtime: test.time ? parseFloat(test.time) * 1000 : null,
      };
    });

    res.status(200).json({
      success: status,
      testCases: transformedTestCases,
      testCasesPassed,
      totalTestCases: problem.visibleTestCases.length,
      runtime,
      memory,
      errorMessage,
    });
  } catch (error) {
    console.error('❌ Error running contest code:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserContestSubmissions = async (req, res) => {
  try {
    const userId = req.result._id;
    const { contestId, problemId } = req.params;

    if (!userId || !contestId || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const submissions = await ContestSubmission.find({
      userId,
      contestId,
      problemId,
    }).sort({ createdAt: -1 });

    const formattedSubmissions = submissions.map((sub) => ({
      id: sub._id,
      status: sub.status,
      language: sub.language,
      score: sub.score,
      runtime: sub.runtime,
      memory: sub.memory,
      testCasesPassed: sub.testCasesPassed,
      totalTestCases: sub.totalTestCases,
      submissionTime: sub.submissionTime || sub.createdAt,
      code: sub.code,
    }));

    res.status(200).json({
      success: true,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    console.error('❌ Error getting user contest submissions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  submitContestCode,
  runContestCode,
  getUserContestSubmissions,
};
