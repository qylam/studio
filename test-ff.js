const { http } = require('@google-cloud/functions-framework');
http('test-function', (req, res) => {
  res.send({ typeofBody: typeof req.body, body: req.body });
});
