const Review = require('../models/Review');
const Product = require('../models/Product');

exports.createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = await Review.findOne({ productId, userId: req.user._id });
    if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

    const review = await Review.create({
      productId,
      userId: req.user._id,
      rating: Number(rating),
      comment
    });

    const reviews = await Review.find({ productId });
    product.numReviews = reviews.length;
    product.ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await product.save();

    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const productId = review.productId;
    await review.deleteOne();

    const product = await Product.findById(productId);
    if (product) {
      const remainingReviews = await Review.find({ productId });
      product.numReviews = remainingReviews.length;
      product.ratings = remainingReviews.length > 0 
        ? remainingReviews.reduce((acc, item) => item.rating + acc, 0) / remainingReviews.length 
        : 0;
      await product.save();
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
