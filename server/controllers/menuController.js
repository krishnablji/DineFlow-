const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const { uploadStreamToCloudinary } = require('../config/cloudinary');
const { emitItemStockUpdate } = require('../sockets/socketHandler');

// @desc    Get all menu items with search, category & dietary tag filtering
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const { category, tag, search, availableOnly } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (tag && tag !== 'All') {
      query.dietaryTags = tag;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new menu item (Manager Menu Studio)
// @route   POST /api/menu
// @access  Private (Manager only)
const createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      description,
      imageUrl,
      videoUrl,
      dietaryTags,
      spiceLevels,
      customizations,
      preparationTimeMinutes,
      isAvailable,
      calories,
    } = req.body;

    const item = await MenuItem.create({
      name,
      category,
      price: Number(price),
      description,
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      videoUrl: videoUrl || '',
      dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : dietaryTags ? [dietaryTags] : [],
      spiceLevels: spiceLevels || ['Mild', 'Medium', 'Hot', 'Extra Spicy'],
      customizations: customizations || [],
      preparationTimeMinutes: preparationTimeMinutes || 15,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      calories: calories || 350,
    });

    res.status(201).json({
      success: true,
      data: item,
      message: `Dish "${item.name}" created successfully in Menu Studio.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Manager only)
const updateMenuItem = async (req, res, next) => {
  try {
    let item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: item,
      message: `Dish "${item.name}" updated successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Manager only)
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Dish "${item.name}" removed from menu.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload media (Image or Video) for dish
// @route   POST /api/menu/upload
// @access  Private (Manager only)
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a file to upload.',
      });
    }

    const isVideo = req.file.mimetype.startsWith('video');
    const resourceType = isVideo ? 'video' : 'image';

    const result = await uploadStreamToCloudinary(req.file.buffer, resourceType);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      mediaType: resourceType,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/menu/categories/all
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle menu item availability (Item 86 / Restock)
// @route   PATCH /api/menu/:id/stock
// @access  Public / Staff
const toggleStockAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    item.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !item.isAvailable;
    await item.save();

    // Broadcast instantly to all Waiters, Kitchen, and Manager
    emitItemStockUpdate({
      itemId: item._id,
      name: item.name,
      isAvailable: item.isAvailable,
    });

    res.status(200).json({
      success: true,
      message: `"${item.name}" is now marked as ${item.isAvailable ? 'In Stock' : 'Out of Stock'}.`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMedia,
  getCategories,
  toggleStockAvailability,
};
