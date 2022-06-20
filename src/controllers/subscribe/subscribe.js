const Subscribe = require("../../models/Subscribe");

module.exports.post = function (req, res) {
  const { email } = req.body;
  const sub = new Subscribe({ email });
  sub.save(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Getting Error Whiile Newletter Subscription",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Newsletter Subscribed !",
        data: data,
      });
    }
  });
};
