const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: '',
        usersDisliked: ''
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        { 
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    if (req.body.like === 1) {
        Sauce.updateOne({ _id: req.params.id },
            {
                $inc: {
                    likes: 1,
                },
                $push: {
                    usersLiked: req.body.userId,
                },
            })
            .then(() =>
                res.status(201).json({
                    message: "Sauce likée !",
                })
            )
            .catch((error) =>
                res.status(400).json({ error, }));
    }

    if (req.body.like === -1) {
        Sauce.updateOne(
            {
                _id: req.params.id,
            },
            {
                $inc: {
                    dislikes: 1,
                },
                $push: {
                    usersDisliked: req.body.userId,
                },
            }
        )
            .then(() =>
                res.status(201).json({
                    message: "Sauce dislikée !",
                })
            )
            .catch((error) =>
                res.status(400).json({
                    error,
                })
            );
    }

    if (req.body.like === 0) {
        Sauce.findOne({
            _id: req.params.id,
        }).then((sauce) => {
            if (sauce.usersLiked.includes(req.body.userId)) {
                Sauce.updateOne(
                    {
                        _id: req.params.id,
                    },
                    {
                        $inc: {
                            likes: -1,
                        },
                        $pull: {
                            usersLiked: req.body.userId,
                        },
                    }
                )
                    .then(() =>
                        res.status(200).json({
                            message: "Le like a été annulé !",
                        })
                    )
                    .catch((error) =>
                        res.status(400).json({
                            error,
                        })
                    );
            }
            if (sauce.usersDisliked.includes(req.body.userId)) {
                Sauce.updateOne(
                    {
                        _id: req.params.id,
                    },
                    {
                        $inc: {
                            dislikes: -1,
                        },
                        $pull: {
                            usersDisliked: req.body.userId,
                        },
                    }
                )
                    .then(() =>
                        res.status(200).json({
                            message: "Le dislike a été annulé !",
                        })
                    )
                    .catch((error) =>
                        res.status(400).json({
                            error,
                        })
                    );
            }
        });
    }
};