import mongoose from 'mongoose';
import Contest from '../models/contest.js';
import Problem from '../models/problem.js';
import User from '../models/user.js';

export const createContest = async (req, res) => {
  try {
    let problems = req.body.problems;
    if (typeof problems === 'string') {
      try {
        problems = JSON.parse(problems);
      } catch (e) {
        // Keep as is
      }
    }
    if (!Array.isArray(problems)) {
      return res.status(400).json({ success: false, message: 'Problems must be an array' });
    }

    problems = problems.map((id) => new mongoose.Types.ObjectId(id));

    const contest = new Contest({
      name: req.body.name,
      description: req.body.description || '',
      problems: problems,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      createdBy: req.result._id,
      isPublic: req.body.isPublic,
      date: new Date(req.body.startTime).toISOString().split('T')[0],
    });

    await contest.save();
    res.status(201).json({ success: true, contest });
  } catch (error) {
    console.error('❌ Error creating contest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerForContest = async (req, res) => {
  try {
    const contestId = req.params.contestId;
    const userId = req.result._id;

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return res.status(400).json({ success: false, message: 'Invalid contest ID' });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    if (!contest.isPublic) {
      return res.status(403).json({ success: false, message: 'No access to this contest' });
    }

    if (contest.participants?.includes(userId)) {
      return res.status(200).json({ success: true, message: 'Already registered' });
    }

    const user = await User.findById(userId);
    if (user.contestsCompleted.some((c) => c.toString() === contestId)) {
      return res.status(400).json({ success: false, message: 'You have already completed this contest' });
    }

    contest.participants = contest.participants || [];
    contest.participants.push(userId);
    await contest.save();

    res.status(200).json({
      success: true,
      message: 'Registered successfully',
      contest: {
        id: contest._id,
        name: contest.name,
        startTime: contest.startTime,
        endTime: contest.endTime,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const validateContestAccess = async (req, res, next) => {
  try {
    const contestId = req.params.contestId;
    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    req.contest = contest;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error validating contest access' });
  }
};

export const getActiveContests = async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
      isPublic: true,
    }).populate('problems', 'title difficulty');

    res.json({ success: true, contests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().populate('problems');
    res.json(contests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems');
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    let userStatus = null;
    if (req.result && req.result._id) {
      const user = await User.findById(req.result._id);
      if (user) {
        const isRegistered = contest.participants.includes(user._id);
        const isCompleted = user.contestsCompleted.some((cId) => cId.toString() === contest._id.toString());
        userStatus = {
          isRegistered,
          isCompleted,
        };
      }
    }

    res.json({ contest, userStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateContest = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.startTime) {
      updateData.date = new Date(req.body.startTime).toISOString().split('T')[0];
    }

    const updated = await Contest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Contest not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteContest = async (req, res) => {
  try {
    const deleted = await Contest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Contest not found' });
    res.json({ message: 'Contest deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getContestStatus = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.result._id;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isRegistered = contest.participants.includes(user._id);
    const isCompleted = user.contestsCompleted.some((cId) => cId.toString() === contest._id.toString());

    res.json({
      success: true,
      status: {
        isRegistered,
        isCompleted,
      },
    });
  } catch (error) {
    console.error('Error fetching contest status:', error);
    res.status(500).json({ success: false, message: 'Error fetching contest status' });
  }
};

export const getProblemOfTheDay = async (req, res) => {
  try {
    const problems = await Problem.find();
    const randomIndex = Math.floor(Math.random() * problems.length);
    res.json(problems[randomIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTodayContest = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const contest = await Contest.findOne({ date: today });

    if (!contest) {
      return res.status(404).json({ error: 'No contest found for today' });
    }

    res.json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getContestProblems = async (req, res) => {
  try {
    const contestId = req.params.contestId;
    const contest = await Contest.findById(contestId).populate(
      'problems',
      '_id title difficulty description startCode visibleTestCases constraints'
    );
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }
    res.status(200).json({ success: true, problems: contest.problems });
  } catch (error) {
    console.error('❌ Error fetching contest problems:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContestProblem = async (req, res) => {
  try {
    const { contestId, problemId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (!contest.problems.includes(problemId)) {
      return res.status(404).json({ message: 'Problem not found in this contest' });
    }

    const problem = await Problem.findById(problemId).lean();
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ problem });
  } catch (err) {
    console.error('Error in getContestProblem:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find({}, '_id title');
    res.json({ success: true, problems });
  } catch (error) {
    console.error('Error fetching all problems:', error);
    res.status(500).json({ success: false, message: 'Error fetching all problems' });
  }
};

export default {
  createContest,
  registerForContest,
  validateContestAccess,
  getActiveContests,
  getAllContests,
  getContestById,
  updateContest,
  deleteContest,
  getContestStatus,
  getProblemOfTheDay,
  getTodayContest,
  getContestProblems,
  getContestProblem,
  getAllProblems,
};
