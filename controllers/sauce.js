const Sauce = require('../models/Sauce');
const fs = require('fs');

// to get all sauces displayed in menu
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

// to show a sauce features
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// to create a sauce 
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

// to modify a sauce features
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

// to delete a sauce (only its creator can)
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

// to (dis)like a sauce 
exports.likeSauce = (req, res, next) => {
    if (req.body.like === 1) {
        // if someone likes it
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

    // if someone dislikes it
    if (req.body.like === -1) {
        Sauce.updateOne({ _id: req.params.id, },
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

    // if you remove your like
    if (req.body.like === 0) {
        Sauce.findOne({ _id: req.params.id,})
            .then((sauce) => {
            if (sauce.usersLiked.includes(req.body.userId)) {
                Sauce.updateOne({ _id: req.params.id, },
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

            // if you remove your dislike
            if (sauce.usersDisliked.includes(req.body.userId)) {
                Sauce.updateOne({ _id: req.params.id, },
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