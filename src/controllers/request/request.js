const Request = require("../../models/Request");
const User = require("../../models/User");

const date = require("date-and-time");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const tempDir = "uploads/";
const https = require("https");
var CronJob = require("cron").CronJob;
const axios = require("axios");

const { schedulerForEmails } = require("../../helper/emailService");

const { inspect } = require("util");
const transform = require("lodash.transform");
const isEqual = require("lodash.isequal");
const isArray = require("lodash.isarray");
const isObject = require("lodash.isobject");

const Category = require("../../models/Category");
const { request } = require("http");
// =======
const { emailFunction } = require("../../helper/emailService");
// >>>>>>> 327e209aeed95c0b26c68fcaa2e30031802ec53d

/**@EXTENSION */
const getExtension = (filename) => {
  const ext = path.extname(filename || "").split(".");
  return ext[ext.length - 1].toLowerCase();
};

function difference(origObj, newObj) {
  function changes(newObj, origObj) {
    let arrayIndexCounter = 0;
    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
        result[resultKey] =
          isObject(value) && isObject(origObj[key])
            ? changes(value, origObj[key])
            : value;
      }
    });
  }
  return changes(newObj, origObj);
}

var job = new CronJob(
  "* * * * *",
  () => {
    console.log(`cron function for this minute of ${new Date().getMinutes()} `);
    schedulerForEmails();
    // console.log(process.env.SEND_MAILS)
  },
  null,
  true
);

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fileFields = [];
for (let i = 0; i < 10; i++) {
  fileFields.push({
    name: "file",
    maxCount: 10,
  });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter }).fields(
  fileFields
);

module.exports.addToCrm = function (req, res, next) {
  // console.log(req.body.req_id)
  // let response = Request.find(condition)

  if (req.body.req_id) {
    let req_id = "";
    let crm_id = "";

    // let project_contact_email = ''

    let condition = { _id: mongoose.Types.ObjectId(req.body.req_id) };
    //write mongoose query to get the request details from the request collection and project contact details from project collection
    Request.findOne(condition)
      .populate([
        {
          path: "userId",
        },
        {
          path: "status",
          select: "name",
        },
        {
          path: "requestTypeId",
          select: "name",
        },
        {
          path: "categoryId",
          select: "name",
        },
        {
          path: "projectContact",
          select: ["email", "firstname"],
        },
        {
          path: "techContact",
          select: ["email", "firstname"],
        },

        {
          path: "shipmentTypeId",
          model: "ShipmentTypes",
          select: "name",
        },
      ])
      .exec()

      .then(async (result) => {
        console.log("result", result);
        let dataForCrm = {
          req_id: result._id,
          //TODO request creator name add here
          request_creator_name: result.userId ? result.userId.firstname : "",
          request_creator_email: result.userId ? result.userId.email : "",
          crm_id: result.crm_id,
          request_files_url:
            "https://msrhwlab.azurewebsites.net/crm_case_files/" +
            String(result._id),
          request_for: result.requestTypeId.name,
          category: result.categoryId.name,
          project_contact_name: result.projectContact
            ? result.projectContact.firstname
            : "",
          project_contact_email: result.projectContact
            ? result.projectContact.email
            : "",
          //TODO add quantity
          quantity: result.quantity ? result.quantity : "",

          job_name: result.jobName ? result.jobName : "",
          job_desciption: result.description ? result.description : "",
          technical_contact_name: result.techContact
            ? result.techContact.firstname
            : "",
          technical_contact_email: result.techContact
            ? result.techContact.email
            : "",
          requested_completion_date: changeDateFormat(
            result.requestedCompletionDate
          ),
          //TODO check shipping address breaking or not
          shipping_address: result.shippingAddress
            ? result.shippingAddress
            : "",
          shipment_type: result.shipmentTypeId
            ? result.shipmentTypeId.name
            : "",
          expected_completion_date: changeDateFormat(
            result.expectedCompletionDate
          ),
          status: result.status.name,
        };
        // console.log('better query')
        console.log(dataForCrm);

        //Send dataForCrm to CRM endpointd
        let CRM_ENDPOINT_TEST =
          "https://brlacrmsync.azurewebsites.net:443/api/CRMSync/triggers/manual/invoke?api-version=2020-05-01-preview&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=sxyTtvpJxadOnnbQ8IXCd25hXKZVKSpdaZfHvna5X7E";
        let CRM_ENDPOINT_PRODUCTION =
          "https://hwlabemailservice.azurewebsites.net:443/api/CRMSync/triggers/manual/invoke?api-version=2020-05-01-preview&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=sY494hGI4sIyCfYUeSdlmbl2ejrA8qn3jaFw75npOY8";
        // if(crm_id === ''){
        console.log("requesting azure ");
        // console.log(dataForCrm)pp
        dataForCrm = JSON.stringify(dataForCrm);
        crm_id = await axios
          .post(CRM_ENDPOINT_PRODUCTION, JSON.parse(dataForCrm))
          .then(async (res) => {
            if (res.headers.crm_id) {
              let condition = { _id: mongoose.Types.ObjectId(req_id) };
              let updateData = res.headers.crm_id;
              Request.update(condition, {
                $set: { crm_id: res.headers.crm_id },
              }).exec(function (err, data) {
                if (!data) {
                  console.log("updated db with the crm id");
                }
              });
              // console.log(res)
              console.log(res.headers.crm_id);
              return res.headers.crm_id;
            }
          });
        dataForCrm["crm_id"] = crm_id;
        console.log(dataForCrm);
        // }

        return res.status(200).json({
          data: dataForCrm,
          success: true,
          message: "got data with CRM_ID",
        });

        console.log("sent req successfully");
      });
  }
};
const STRICT_EQUALITY_BROKEN = (a, b) => a === b;
const STRICT_EQUALITY_NO_NAN = (a, b) => {
  if (
    typeof a == "number" &&
    typeof b == "number" &&
    "" + a == "NaN" &&
    "" + b == "NaN"
  )
    // isNaN does not do what you think; see +/-Infinity
    return true;
  else return a === b;
};
function deepEquals(
  a,
  b,
  areEqual = STRICT_EQUALITY_NO_NAN,
  setElementsAreEqual = STRICT_EQUALITY_NO_NAN
) {
  /* compares objects hierarchically using the provided 
     notion of equality (defaulting to ===);
     supports Arrays, Objects, Maps, ArrayBuffers */
  if (a instanceof Array && b instanceof Array)
    return arraysEqual(a, b, areEqual);
  if (
    Object.getPrototypeOf(a) === Object.prototype &&
    Object.getPrototypeOf(b) === Object.prototype
  )
    return objectsEqual(a, b, areEqual);
  if (a instanceof Map && b instanceof Map) return mapsEqual(a, b, areEqual);
  if (a instanceof Set && b instanceof Set) {
    if (setElementsAreEqual === STRICT_EQUALITY_NO_NAN) return setsEqual(a, b);
    else
      throw "Error: set equality by hashing not implemented because cannot guarantee custom notion of equality is transitive without programmer intervention.";
  }
  if (
    (a instanceof ArrayBuffer || ArrayBuffer.isView(a)) &&
    (b instanceof ArrayBuffer || ArrayBuffer.isView(b))
  )
    return typedArraysEqual(a, b);
  return areEqual(a, b); // see note[1] -- IMPORTANT
}

function arraysEqual(a, b, areEqual) {
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; i++)
    if (!deepEquals(a[i], b[i], areEqual)) return false;
  return true;
}
function objectsEqual(a, b, areEqual) {
  var aKeys = Object.getOwnPropertyNames(a);
  var bKeys = Object.getOwnPropertyNames(b);
  if (aKeys.length != bKeys.length) return false;
  aKeys.sort();
  bKeys.sort();
  for (var i = 0; i < aKeys.length; i++)
    if (!areEqual(aKeys[i], bKeys[i]))
      // keys must be strings
      return false;
  return deepEquals(
    aKeys.map((k) => a[k]),
    aKeys.map((k) => b[k]),
    areEqual
  );
}
function mapsEqual(a, b, areEqual) {
  // assumes Map's keys use the '===' notion of equality, which is also the assumption of .has and .get methods in the spec; however, Map's values use our notion of the areEqual parameter
  if (a.size != b.size) return false;
  return [...a.keys()].every(
    (k) => b.has(k) && deepEquals(a.get(k), b.get(k), areEqual)
  );
}
function setsEqual(a, b) {
  // see discussion in below rest of StackOverflow answer
  return a.size == b.size && [...a.keys()].every((k) => b.has(k));
}
function typedArraysEqual(a, b) {
  // we use the obvious notion of equality for binary data
  a = new Uint8Array(a);
  b = new Uint8Array(b);
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; i++) if (a[i] != b[i]) return false;
  return true;
}

module.exports.CRMToMSRDataUpdate = async function (req, res, next) {
  console.log(req.body);
  if (req.headers["auth_key"] === "xac89tygqb3rp0b") {
    try {
      let updatedCasesCount = 0;

      // console.log(req.headers)
      for (let index = 0; index < req.body.length; index++) {
        // console.log()
        const crm_id = req.body[index].CrmId;
        const condition = { crm_id: crm_id };
        let prevDataRequest = await Request.findOne(condition);
        // console.log('prevDataRequest')
        // console.log(prevDataRequest)
        // let changedBy =
        let {
          Contact,
          Description,
          DueDate,
          ModifiedBy,
          ModifiedOn,
          Notes,
          StartDate,
          requestedCompletionDate,
          expectedCompletionDate,
          Status,
          Title,
        } = req.body[index];

        let statusMSR = {
          "5ec8eb047ef9d51f3cc63813": "Open",
          "5eaa4eb7a111ad0cfce91ef2": "Closed",
          "5ec5fce09ad2de12381918a0": "Assigned",
          "5eaa4eada111ad0cfce91ef1": "In_Progress",
        };
        let statusCodes = {
          msr: {
            Open: "5ec8eb047ef9d51f3cc63813",
            Closed: "5eaa4eb7a111ad0cfce91ef2",
            Assigned: "5ec5fce09ad2de12381918a0",
            In_Progress: "5eaa4eada111ad0cfce91ef1",
          },
          crm: {
            0: "Open",
            1: "Closed",
          },
        };
        let statusCodeToMSR = {
          0: "5ec8eb047ef9d51f3cc63813",
          1: "5eaa4eb7a111ad0cfce91ef2",
        };
        const diff = {};
        if (prevDataRequest !== null) {
          if (prevDataRequest.contactPerson != req.body[index].Contact) {
            diff["Contact Person"] = prevDataRequest.contactPerson;
          }
          if (prevDataRequest.jobDetail !== req.body[index].Description) {
            diff["Job Details"] = prevDataRequest.jobDetail;
          }

          if (
            new Date(prevDataRequest.expectedCompletionDate).toDateString() !==
            new Date(req.body[index].DueDate).toDateString()
          ) {
            // console.log('prevDataRequest.expectedCompletionDate')
            // console.log(prevDataRequest.expectedCompletionDate)
            // console.log('req.body.DueDate')
            // console.log(req.body[index].DueDate)
            diff["Expected Completion Date (Called Due Date in CRM)"] =
              new Date(prevDataRequest.expectedCompletionDate).toDateString();
          }
          if (!deepEquals(prevDataRequest.Notes, req.body[index].Notes)) {
            diff["Notes"] = prevDataRequest.Notes;
          }
          if (prevDataRequest.jobName !== req.body[index].Title) {
            diff["Job Name"] = prevDataRequest.jobName;
          }

          // console.log('statusMSR[prevDataRequest.status')
          // console.log(statusMSR[prevDataRequest.status])

          // console.log('statusCodes.crm[String(req.body.Status)]')
          // console.log(statusCodes.crm[String(req.body[index].Status)])

          if (
            statusMSR[prevDataRequest.status] !=
            statusCodes.crm[String(req.body[index].Status)]
          ) {
            diff["Status"] = prevDataRequest.status;
          }

          console.log(diff);
          await Request.update(condition, {
            $set: {
              contactPerson: Contact,
              jobDetail: Description,
              // DueDate: DueDate,
              Notes: Notes,
              jobName: Title,
              // StartDate: StartDate,
              expectedCompletionDate: String(DueDate),
              status: statusCodeToMSR[String(Status)],
            },
          }).exec(async function (err, data) {
            if (err) {
            } else {
              updatedCasesCount++;
            }
          });
          // console.log('diff')
          // console.log(diff)
          if (Object.keys(diff).length !== 0) {
            diff["Modified At"] = changeDateFormat(new Date());
            // console.log('change dtected')

            await Request.update(condition, {
              $push: { CRM_history: diff },
            }).exec(async function (err, data) {
              if (err) {
              } else {
                // updatedCasesCount++
              }
            });
          }
        }

        // console.log(search)
        // console.log(condition)
      }
      return res.status(200).json({
        success: true,
        message: " Request Updated Successfully",
        totalCasesUpdated: updatedCasesCount,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: " Error while updating request",
        err: err,
      });
    }

    // updateData = req.body

    // let reqUpdate = req.data
  } else {
    return res.status(201).json({
      success: false,
      message: "Auth key is incorrectly set in the headers ",
    });
  }
  // return res.status(200).json({
  //   message: 'got the data'
  // })
};

module.exports.getFilesOfCRMcase = async function (req, res, next) {
  // log request body in console
  const id = req.query.id;
  // console.log(crm_id)
  let condition = { _id: id };
  let data = await Request.findOne(condition);
  // if data is empty then return that the case doesnt exists
  // console.log(data.files)
  if (data === null) {
    return res.status(201).json({
      success: false,
      message: "Case does not exists",
    });
  }
  //return response 200
  else
    return res.status(200).json({
      files: data.files,
      success: true,
      // message: 'Case does not exists'
    });
  // console.log(req.)
};

module.exports.get = function (req, res, next) {
  let condition = {};
  if (req.query.userId) {
    condition.techContact = mongoose.Types.ObjectId(req.query.userId);
  }
  Request.find(condition).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Getting Error While Fetching Data",
        error: err,
      });
    } else {
      if (data && data.length > 0) {
        // RequestType.find(conditonFor)
        let newData = data.map((data) => {
          // console.log(data.description)
          let description = "";
          if (data.description == null || data.description == "null") {
            description = "";
          } else {
            description = data.description;
          }
          return {
            createdAt: changeDateFormat(data.createdAt),
            modifiedAt: changeDateFormat(data.modifiedAt),
            _id: data._id,
            jobName: data.jobName,
            requestTypeId: data.requestTypeId,
            categoryId: data.categoryId,
            description: description,
            isImmediate: data.isImmediate,
            quantity: data.quantity,
            timeline: data.timeline,
            hardwareFilmware: data.hardwareFilmware,
            contactPerson: data.contactPerson,
            shipmentTypeId: data.shipmentTypeId,
            shippingAddress: data.shippingAddress,
            files: data.files,
            status: data.status,
            reqStatus: data.reqStatus,
            userId: data.userId,
            startDate: convertDate(data.startDate),
            endDate: convertDate(data.endDate),
            expectedCompletionDate: changeDateFormat(
              data.expectedCompletionDate
            ),
            requestedCompletionDate: changeDateFormat(
              data.requestedCompletionDate
            ),
            jobDetail: data.jobDetail,
            techContact: data.techContact,
            projectContact: data.projectContact,
            isActive: data.isActive,
            history: data.history,
            //needed for CRM push
            crm_id: data.crm_id,
            CRM_history: data.CRM_history,
            Notes: data.Notes,
            category: data.category,
            requestFor: data.requestFor,
          };
        });
        res.status(200).json({
          success: true,
          message: "Request Completed Successfully",
          data: newData,
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Request Completed Successfully",
          data: [],
        });
      }
    }
  });
};

module.exports.getByUserId = function (req, res, next) {
  let condition = {};
  // console.log(req.body)
  // console.log(req.query)
  if (req.body.userId && req.body.role !== "SuperAdmin") {
    condition = { userId: mongoose.Types.ObjectId(req.body.userId) };
  }
  let ID = mongoose.Types.ObjectId(req.body.userId);
  Request.find(condition).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Getting Error While Fetching Data",
        error: err,
      });
    } else {
      if (data && data.length > 0) {
        let newData = data.map((data) => {
          // console.log(data.description)
          let description = "";
          if (data.description == null || data.description == "null") {
            description = "";
          } else {
            description = data.description;
          }
          return {
            createdAt: changeDateFormat(data.createdAt),
            modifiedAt: changeDateFormat(data.modifiedAt),
            _id: data._id,
            jobName: data.jobName,
            requestTypeId: data.requestTypeId,
            categoryId: data.categoryId,
            description: description,
            isImmediate: data.isImmediate,
            quantity: data.quantity,
            timeline: data.timeline,
            hardwareFilmware: data.hardwareFilmware,
            contactPerson: data.contactPerson,
            shipmentTypeId: data.shipmentTypeId,
            shippingAddress: data.shippingAddress,
            files: data.files,
            status: data.status,
            reqStatus: data.reqStatus,
            userId: data.userId,
            startDate: convertDate(data.startDate),
            endDate: convertDate(data.endDate),
            expectedCompletionDate: changeDateFormat(
              data.expectedCompletionDate
            ),
            requestedCompletionDate: changeDateFormat(
              data.requestedCompletionDate
            ),
            jobDetail: data.jobDetail,
            techContact: data.techContact,
            projectContact: data.projectContact,
            isActive: data.isActive,
            history: data.history,
            createdBy: data.createdBy,
          };
        });
        //creating respObj from newData to have unique elements
        let mydata = newData;
        let uniqueEmails = new Set();
        let uniqueAddress = new Set();
        for (let i = 0; i < mydata.length; i++) {
          uniqueEmails.add(mydata[i].contactPerson);
          uniqueAddress.add(mydata[i].shippingAddress);
        }
        let emailArr = [];
        let addressArr = [];

        for (let item of uniqueEmails) {
          let data = mydata.find((obj) => obj.contactPerson == item);
          let ele = {
            _id: data._id,
            userId: data.userId,
            email: data.contactPerson,
            createdBy: data.createdBy,
          };
          emailArr.push(ele);
        }
        for (let item of uniqueAddress) {
          let data = mydata.find((obj) => obj.shippingAddress == item);
          let ele = {
            _id: data._id,
            userId: data.userId,
            address: data.shippingAddress,
            createdBy: data.createdBy,
          };
          addressArr.push(ele);
        }

        let respObj = {
          emails: emailArr,
          address: addressArr,
        };
        res.status(200).json({
          success: true,
          message: "Request Completed Successfully",
          data: respObj,
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Request Completed Successfully",
          data: [],
        });
      }
    }
  });
};
module.exports.changeRequestStatus = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  let status = req.body.status;
  Request.update(condition, { $set: { status: status } }).exec((err, data) => {
    if (status === "Complete") {
      const content = {
        to: "jithin.akash.varun@gmail.com", //user.email
        from: "v-pamoh@microsoft.com",
        subject: "HWLab Request Complete!",
        body: `Hello! Your request, ${req.body.jobName}, has been completed by the Hardware Lab. Please 
                contact ${req.body.projectContact} for more details and shipment tracking information, if applicable. You can view the request details here. Thanks for using the MSR Hardware Lab! The Hardware Lab Team hardlabsupport@microsoft.com`,
      };
      emailFunction(content); //email function call
    }

    if (err || !data) {
      return res.status(200).json({
        success: false,
        message: "Error In Fetching Request",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Request Status Updated Successfully",
        data: data,
      });
    }
  });
};

module.exports.changeById = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  let contactPerson = req.body.contactPerson;
  let shippingAddress = req.body.shippingAddress;
  Request.update(condition, {
    $set: { contactPerson: contactPerson, shippingAddress: shippingAddress },
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(200).json({
        success: false,
        message: "Error In Fetching Request",
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Request Updated Successfully",
        data: data,
      });
    }
  });
};

module.exports.uploadMulter = function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error While Uploading File ",
        err: err,
      });
    }
    next();
  });
};

module.exports.upload = function (req, res, next) {
  const { file } = req.files;
  if (!!file) {
    const files = [];
    for (let i = 0; i < file.length; i++) {
      const { originalname, filename, mimetype, size } = file[i];
      //    const ext = getExtension(file[i].originalname);
      //     file[i]['extension']=ext;
      // 	const tName
      // 	= `${filename}_${originalname}`
      // 	 file[i].filename = tName
      //      file[i].path = file[i].path
      // 	 file[i].destination = path.resolve(tempDir, tName);
      // 	 console.log(file[i],tName)
      files.push(file[i]);
    }

    req.filesData = files;
    next();
  } else {
    req.filesData = [];
    next();
  }
};

module.exports.post = async function (req, res) {
  // console.log("running...")
  let finalDataFile = req.filesData;

  const {
    categoryId,
    requestTypeId,
    isImmediate,
    quantity,
    jobName,
    contactPerson,
    shipmentTypeId,
    shippingAddress,
    status,
    reqStatus,
    userId,
    timeline,
    hardwareFilmware,
    description,
    startDate,
    endDate,
    expectedCompletionDate,
    requestedCompletionDate,
    jobDetail,
    techContact,
    projectContact,
  } = req.body;
  console.log(req.body);
  let userData = await User.findOne({
    _id: mongoose.Types.ObjectId(req.body.userId),
  });
  let createdBy = userData.firstname + "(" + userData.username + ")";

  let approverData = await User.findOne({ approverLevel: "level1" }); //get data of approver
  // let approver_ii_Data = await User.findOne({})
  // console.log("This is the approver data")
  // console.log(approverData)

  const request = new Request({
    categoryId,
    requestTypeId,
    isImmediate,
    quantity,
    jobName,
    contactPerson,
    shipmentTypeId,
    shippingAddress,
    reqStatus,
    status,
    timeline,
    hardwareFilmware,
    description,
    userId,
    startDate,
    endDate,
    expectedCompletionDate,
    requestedCompletionDate,
    jobDetail,
    techContact,
    projectContact,
    files: finalDataFile,
    createdBy,
  });
  request.save(async function (err, data) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Error In Creating Request",
        error: err,
      });
    } else {
      try {
        const content = {
          to: approverData.email, //approverData.email
          from: "v-pamoh@microsoft.com",
          subject: "New Request Waiting for Assignment",
          body: `Hello, A new request titled ${jobName} has been created on the Hardware Lab
                 Webpage by ${userData.firstname}, (email: ${userData.email}). Please review and assign the request here. 
                 https://msrhwlab.azurewebsites.net/jobDetail/${data._id}`,
        };
        console.log("mail sent to " + +approverData.email);
        await emailFunction(content);
      } catch (err) {
        console.log(err);
        return res.status(200).json({
          success: true,
          message: "New Request Created Successfully",
          data: data,
        });
      } //email function call

      return res.status(200).json({
        success: true,
        message: "New Request Created Successfully",
        data: data,
      });
    }
  });
};

module.exports.put = async function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.query._id) };
  let prevDataRequest = await Request.findOne(condition);
  let userData = await User.findOne({
    _id: mongoose.Types.ObjectId(req.body.userId),
  });
  // console.log('req body')
  // console.log(req.body)
  let changedBy = userData.firstname + "(" + userData.username + ")";
  let prevFiles = prevDataRequest.files;

  // let curFiles = req.filesData;
  // let finalFileArray = [];
  // if (curFiles && curFiles.length > 0) {
  //     finalFileArray = curFiles
  //     if (prevFiles && prevFiles.length > 0) {
  //         prevFiles.forEach(function (item) {
  //             finalFileArray.push(item);
  //         });
  //     }
  // } else {
  //     finalFileArray = prevFiles
  // }

  let curFiles = req.filesData;
  let finalFileArray = [];
  let filterArray = [];
  if (curFiles && curFiles.length > 0) {
    if (prevFiles && prevFiles.length > 0) {
      prevFiles.forEach(function (item) {
        let resp = curFiles.filter(
          (ele) => ele.originalname == item.originalname
        );
        if (resp.length == 0) {
          filterArray.push(item);
        }
      });
      finalFileArray = [...filterArray, ...curFiles];
    } else {
      finalFileArray = curFiles;
    }
  } else {
    finalFileArray = prevFiles;
  }

  const {
    categoryId,
    requestTypeId,
    isImmediate,
    quantity,
    jobName,
    contactPerson,
    shipmentTypeId,
    shippingAddress,
    status,
    reqStatus,
    userId,
    timeline,
    hardwareFilmware,
    description,
    startDate,
    endDate,
    expectedCompletionDate,
    requestedCompletionDate,
    jobDetail,
    techContact,
    projectContact,
    // mailSent
  } = req.body;
  // console.log('put request came', req.body)

  let currentDataRequest = {
    categoryId,
    requestTypeId,
    isImmediate,
    quantity,
    jobName,
    contactPerson,
    shipmentTypeId,
    shippingAddress,
    status,
    reqStatus,
    userId,
    timeline,
    hardwareFilmware,
    description,
    startDate,
    endDate,
    expectedCompletionDate,
    requestedCompletionDate,
    jobDetail,
    techContact,
    projectContact,
    finalFileArray,
    // mailSent
  };

  const diff = { "Changed By": changedBy };
  //compare prev object with new object
  // if (prevDataRequest.categoryId != req.body.categoryId) {
  //     diff["CategoryId"] = prevDataRequest.categoryId
  // }
  // if (prevDataRequest.requestTypeId != req.body.requestTypeId) {
  //     diff["RequestTypeId"] = prevDataRequest.requestTypeId
  // }
  if (prevDataRequest.isImmediate != req.body.isImmediate) {
    if (
      prevDataRequest.isImmediate == "null" ||
      prevDataRequest.isImmediate == null ||
      prevDataRequest.isImmediate == undefined
    ) {
      diff["Is Immediate"] = "";
    } else {
      diff["Is Immediate"] = prevDataRequest.isImmediate;
    }
  }
  if (prevDataRequest.quantity != req.body.quantity) {
    diff["Quantity"] = prevDataRequest.quantity;
  }
  if (prevDataRequest.jobName != req.body.jobName) {
    diff["Job Name"] = prevDataRequest.jobName;
  }
  if (prevDataRequest.contactPerson != req.body.contactPerson) {
    diff["Contact Person"] = prevDataRequest.contactPerson;
  }
  if (prevDataRequest.shipmentTypeId != req.body.shipmentTypeId) {
    diff["Shipment Type"] = prevDataRequest.shipmentTypeId;
  }
  if (prevDataRequest.shippingAddress != req.body.shippingAddress) {
    diff["Shipping Address"] = prevDataRequest.shippingAddress;
  }
  if (prevDataRequest.status != req.body.status) {
    diff["Status"] = prevDataRequest.status;
  }
  if (prevDataRequest.reqStatus != req.body.reqStatus) {
    diff["Req Status"] = prevDataRequest.reqStatus;
  }
  if (prevDataRequest.userId != req.body.userId) {
    diff["UserId"] = prevDataRequest.userId;
  }
  if (prevDataRequest.timeline != req.body.timeline) {
    diff["Timeline"] = prevDataRequest.timeline;
  }
  if (prevDataRequest.hardwareFilmware != req.body.hardwareFilmware) {
    diff["Hardware Filmware"] = prevDataRequest.hardwareFilmware;
  }
  if (prevDataRequest.startDate != req.body.startDate) {
    diff["Start Date"] = convertDate(prevDataRequest.startDate);
  }
  if (prevDataRequest.endDate != req.body.endDate) {
    diff["End Date"] = convertDate(prevDataRequest.endDate);
  }
  // console.log('prevDataRequest.expectedCompletionDate')
  // console.log(changeDateFormat(prevDataRequest.expectedCompletionDate))

  // console.log('req.body.expectedCompletionDate')
  // console.log(changeDateFormat(req.body.expectedCompletionDate))
  if (
    changeDateFormat(prevDataRequest.expectedCompletionDate) !=
    changeDateFormat(req.body.expectedCompletionDate)
  ) {
    diff["Expected Completion Date"] = changeDateFormat(
      prevDataRequest.expectedCompletionDate
    );
  }
  if (
    changeDateFormat(prevDataRequest.requestedCompletionDate) !=
    changeDateFormat(req.body.requestedCompletionDate)
  ) {
    diff["Requested Completion Date"] = changeDateFormat(
      prevDataRequest.requestedCompletionDate
    );
  }
  if (prevDataRequest.techContact != req.body.techContact) {
    diff["Tech Contact"] = prevDataRequest.techContact;
  }
  if (prevDataRequest.projectContact != req.body.projectContact) {
    diff["Project Contact"] = prevDataRequest.projectContact;
  }
  if (prevDataRequest.jobDetail != req.body.jobDetail) {
    diff["Job Detail"] = prevDataRequest.jobDetail;
  }

  if (prevDataRequest.description != req.body.description) {
    diff["Description"] = prevDataRequest.description;
  }

  if (prevDataRequest.modifiedAt != req.body.modifiedAt) {
    diff["Modified At"] = changeDateFormat(new Date());
  }
  if (prevDataRequest.files != finalFileArray) {
    diff["files"] = prevDataRequest.files;
    // console.log(diff["files"])
  }
  // console.log('diff')
  // console.log(diff)
  if (Object.keys(diff).length > 2) {
    await Request.update(condition, {
      $push: { history: diff },
    }).exec(async function (err, data) {});
  }
  await Request.update(condition, {
    $set: {
      categoryId: categoryId,
      requestTypeId: requestTypeId,
      isImmediate: isImmediate,
      quantity: quantity,
      jobName: jobName,
      contactPerson: contactPerson,
      shipmentTypeId: shipmentTypeId,
      shippingAddress: shippingAddress,
      status: status,
      reqStatus: reqStatus,
      userId: userId,
      timeline: timeline,
      hardwareFilmware: hardwareFilmware,
      description: description,
      startDate: startDate,
      endDate: endDate,
      expectedCompletionDate: expectedCompletionDate,
      requestedCompletionDate: requestedCompletionDate,
      jobDetail: jobDetail,
      techContact: techContact,
      projectContact: projectContact,
      files: finalFileArray,
      // mailSent : false
    },
  }).exec(async function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: " Error While Updating Request",
        err: err,
      });
    } else {
      //if for email

      if (data.nModified == 1) {
        if (projectContact) {
          const content = {
            to: "jithin.akash.varun@gmail.com", //projectcontact email
            from: "v-pamoh@microsoft.com",
            subject: "New Request Assigned to You",
            body: `Hello, The request ${jobName} has been assigned to you. Please review the request details here.`,
          };
          // emailFunction(content)   //email function call

          const content2 = {
            to: "jithin.akash.varun@gmail.com", //user email
            from: "v-pamoh@microsoft.com",
            subject: "Your request has been assigned!",
            body: `Hello, Thanks for submitting a request to the Hardware Lab! Your new request, ${jobName}, has been assigned to ${req.body.projectContact}. You can track the status of your request here. If you have any questions, please feel free to reach out to us at hardlabsupport@microsoft.com. Looking forward to working with you! The Hardware Lab Team`,
          };
          // emailFunction(content2)
        }

        if (
          prevDataRequest.expectedCompletionDate !=
          req.body.expectedCompletionDate
        ) {
          const content = {
            to: "jithin.akash.varun@gmail.com", //user email
            from: "v-pamoh@microsoft.com",
            subject: "Expected Completion Date Change",
            body: `Hello! Your request, ${jobName}, is now expected to be completed on ${req.body.expectedCompletionDate}. Please contact <HWLab Project Contact> for more details. You can view request details here. Thanks! The Hardware Lab Team hardlabsupport@microsoft.com`,
          };
          // emailFunction(content)
        }

        return res.status(200).json({
          success: true,
          message: " Request Updated Successfully ",
          data: data,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: " Request Not Updated",
          data: data,
        });
      }
    }
  });
};

module.exports.putById = async function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.query._id) };
  let prevDataRequest = await Request.findOne(condition);

  let userData = await User.findOne({
    _id: mongoose.Types.ObjectId(req.body.userId),
  });

  let changedBy = userData.firstname + "(" + userData.username + ")";
  let prevFiles = prevDataRequest.files;

  let curFiles = req.filesData;
  let finalFileArray = [];
  if (curFiles && curFiles.length > 0) {
    finalFileArray = curFiles;
  } else {
    finalFileArray = prevFiles;
  }

  let { contactPerson, shippingAddress } = req.body;

  let currentDataRequest = {
    contactPerson,
    shippingAddress,
  };

  const diff = { "Deleted By": changedBy };

  if (req.body.contactPerson == null) {
    contactPerson = prevDataRequest.contactPerson;
    if (prevDataRequest.contactPerson != contactPerson) {
      diff["Contact Person"] = "Deleted(opt-out)";
    }
    if (prevDataRequest.shippingAddress != shippingAddress) {
      diff["Shipping Address"] = "Deleted(opt-out)";
    }
    if (prevDataRequest.shippingAddress) {
      Request.updateMany(
        { shippingAddress: prevDataRequest.shippingAddress },
        {
          $set: {
            shippingAddress: "",
          },
          $push: { history: diff },
        }
      ).exec((err, data) => {
        if (err) {
          return res.status(200).json({
            success: false,
            message: " Error While Updating Request",
            err: err,
          });
        } else {
          if (data.nModified == 1) {
            return res.status(200).json({
              success: true,
              message: " Request Updated Successfully ",
              data: data,
            });
          } else {
            return res.status(200).json({
              success: true,
              message: " Request Not Updated",
              data: data,
            });
          }
        }
      });
    }
  }
  if (req.body.shippingAddress == null) {
    shippingAddress = prevDataRequest.shippingAddress;
    if (prevDataRequest.contactPerson != req.body.contactPerson) {
      diff["Contact Person"] = "Deleted(opt-out)";
    }
    if (prevDataRequest.shippingAddress != req.body.shippingAddress) {
      diff["Shipping Address"] = "Deleted(opt-out)";
    }
    if (prevDataRequest.contactPerson) {
      Request.updateMany(
        { contactPerson: prevDataRequest.contactPerson },
        {
          $set: {
            contactPerson: "",
          },
          $push: { history: diff },
        }
      ).exec((err, data) => {
        if (err) {
          return res.status(200).json({
            success: false,
            message: " Error While Updating Request",
            err: err,
          });
        } else {
          if (data.nModified == 1) {
            return res.status(200).json({
              success: true,
              message: " Request Updated Successfully ",
              data: data,
            });
          } else {
            return res.status(200).json({
              success: true,
              message: " Request Not Updated",
              data: data,
            });
          }
        }
      });
    }
  }

  //     Request.update(
  //         condition,
  //         {
  //             $set: {
  //                 contactPerson: contactPerson,
  //                 shippingAddress: shippingAddress

  //             },
  //             $push: { history: diff }

  //         }
  //     ).exec(function (err, data) {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: false,
  //                 message: " Error While Updating Request",
  //                 err: err
  //             });
  //         } else {
  //             if (data.nModified == 1) {
  //                 return res.status(200).json({
  //                     success: true,
  //                     message: " Request Updated Successfully ",
  //                     data: data
  //                 });
  //             } else {
  //                 return res.status(200).json({
  //                     success: true,
  //                     message: " Request Not Updated",
  //                     data: data
  //                 });
  //             }

  //         }
  //     });
};

module.exports.delete = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.params._id) };
  let updateData = { isActive: false };
  Request.update(condition, updateData).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Getting Error While Deleting Request",
        err: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Successfully Deleted Request",
        data: data,
      });
    }
  });
};

module.exports.deleteById = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.query._id) };
  Request.remove(condition).exec(function (err, data) {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Getting Error While Deleting Request",
        err: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Successfully Deleted Request",
        data: data,
      });
    }
  });
};

module.exports.getById = function (req, res) {
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };
  Request.findOne(condition).exec((err, data) => {
    if (err) {
      return res.status(200).json({
        success: false,
        message: "Error In Fetching Request",
        error: err,
      });
    } else {
      // console.log(data)
      let description = "";
      if (data.description == null) {
        description = "";
      } else {
        description = data.description;
      }

      let newData = {
        createdAt: changeDateFormat(data.createdAt),
        modifiedAt: changeDateFormat(data.modifiedAt),
        _id: data._id,
        crm_id: data.crm_id,
        CRM_history: data.CRM_history,
        Notes: data.Notes,
        jobName: data.jobName,
        requestTypeId: data.requestTypeId,
        categoryId: data.categoryId,
        description: description,
        timeline: data.timeline,
        hardwareFilmware: data.hardwareFilmware,
        contactPerson: data.contactPerson,
        shipmentTypeId: data.shipmentTypeId,
        shippingAddress: data.shippingAddress,
        files: data.files,
        status: data.status,
        reqStatus: data.reqStatus,
        userId: data.userId,
        startDate: convertDate(data.startDate),
        endDate: convertDate(data.endDate),
        expectedCompletionDate: changeDateFormat(data.expectedCompletionDate),
        requestedCompletionDate: changeDateFormat(data.requestedCompletionDate),
        jobDetail: data.jobDetail,
        techContact: data.techContact,
        projectContact: data.projectContact,
        isActive: data.isActive,
        history: data.history,
        quantity: data.quantity,
      };
      return res.status(200).json({
        success: true,
        message: "Request Data Fetched Successfully",
        data: newData,
      });
    }
  });
};

const changeDateFormat = (dateData) => {
  let date = new Date(String(dateData));
  // console.log("date", date)
  if (date && date != null && date != undefined) {
    let month = date.getMonth();
    let day = date.getDate();
    let year = date.getFullYear();
    let output = month + 1 + "/" + day + "/" + year;
    // console.log("output", output)
    return output;
  } else {
    return "";
  }
};

const convertDate = (date) => {
  if (date != null && date != undefined) {
    let date1 = date.includes("-") ? date.split("-") : null;
    if (date1) {
      let newDate = date1[1] + "/" + date1[2] + "/" + date1[0];
      // console.log("date", date)
      // console.log("newDate", newDate)
      return newDate;
    } else {
      return date;
    }
  } else {
    return "";
  }
};

// module.exports = {emailFunction}
