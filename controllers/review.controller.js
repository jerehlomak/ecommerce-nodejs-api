const Product = require('../models/product.model')
const Review = require('../models/review.model')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require('../utils')


const createReview = async (req, res) => {
    const { product: productId } = req.body
    console.log(req.body)
    // check if product with the above ID exists
    const isValidProduct = await Product.findOne({ _id: productId })
    if (!isValidProduct) {
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)
    }

    // check if the user already created a review for a particular product
    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId,
    })

    if (alreadySubmitted) {
        throw new CustomError.BadRequestError('Already submitted review for this product')
    }

    // from our authentication middleware
    req.body.user = req.user.userId
    const review = await Review.create(req.body)

    res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate({
        path: 'product',
        select: 'name company price'
    })
    .populate({
        path: 'user',
        select: 'name'
    })

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params
    const review = await Review.findOne({ _id: reviewId })

    if (!review) {
        throw new CustomError.NotFoundError(`No review with the id ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params

    const { rating, title, comment } = req.body

    const review = await Review.findOne({ _id: reviewId })
    if (!review) {
        throw new CustomError.NotFoundError(`No review with the id ${reviewId}`)
    }

    checkPermissions(req.user, review.user)

    // update values
    review.rating = rating
    review.title = title
    review.comment = comment

    await review.save()
    res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params
   
    const review = await Review.findOne({ _id: reviewId })

    if (!review) {
        throw new CustomError.NotFoundError(`No review with id ${reviewId}`)
    }

    checkPermissions(req.user, review.user)
    await review.remove()
    res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' })
}

// get all reviews of a particular product
const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params
    const reviews = await Review.find({ product: productId })
    res.status(StatusCodes.OK).json({
        reviews, count: reviews.length
    })
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
}