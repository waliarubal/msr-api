const User = require("../../models/User");
const config = "../../../config/main";
const jwt = "jsonwebtoken";

function userLogin(req, res, next) {
  const { username, password } = req.body;

  //  User
  // .findOne({ username, password })
  // .exec(function(err, data){
  //     if( err ){
  //         return res.status(200).json({
  //             success : false,
  //             message : "Error While Getting Data",
  //             error : err
  //         });
  //     }else{
  //         if(!!data){
  //            delete data.password;
  //            let authToken =  jwt.sign({ username, password }, config.jwtSecret, config.jwtOptions);
  //             return res.status(200).json({
  //                 success : true,
  //                 message: 'User LoggedIn  Successfully !',
  //                 data: data,
  //                 authToken
  //             });

  //         }else{
  //             return res.status(200).json({
  //                 success : false,
  //                 message: 'User Login Failed !',
  //                 error: data
  //             });
  //         }
  //     }
  // });
}

function getUserList(req, res, next) {
  User.find({})
    .select({
      _id: 1,
      username: 1,
      email: 1,
      firstname: 1,
      lastname: 1,
      role: 1,
      isProjectContact: 1,
      isTechContact: 1,
      otherRole: 1,
      approverLevel: 1,
    })
    .exec(function (err, data) {
      if (err) {
        return res.status(200).json({
          success: false,
          message: "Error While Getting Data",
          error: err,
        });
      } else {
        console.log(data);
        return res.status(200).json({
          success: true,
          message: "User List Get Request Completed Successfully !",
          data: data,
        });
      }
    });
}

module.exports = {
  userLogin,
  getUserList,
};

// notes consultioation id : 61ae22be630ceb27cb014ac7
