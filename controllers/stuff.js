const Thing = require('../models/Thing');
const fs = require('fs');

exports.createThing = (req, res, next) => {
    const thingObject = JSON.parse(req.body.thing);
    delete thingObject._id
    const thing = new Thing({
        ...thingObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: '',
        usersDisliked: ''
    });
    thing.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifyThing = (req, res, next) => {
    const thingObject = req.file ?
        { 
            ...JSON.parse(req.body.thing),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            const filename = thing.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Thing.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => res.status(200).json(thing))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllThings = (req, res, next) => {
    Thing.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(400).json({ error }));
};

exports.likeThing = (req, res, next) => {
    thing.findOne({ _id: req.params.id })
        .then(newThing => {
            let i = 0;
            let tabLikes = []; let tabDislikes = [];
            let already_liked = 0; let already_disliked = 0;
            let type_like = req.body.like;
            let user_id = req.body.userId;
            if(newThing.usersLiked) {
                tabLikes = JSON.parse(newThing.usersLiked);
                while(i < tabLikes.length) {
                    if(tabLikes[i] == user_id) { 
                        if(type_like == 0 || type_like == -1) {
                            tabLikes.splice(i, 1); 
                            newThing.likes --;
                        }
                        already_liked = 1;
                    }
                    i ++;
                }
            }
            if(newThing.usersDisliked) {
                tabDislikes = JSON.parse(newThing.usersDisliked); i = 0;
                while(i < tabDislikes.length) {
                    if(tabDislikes[i] == user_id) { 
                        if(type_like == 0 || type_like == 1) {
                            tabDislikes.splice(i, 1); 
                            newThing.dislikes --;
                        }
                        already_disliked = 1;
                    }
                    i ++;
                }
            }

            if(type_like == 1 && already_liked == 0) {
                tabLikes.push(user_id);
                newThing.likes ++; 
            }
            if(type_like == -1 && already_disliked == 0) {
                tabDislikes.push(user_id);
                newThing.dislikes ++; 
            }

            sauce.updateOne({ _id: req.params.id }, { 
                    likes: newThing.likes, 
                    dislikes: newThing.dislikes, 
                    usersLiked: JSON.stringify(tabLikes), 
                    usersDisliked: JSON.stringify(tabDislikes)
                })
                .then(() => res.status(200).json({ message: 'Updated ! '}))
                .catch(error => res.status(400).json({ error }));

        })
        .catch(error => res.status(500).json({ error }));
}; 