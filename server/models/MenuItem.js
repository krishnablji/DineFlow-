const mongoose = require('mongoose');

const CustomizationOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
});

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Starters', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    videoUrl: {
      type: String,
      default: '', // Short chef prep teaser video URL
    },
    dietaryTags: [
      {
        type: String,
        enum: ['Veg', 'Vegan', 'Gluten-Free', 'Non-Veg', 'Chef Special', 'Nut-Free', 'Dairy-Free'],
      },
    ],
    spiceLevels: {
      type: [String],
      default: ['Mild', 'Medium', 'Hot', 'Extra Spicy'],
    },
    customizations: [CustomizationOptionSchema], // e.g. Extra Truffle Oil, Parmesan Crust, Garlic Dip
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTimeMinutes: {
      type: Number,
      default: 15,
    },
    calories: {
      type: Number,
      default: 350,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 42,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MenuItem', MenuItemSchema);
