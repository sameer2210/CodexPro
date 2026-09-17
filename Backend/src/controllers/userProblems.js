import Problem from '../models/problem.js';
import SolutionVideo from '../models/solutionVideo.js';
import Submission from '../models/submission.js';
import User from '../models/user.js';
import { getLanguageById, SubmitBatch, submitToken } from '../services/problemUtility.js';

export const createProblem = async (req, res) => {
  const { visibleTestCases, referenceSolution } = req.body;
  try {
    for (const { language, completeCode } of referenceSolution) {
      if (!language || !completeCode) {
        return res.status(400).send('Missing language or completeCode in referenceSolution.');
      }

      const languageId = getLanguageById(language);

      const submission = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
      }));
      const submitResult = await SubmitBatch(submission);
      if (!submitResult || !Array.isArray(submitResult)) {
        return res.status(500).send('Judge0 submission failed or no result returned.');
      }

      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      for (let i = 0; i < testResult.length; i++) {
        const test = testResult[i];
        const statusId = test.status?.id || test.status_id;
        const expectedOutput = visibleTestCases[i].output;
        const actualOutput = test.stdout;

        const normalizedExpected = expectedOutput?.trim() || '';
        const normalizedActual = actualOutput?.trim() || '';

        if (statusId !== 3 || normalizedExpected !== normalizedActual) {
          const failedTestCase = visibleTestCases[i];
          return res.status(400).json({
            message: `Reference solution for ${language} failed on a visible test case.`,
            details: {
              language,
              testCase: {
                input: failedTestCase.input,
                expectedOutput: failedTestCase.output,
              },
              result: {
                status: test.status,
                stdout: test.stdout,
                stderr: test.stderr,
                actualOutput: normalizedActual,
                expectedOutput: normalizedExpected,
                outputMatch: normalizedExpected === normalizedActual,
              },
            },
          });
        }
      }
    }

    await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).send('Problem Created Successfully');
  } catch (err) {
    res.status(401).send('Error Occurred: ' + err.message);
  }
};

export const updateProblem = async (req, res) => {
  const { id } = req.params;
  const { visibleTestCases, referenceSolution } = req.body;

  try {
    if (!id) return res.status(404).send('Id is Missing');

    const getProblem = await Problem.findById(id);
    if (!getProblem) {
      return res.status(403).send('Problem is Missing');
    }

    for (const { language, completeCode } of referenceSolution) {
      if (!language || !completeCode) {
        return res.status(400).send('Missing language or completeCode in referenceSolution.');
      }

      const languageId = getLanguageById(language);

      const submission = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
      }));

      const submitResult = await SubmitBatch(submission);

      if (!submitResult || !Array.isArray(submitResult)) {
        return res.status(500).send('Judge0 submission failed or no result returned.');
      }

      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      for (let i = 0; i < testResult.length; i++) {
        const test = testResult[i];
        const statusId = test.status?.id || test.status_id;
        const expectedOutput = visibleTestCases[i].output;
        const actualOutput = test.stdout;

        const normalizedExpected = expectedOutput?.trim() || '';
        const normalizedActual = actualOutput?.trim() || '';

        if (statusId !== 3 || normalizedExpected !== normalizedActual) {
          return res
            .status(400)
            .send(
              `Reference solution for ${language} failed on test case ${i + 1}. Expected: "${normalizedExpected}", Got: "${normalizedActual}"`
            );
        }
      }

      const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
      return res.status(200).send(newProblem);
    }
  } catch (err) {
    res.status(403).send('Error Occurred: ' + err.message);
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(404).send('Id is Missing');

    const getProblem = await Problem.findById(id);
    if (!getProblem) {
      return res.status(403).send('Problem is Missing');
    }

    const deleted = await Problem.findByIdAndDelete(id);
    if (!deleted) return res.status(500).send('Problem is Missing Cannot be deleted');

    res.status(200).send('Problem Deleted Successfully');
  } catch (err) {
    res.status(404).send('Error Occurred: ' + err.message);
  }
};

export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.result._id;

    if (!id) return res.status(403).send('Id is Missing');

    const getProblem = await Problem.findById(id).select(
      'title description difficulty tags visibleTestCases startCode referenceSolution secureUrl thumbnailUrl duration'
    );

    if (!getProblem) return res.status(403).send('Problem is Missing');

    const video = await SolutionVideo.findOne({ problemId: id, userId });

    let videoData = null;
    if (video) {
      videoData = {
        secureUrl: video.secureUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
      };
    }

    const responseData = {
      ...getProblem.toObject(),
      video: videoData,
    };

    res.status(200).send(responseData);
  } catch (err) {
    console.error('Error fetching problem by ID:', err);
    res.status(500).send('Error Occurred: ' + err.message);
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const getProblems = await Problem.find({}).select('_id title tags difficulty');

    if (!getProblems) return res.status(403).send('Problems are Missing');

    res.status(200).send(getProblems);
  } catch (err) {
    res.status(500).send('Error Occurred: ' + err.message);
  }
};

export const problemsSolvedByUser = async (req, res) => {
  try {
    const userId = req.result._id;

    const user = await User.findById(userId).populate({
      path: 'problemSolved',
      select: '_id title difficulty tags',
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      problems: user.problemSolved,
    });
  } catch (err) {
    console.error('problemsSolvedByUser: Error occurred:', err);
    res.status(500).json({
      success: false,
      message: 'Error occurred while fetching solved problems',
      error: err.message,
    });
  }
};

export const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submission.find({ userId, problemId });

    res.status(200).send(ans);
  } catch (err) {
    res.status(403).send('Error Occurred: ' + err.message);
  }
};

export const getProfileProblemsSolved = async (req, res) => {
  try {
    const userId = req.result._id;

    const submissions = await Submission.find({
      userId,
      status: 'Accepted',
    }).select('problemId createdAt -_id');

    const activity = submissions.map((submission) => ({
      date: submission.createdAt,
      count: 1,
    }));

    const aggregatedActivity = activity.reduce((acc, curr) => {
      const date = new Date(curr.date);
      const offset = 5.5 * 60 * 60 * 1000;
      const adjustedDate = new Date(date.getTime() + offset);
      const dateStr = adjustedDate.toISOString().split('T')[0];

      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, count: 0 };
      }
      acc[dateStr].count += 1;
      return acc;
    }, {});

    res.status(200).json({
      count: submissions.length,
      activity: Object.values(aggregatedActivity),
    });
  } catch (err) {
    console.error('Error in getProfileProblemsSolved:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getProfileAllProblems = async (req, res) => {
  try {
    const userId = req.result._id;

    const allProblems = await Problem.find({}).select('_id title difficulty tags');

    const solvedSubmissions = await Submission.find({
      userId,
      status: 'Accepted',
    });
    const solvedProblemIds = [...new Set(solvedSubmissions.map((s) => s.problemId))];

    const attemptingSubmissions = await Submission.find({
      userId,
      status: { $ne: 'Accepted' },
    });
    const attemptingProblemIds = [...new Set(attemptingSubmissions.map((s) => s.problemId))];

    const problemsWithStatus = allProblems.map((problem) => {
      const isSolved = solvedProblemIds.some((id) => id.equals(problem._id));
      const isAttempting = !isSolved && attemptingProblemIds.some((id) => id.equals(problem._id));
      return {
        ...problem.toObject(),
        isSolved,
        isAttempting,
      };
    });

    const totalProblems = problemsWithStatus.length;
    const solvedCount = problemsWithStatus.filter((p) => p.isSolved).length;
    const unsolvedCount = totalProblems - solvedCount;
    const easy = problemsWithStatus.filter((p) => p.difficulty === 'easy').length;
    const medium = problemsWithStatus.filter((p) => p.difficulty === 'medium').length;
    const hard = problemsWithStatus.filter((p) => p.difficulty === 'hard').length;
    const attempting = problemsWithStatus.filter((p) => p.isAttempting).length;

    res.status(200).json({
      totalProblems,
      solvedCount,
      unsolvedCount,
      easy,
      medium,
      hard,
      attempting,
      problems: problemsWithStatus,
    });
  } catch (err) {
    console.error('Error in getProfileAllProblems:', err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  createProblem,
  updateProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  problemsSolvedByUser,
  submittedProblem,
  getProfileAllProblems,
  getProfileProblemsSolved,
};
