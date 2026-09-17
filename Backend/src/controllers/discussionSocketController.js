import { getIO } from '../config/socket.js';
import Comment from '../models/comment.js';
import Discussion from '../models/discussion.js';

export const createDiscussion = async (req, res) => {
  try {
    const { title, content, community, tags } = req.body;
    const userId = req.user?._id || req.result?._id;

    if (!title || !content || !community) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const discussion = new Discussion({
      title,
      content,
      author: userId,
      community,
      tags: tags || [],
    });

    await discussion.save();
    await discussion.populate('author', 'name email profileImage');

    try {
      const io = getIO();
      io.emit('new-discussion', discussion);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      discussion,
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDiscussions = async (req, res) => {
  try {
    const { community, tag, sortBy = 'newest', page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (community && community !== 'all') query.community = community;
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'popular') sortOption = { views: -1 };
    if (sortBy === 'mostUpvoted') sortOption = { 'upvotes.length': -1 };

    const discussions = await Discussion.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email profileImage')
      .lean();

    const discussionsWithCommentCount = await Promise.all(
      discussions.map(async (discussion) => {
        const commentCount = await Comment.countDocuments({ discussion: discussion._id });
        return { ...discussion, commentCount };
      })
    );

    const totalDiscussions = await Discussion.countDocuments(query);
    const totalPages = Math.ceil(totalDiscussions / limit);

    return res.status(200).json({
      success: true,
      discussions: discussionsWithCommentCount,
      pagination: {
        totalDiscussions,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default {
  createDiscussion,
  getDiscussions,
};