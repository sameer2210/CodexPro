import { getIO } from '../config/socket.js';
import Problem from '../models/problem.js';
import Submission from '../models/submission.js';
import User from '../models/user.js';
import { getLanguageById, SubmitBatch, submitToken } from '../services/problemUtility.js';

export const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).send('Fields Are Missing');
    }

    if (language === 'cpp') language = 'c++';

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send('Problem not found');
    }

    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: 'Pending',
      totalTestCases: problem.hiddenTestCases.length,
    });

    const languageId = await getLanguageById(language);
    if (!languageId) {
      return res.status(404).send('Invalid Language Id');
    }

    if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This problem has no hidden test cases and cannot be submitted.',
      });
    }

    const referenceSolution = problem.referenceSolution.find(
      (rs) => rs.language.toLowerCase() === language.toLowerCase()
    );
    const startCode = problem.startCode.find((sc) => sc.language.toLowerCase() === language.toLowerCase());

    let finalCode = code;
    if (referenceSolution && startCode) {
      finalCode = referenceSolution.completeCode.replace(startCode.initialCode, code);
    }

    const submission = problem.hiddenTestCases.map((testcase) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: testcase.input,
    }));

    const submitResult = await SubmitBatch(submission);
    if (!submitResult || !Array.isArray(submitResult)) {
      return res.status(500).send('Judge0 submission failed or no result returned.');
    }

    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let errorMessage = null;
    let status = 'Accepted';

    for (let i = 0; i < testResult.length; i++) {
      const test = testResult[i];
      const statusId = test.status?.id || test.status_id;
      const expectedOutput = problem.hiddenTestCases[i]?.output;
      const actualOutput = test.stdout;

      const normalizedExpected = expectedOutput?.trim() || '';
      const normalizedActual = actualOutput?.trim() || '';

      if (statusId == 3) {
        if (normalizedExpected === normalizedActual) {
          testCasesPassed++;
          runtime = runtime + parseFloat(test.time || 0);
          memory = Math.max(memory, parseInt(test.memory || 0));
        } else {
          status = 'Wrong Answer';
          errorMessage = `Expected: ${normalizedExpected.substring(0, 50)}, Got: ${normalizedActual.substring(0, 50)}`;
          break;
        }
      } else {
        if (statusId == 4) {
          status = 'Wrong Answer';
          errorMessage = test.stderr || test.compile_output || 'Wrong Answer';
        } else if (statusId == 6) {
          status = 'Compilation Error';
          errorMessage = test.compile_output || test.stderr || 'Compilation Error';
        } else if (statusId == 5) {
          status = 'Time Limit Exceeded';
          errorMessage = 'Time Limit Exceeded';
        } else if ([7, 8, 9, 10, 11, 12].includes(statusId)) {
          status = 'Runtime Error';
          errorMessage = test.stderr || test.message || 'Runtime Error';
        } else {
          status = test.status?.description || 'Error';
          errorMessage = test.stderr || test.compile_output || test.message || 'Unknown Error';
        }
        break;
      }
    }

    submittedResult.status = status;
    submittedResult.runtime = runtime;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.memory = memory;
    submittedResult.errorMessage = errorMessage;

    await submittedResult.save();

    if (status === 'Accepted') {
      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $addToSet: { problemSolved: problemId } },
          { new: true }
        );
        if (updatedUser) {
          try {
            const io = getIO();
            if (io) {
              io.to(userId.toString()).emit('userStatsUpdate', { userId });
            }
          } catch (e) {}
        }
      } catch (userUpdateError) {
        console.error('submitCode: Error updating user solved problems:', userUpdateError);
      }
    }

    const accepted = status === 'Accepted';
    res.status(201).json({
      success: true,
      message: accepted ? 'Submission accepted' : 'Submission processed',
      accepted,
      totalTestCases: submittedResult.totalTestCases,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
    });
  } catch (err) {
    console.error('Error in submitCode:', err);
    res.status(500).send('Internal Server Error: ' + (err.message || err));
  }
};

export const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const { id } = req.params;
    const problemId = id;

    let { code, language } = req.body;
    if (language === 'cpp') language = 'c++';

    if (!userId || !problemId || !code || !language) return res.status(400).send('Fields Are Missing');

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).send('Problem not found');

    const languageId = await getLanguageById(language);
    if (!languageId) return res.status(404).send('Invalid Language Id');

    const referenceSolution = problem.referenceSolution.find(
      (rs) => rs.language.toLowerCase() === language.toLowerCase()
    );
    const startCode = problem.startCode.find((sc) => sc.language.toLowerCase() === language.toLowerCase());

    let finalCode = code;
    if (referenceSolution && startCode) {
      finalCode = referenceSolution.completeCode.replace(startCode.initialCode, code);
    }

    const submission = problem.visibleTestCases.map((testcase) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: testcase.input,
    }));

    const submitResult = await SubmitBatch(submission);
    if (!submitResult || !Array.isArray(submitResult)) {
      return res.status(500).send('Judge0 submission failed or no result returned.');
    }

    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (let i = 0; i < testResult.length; i++) {
      const test = testResult[i];
      const statusId = test.status?.id || test.status_id;
      const expectedOutput = problem.visibleTestCases[i]?.output;
      const actualOutput = test.stdout;

      const normalizedExpected = expectedOutput?.trim() || '';
      const normalizedActual = actualOutput?.trim() || '';

      if (statusId == 3) {
        if (normalizedExpected === normalizedActual) {
          testCasesPassed++;
          runtime = runtime + parseFloat(test.time || 0);
          memory = Math.max(memory, parseInt(test.memory || 0));
        } else {
          status = false;
          errorMessage = `Test case ${i + 1} failed: Expected "${normalizedExpected}", Got "${normalizedActual}"`;
        }
      } else {
        status = false;
        if (statusId == 4) {
          errorMessage = test.stderr || test.compile_output || 'Wrong Answer';
        } else if (statusId == 6) {
          errorMessage = test.compile_output || test.stderr || 'Compilation Error';
        } else if (statusId == 5) {
          errorMessage = 'Time Limit Exceeded';
        } else {
          errorMessage = test.stderr || test.compile_output || test.message || 'Runtime Error';
        }
      }
    }

    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime,
      memory,
      errorMessage,
    });
  } catch (err) {
    res.status(500).send('Internal Server Error: ' + err.message);
  }
};

export default { submitCode, runCode };
