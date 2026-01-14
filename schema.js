const Joi = require('joi');

module.exports.listingSchema= Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        image: Joi.object({
            filename: Joi.string().optional(),
            url: Joi.string().allow("").optional(),
        }).optional(),
    }).required()
});


module.exports.reviewSchema= Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().min(5).required(),
    }).required(),
});

