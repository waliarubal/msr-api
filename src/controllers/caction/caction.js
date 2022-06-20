const CorrectiveAction = require('../../models/CorrectiveAction');

module.exports.get = function (req, res, next) {
    CorrectiveAction
        .find({ isActive: true })
        .exec(function (err, data) {
            if (err) {
                return res.status(200).json({
                    success: false,
                    message: "Get Error While Getting Data",
                    error: err
                });
            } else {
                if (!!data) {

                    res.status(200).json({
                        success: true,
                        message: 'Rquest Completed Successfully',
                        data: data
                    })

                } else {
                    res.status(200).json({
                        success: true,
                        message: 'Rquest Completed Successfully',
                        data: []
                    })
                }
            }
        });
}


module.exports.post = function (req, res) {

    const { name } = req.body;
    const correctiveAction = new CorrectiveAction({ name });
    correctiveAction.save(function (err, data) {
        if (err) {
            return res.status(200).json({
                success: false,
                message: "Get Error While Creating New Action",
                error: err
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "New Corrective Action Created",
                data: data
            });
        }
    });
}


module.exports.checkExistingAction = function (req, res, next) {
    const { name } = req.body;
    CorrectiveAction
        .findOne({ name })
        .exec(function (err, data) {
            if (err) {
                return res.status(200).json({
                    success: false,
                    message: "Get Error While Fetching Data",
                    error: err
                });
            } else {
                if (data) {
                    return res.status(200).json({
                        success: false,
                        message: 'Action Post Operation Failed !',
                        error: data
                    });
                } else {
                    next();
                }
            }
        });
}



