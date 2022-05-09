const { Thought, User } = require('../models');

//thoughtData - data base
//setting up GET/POST/PUT/ADD/DELETE Routes
//Don't need runValidators but recommended as best practice

const thoughtController = {
//GET all thoughts
getAllThoughts(req, res) {
    Thought.find({})
    .select('-__v')
    .then(thoughtData => res.json(thoughtData))
    .catch(err => res.status(400).json(err));
},
    
//GET one thought
getOneThought({ params }, res) {
    Thought.findById(params.thoughtId)
    .populate({
        path: 'reactions',
        select: '-__v'
    })
    .select('-__v')
    .then(thoughtData => {
        if (!thoughtData) {
            res.status(404).json({ message: "No Thought Associated with ID" });
            return;
        }
        res.json(thoughtData);
    })
    .catch(err => res.status(400).json(err));
},

//POST new thought
createThought({ body }, res) {
    Thought.create(body)
    .then(({ _id }) => {
        return User.findByIdAndUpdate(body.userId,
            {
                $push: { thoughts: _id }
            },
            { new: true });
        })
        .then(userData => {
            if (!userData) {
                res.status(404).json({ message: "No User Associated with ID" });
                return;
            }
            res.json(userData);
        })
        .catch(err => res.status(400).json(err));
    },

//PUT update thought
updateThought({ params, body }, res) {
    Thought.findByIdAndUpdate(params.thoughtId, body, { new: true, runValidators: true })
    .then(thoughtData => {
        if (!thoughtData) {
            res.status(404).json({ message: "No Thought Associated with ID" });
            return;
        }
        res.json(thoughtData);
    })
    .catch(err => res.status(400).json(err));
},

//DELETE thought
deleteThought({ params }, res) {
    Thought.findByIdAndDelete(params.thoughtId)
    .then(deletedThought => {
        if (!deletedThought) {
            res.status(404).json({ message: "No Thought Associated with ID" });
            return;
        }
        return User.findOneAndUpdate(
            { username: deletedThought.username },
            { $pull: { thoughts: params.thoughtId } },
            { new: true }
            );
        })
        .then(userData => {
            if (!userData) {
                res.status(404).json({ message: "No User Associated with ID" });
                return;
            }
            res.json(userData);
        })
        .catch(err => res.status(400).json(err));
    },

//ADD reaction
addReaction({ params, body }, res) {
    Thought.findByIdAndUpdate(params.thoughtId,
        {
            $push: { reactions: body }
        },
        {
            new: true, runValidators: true
        })
        .then(thoughtData => {
            if (!thoughtData) {
                res.status(404).json({ message: "No Thought Associated with ID" });
                return;
            }
            res.json(thoughtData);
        })
        .catch(err => res.status(400).json(err));
    },

//DELETE reaction
deleteReaction({ params, body }, res) {
    Thought.findByIdAndUpdate(params.thoughtId,
        {
            $pull: { reactions: { reactionId: body.reactionId } }
        },
        { new: true })
        .then(thoughtData => {
            if (!thoughtData) {
                res.status(404).json({ message: "No Thought Associated with ID" });
                return;
            }
            res.json(thoughtData);
        })
        .catch(err => res.status(400).json(err));
    }
};

module.exports = thoughtController;