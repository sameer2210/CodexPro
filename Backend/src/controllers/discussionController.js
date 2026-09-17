import { getIO } from '../config/socket.js';
import Comment from '../models/comment.js';
import Discussion from '../models/discussion.js';
import User from '../models/user.js';

export const createDiscussion = async (req, res) => {
  try {
    const { title, content, community, tags } = req.body;
    const userId = req.user?._id || req.user?.id || req.result?._id || req.result?.id;

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
    const { community, tag, sort, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (community) query.community = community;
    if (tag) query.tags = { $in: [tag] };
    if (search) query.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { views: -1 };
    if (sort === 'mostUpvoted') sortOption = { 'upvotes.length': -1 };

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

export const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;

    await Discussion.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const discussion = await Discussion.findById(id)
      .populate('author', 'name email profileImage')
      .lean();

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const comments = await Comment.find({ discussion: id, parentComment: null })
      .populate('author', 'name email profileImage')
      .sort({ createdAt: -1 })
      .lean();

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'name email profileImage')
          .sort({ createdAt: 1 })
          .lean();
        return { ...comment, replies };
      })
    );

    discussion.comments = commentsWithReplies;

    return res.status(200).json({
      success: true,
      discussion,
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const comments = await Comment.find({ discussion: discussionId, parentComment: null })
      .populate('author', 'name email profileImage')
      .sort({ createdAt: -1 })
      .lean();

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'name email profileImage')
          .sort({ createdAt: 1 })
          .lean();
        return { ...comment, replies };
      })
    );

    return res.status(200).json(commentsWithReplies);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user?._id?.toString() || req.result?._id?.toString();

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this discussion' });
    }

    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.tags = tags || discussion.tags;
    discussion.updatedAt = Date.now();

    await discussion.save();
    await discussion.populate('author', 'name email profileImage');

    try {
      const io = getIO();
      io.to(`discussion:${id}`).emit('update-discussion', discussion);
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Discussion updated successfully',
      discussion,
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id?.toString() || req.result?._id?.toString();
    const userRole = req.user?.role || req.result?.role;

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this discussion' });
    }

    await Comment.deleteMany({ discussion: id });
    await Discussion.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user?._id || req.result?._id;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const comment = new Comment({
      content,
      author: userId,
      discussion: discussionId,
      parentComment: parentComment || null,
    });

    await comment.save();
    await comment.populate('author', 'name email profileImage');

    try {
      const io = getIO();
      io.to(`discussion:${discussionId}`).emit('new-comment', comment);
    } catch (e) {}

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id?.toString() || req.result?._id?.toString();

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this comment' });
    }

    comment.content = content;
    comment.updatedAt = Date.now();

    await comment.save();
    await comment.populate('author', 'name email profileImage');

    try {
      const io = getIO();
      io.to(`discussion:${comment.discussion}`).emit('update-comment', comment);
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id?.toString() || req.result?._id?.toString();
    const userRole = req.user?.role || req.result?.role;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    const discussionId = comment.discussion;
    await Comment.deleteMany({ parentComment: commentId });
    await Comment.findByIdAndDelete(commentId);

    try {
      const io = getIO();
      io.to(`discussion:${discussionId}`).emit('delete-comment', {
        commentId,
        discussionId,
      });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const voteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user?._id?.toString() || req.result?._id?.toString();

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ success: false, message: 'Invalid vote type' });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const hasUpvoted = discussion.upvotes.map(v => v.toString()).includes(userId);
    const hasDownvoted = discussion.downvotes.map(v => v.toString()).includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        discussion.upvotes = discussion.upvotes.filter((vId) => vId.toString() !== userId);
      } else {
        discussion.upvotes.push(userId);
        if (hasDownvoted) {
          discussion.downvotes = discussion.downvotes.filter((vId) => vId.toString() !== userId);
        }
      }
    }

    if (voteType === 'downvote') {
      if (hasDownvoted) {
        discussion.downvotes = discussion.downvotes.filter((vId) => vId.toString() !== userId);
      } else {
        discussion.downvotes.push(userId);
        if (hasUpvoted) {
          discussion.upvotes = discussion.upvotes.filter((vId) => vId.toString() !== userId);
        }
      }
    }

    await discussion.save();

    try {
      const io = getIO();
      if (io) {
        io.to(`discussion:${id}`).emit('discussion-voted', {
          discussionId: id,
          upvotes: discussion.upvotes,
          downvotes: discussion.downvotes,
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      upvotes: discussion.upvotes,
      downvotes: discussion.downvotes,
    });
  } catch (error) {
    console.error('Error voting on discussion:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body;
    const userId = req.user?._id?.toString() || req.result?._id?.toString();

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ success: false, message: 'Invalid vote type' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const hasUpvoted = comment.upvotes.map(v => v.toString()).includes(userId);
    const hasDownvoted = comment.downvotes.map(v => v.toString()).includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        comment.upvotes = comment.upvotes.filter((vId) => vId.toString() !== userId);
      } else {
        comment.upvotes.push(userId);
        if (hasDownvoted) {
          comment.downvotes = comment.downvotes.filter((vId) => vId.toString() !== userId);
        }
      }
    }

    if (voteType === 'downvote') {
      if (hasDownvoted) {
        comment.downvotes = comment.downvotes.filter((vId) => vId.toString() !== userId);
      } else {
        comment.downvotes.push(userId);
        if (hasUpvoted) {
          comment.upvotes = comment.upvotes.filter((vId) => vId.toString() !== userId);
        }
      }
    }

    await comment.save();

    try {
      const io = getIO();
      if (io) {
        io.to(`discussion:${comment.discussion}`).emit('comment-voted', {
          commentId,
          upvotes: comment.upvotes,
          downvotes: comment.downvotes,
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
    });
  } catch (error) {
    console.error('Error voting on comment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  getComments,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  updateComment,
  deleteComment,
  voteDiscussion,
  voteComment,
};