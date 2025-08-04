// controllers/noticeController.js
const Notice = require('../models/Notice');

// Get all notices
const getAllNotices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, type, status, priority } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const notices = await Notice.find(query)
      .populate('createdBy', 'name designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notice.countDocuments(query);

    res.json({
      success: true,
      data: notices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotices: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিশ লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get single notice
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'name designation');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'নোটিশ পাওয়া যায়নি'
      });
    }

    // Increment view count
    notice.views += 1;
    await notice.save();

    res.json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিশ লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Create new notice
const createNotice = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      validFrom,
      validTo,
      attachments,
      isPublic
    } = req.body;

    const notice = new Notice({
      title,
      content,
      type,
      priority,
      targetAudience,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validTo: validTo ? new Date(validTo) : null,
      attachments: attachments || [],
      isPublic: isPublic || false,
      createdBy: req.user.id, // Assuming user info is in req.user from auth middleware
      status: 'active'
    });

    await notice.save();
    await notice.populate('createdBy', 'name designation');

    res.status(201).json({
      success: true,
      message: 'নোটিশ সফলভাবে তৈরি করা হয়েছে',
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিশ তৈরি করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Update notice
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.validFrom) {
      updateData.validFrom = new Date(updateData.validFrom);
    }
    if (updateData.validTo) {
      updateData.validTo = new Date(updateData.validTo);
    }

    updateData.updatedAt = new Date();

    const notice = await Notice.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name designation');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'নোটিশ পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      message: 'নোটিশ সফলভাবে আপডেট করা হয়েছে',
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিশ আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Delete notice
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'নোটিশ পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      message: 'নোটিশ সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিশ মুছতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get public notices (for website)
const getPublicNotices = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const notices = await Notice.find({
      isPublic: true,
      status: 'active',
      $or: [
        { validTo: null },
        { validTo: { $gte: new Date() } }
      ],
      validFrom: { $lte: new Date() }
    })
    .populate('createdBy', 'name designation')
    .sort({ priority: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: notices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিশ লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get notices by type
const getNoticesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;

    const notices = await Notice.find({
      type,
      status: 'active',
      $or: [
        { validTo: null },
        { validTo: { $gte: new Date() } }
      ],
      validFrom: { $lte: new Date() }
    })
    .populate('createdBy', 'name designation')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: notices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিশ লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get notice statistics
const getNoticeStats = async (req, res) => {
  try {
    const totalNotices = await Notice.countDocuments();
    const activeNotices = await Notice.countDocuments({ status: 'active' });
    const publicNotices = await Notice.countDocuments({ isPublic: true });
    
    // Notices by type
    const noticesByType = await Notice.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Notices by priority
    const noticesByPriority = await Notice.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Recent notices (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentNotices = await Notice.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalNotices,
        activeNotices,
        publicNotices,
        recentNotices,
        noticesByType,
        noticesByPriority
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Toggle notice status
const toggleNoticeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'নোটিশ পাওয়া যায়নি'
      });
    }

    notice.status = notice.status === 'active' ? 'inactive' : 'active';
    await notice.save();

    res.json({
      success: true,
      message: `নোটিশ ${notice.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`,
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'নোটিশ স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

module.exports = {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  getPublicNotices,
  getNoticesByType,
  getNoticeStats,
  toggleNoticeStatus
};