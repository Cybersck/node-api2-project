var express = require('express');
var router = express.Router();
let db = require('../data/db');



/** Retreive All Posts */
router.get('/api/posts', async (req, res) => {
    let posts = await db.find();
    res.send(posts);
});
/** Create New Post
 * 
 *     {
        title: "The post title", // String, required
        contents: "The post contents", // String, required
        created_at: Mon Aug 14 2017 12:50:16 GMT-0700 (PDT) // Date, defaults to current date
        updated_at: Mon Aug 14 2017 12:50:16 GMT-0700 (PDT) // Date, defaults to current date
      }
*/
router.post('/api/posts', async (req, res) => {
    if (req.body.title === undefined | null || req.body.contents === undefined | null) {res.status(400).send('Cannot Create post with empty fields'); return;}
    
    let newPost = {
        title: req.body.title,
        contents: req.body.contents,
        created_at: Date().toString(),
        updated_at: Date().toString()
    }

    await db.insert(newPost);
   res.status(201).send({message: 'Success', post: req.body});
});

/** Retrieve Post by ID */
router.get('/api/posts/:id', async (req, res) => {
    let post = await db.findById(req.params.id);

    post.length === 0
    ? res.status(404).send(`Cannot find post with ID of ${req.params.id}`)
    : res.status(200).send(post);
});

/** Deletes Post by ID */
router.delete('/api/posts/:id', async (req, res) => {
    let post = await db.findById(req.params.id);
    
    post.length === 0
    ? res.status(404).send(`Could not delete post with ID of ${req.params.id}. ERR: Post Does Not Exist`)
    : await db.remove(req.params.id), res.status(200).send('Success');
});

/** Updates Post by ID */
router.put('/api/posts/:id', async (req, res) => {
    let post = await db.findById(req.params.id);
    console.log(post);

    if (post.length === 0) res.status(404).send(`Could not update post with ID of ${req.params.id}. ERR: Post Does Not Exist`)
    else {
        try {
            console.log('test');
            post = {...post[0], updated_at: Date().toString()}
            post = req.body.title === null | undefined ? {...post} : {...post, title: req.body.title};
            post = req.body.contents === null | undefined ? {...post} : {...post, contents: req.body.contents};
            await db.update(post.id, post);
            res.status(201).send({message: 'success', updatedPost: post});
        } catch(e) {
            console.log(e);
        }
    }
});

/** Get Comments by Post ID */
router.get('/api/posts/:id/comments', async (req, res) => {
    let post = await db.findById(req.params.id);
        if (post.length === 0) {
            res.status(404).send(`Could not get comments for Post with ID of ${req.params.id}. ERR: Post Does Not Exist`);
            return;
        }
        else {
            let comments = await db.findPostComments(req.params.id);
            console.log(comments);
                if (comments.length === 0) {
                    res.status(200).send('Post does not have any comments');
                    console.log('test');
                } else {
                    res.status(200).send(comments);
                }
        }
});

/** Add Comment to Post by ID */
router.post('/api/posts/:id/comments', async (req, res) => {
    if (req.body.text === null || req.body.text === undefined) {res.status(400).send('Cannot create blank comment'); return}
    try {
        let post = await db.findById(req.params.id);
        if (post.length === 0) {
            res.status(404).send(`Could not add comment to Post with ID of ${req.params.id}. ERR: Post Does Not Exist`);
            return;
        }
        else {
            let newComment = {
                text: req.body.text,
                post_id: req.params.id,
                created_at: Date().toString(),
                updated_at: Date().toString()
            }
            let id = await db.insertComment(newComment);
            newComment = {id: id.id, ...newComment}
            res.status(201).send({message: 'Success', Comment: newComment});
        }
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;
