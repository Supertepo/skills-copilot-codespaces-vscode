// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');

// Create express app
const app = express();

// Add body parser middleware
app.use(bodyParser.json());

// Add cors middleware
app.use(cors());

// Create comments container
const commentsByPostId = {};

// Add route to get all comments by post id
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Add route to create a comment
app.post('/posts/:id/comments', (req, res) => {
  // Create a random id
  const commentId = randomBytes(4).toString('hex');

  // Get the comment content from the request body
  const { content } = req.body;

  // Get the comments array for this post id
  const comments = commentsByPostId[req.params.id] || [];

  // Add the new comment to the comments array
  comments.push({ id: commentId, content, status: 'pending' });

  // Add the comments array to the comments container
  commentsByPostId[req.params.id] = comments;

  // Send the new comment back to the client
  res.status(201).send(comments);
});

// Add route to handle event from event bus
app.post('/events', (req, res) => {
  // Get the event type from the request body
  const { type, data } = req.body;

  // Check if the event type is comment moderated
  if (type === 'CommentModerated') {
    // Get the comments array for this post id
    const comments = commentsByPostId[data.postId];

    // Get the comment that was moderated
    const comment = comments.find((comment) => {
      return comment.id === data.id;
    });

    // Update the comment status
    comment.status = data.status;

    // Emit event to event bus
    axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id: data.id,
        postId: data.postId,
        status: data.status,
        content: data.content,
      },
    });
  }

  // Send a response to the event bus
  res.send({});
});

// Start listening on