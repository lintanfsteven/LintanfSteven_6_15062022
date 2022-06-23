const Sauce = require('../models/Sauce');
const fs = require('fs');

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

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    sauce.findOne({ _id: req.params.id })
        .then(newSauce => {
            let i = 0;
            let tabLikes = []; let tabDislikes = [];
            let already_liked = 0; let already_disliked = 0;
            let type_like = req.body.like;
            let user_id = req.body.userId;
            if(newSauce.usersLiked) {
                tabLikes = JSON.parse(newSauce.usersLiked);
                while(i < tabLikes.length) {
                    if(tabLikes[i] == user_id) { 
                        if(type_like == 0 || type_like == -1) {
                            tabLikes.splice(i, 1); 
                            newSauce.likes --;
                        }
                        already_liked = 1;
                    }
                    i ++;
                }
            }
            if(newSauce.usersDisliked) {
                tabDislikes = JSON.parse(newSauce.usersDisliked); i = 0;
                while(i < tabDislikes.length) {
                    if(tabDislikes[i] == user_id) { 
                        if(type_like == 0 || type_like == 1) {
                            tabDislikes.splice(i, 1); 
                            newSauce.dislikes --;
                        }
                        already_disliked = 1;
                    }
                    i ++;
                }
            }

            if(type_like == 1 && already_liked == 0) {
                tabLikes.push(user_id);
                newSauce.likes ++; 
            }
            if(type_like == -1 && already_disliked == 0) {
                tabDislikes.push(user_id);
                newSauce.dislikes ++; 
            }

            sauce.updateOne({ _id: req.params.id }, { 
                    likes: newSauce.likes, 
                    dislikes: newSauce.dislikes, 
                    usersLiked: JSON.stringify(tabLikes), 
                    usersDisliked: JSON.stringify(tabDislikes)
                })
                .then(() => res.status(200).json({ message: 'Updated ! '}))
                .catch(error => res.status(400).json({ error }));

        })
        .catch(error => res.status(500).json({ error }));
}; 