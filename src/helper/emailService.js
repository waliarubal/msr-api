const axios = require('axios');
const https = require('https');
const { env } = require('process');

const { string } = require('./validation_message');
const Requests = require('../models/Request');
const User = require('../models/User');

const findTimeRemaining = (createdAt) => {       //function for returning time remaining for monday. This is called if tomorrow is saturday

  if (createdAt.getDay() == 4) {
    var tomorrow = new Date(createdAt)      //tomorrow for thurday is friday
    tomorrow.setDate(createdAt.getDate() + 1)
    timingTomorrow = Math.floor(tomorrow.getTime())
    // dayTomorrow = tomorrow.getDay()

    var dayAfterTomorrow = new Date(tomorrow)       //day after tomorrow for thursday is monday
    dayAfterTomorrow.setDate(tomorrow.getDate() + 3)
    timingDayAfterTomorrow = Math.floor(dayAfterTomorrow.getTime())
    // var dayDayAfterTomorrow = dayAfterTomorrow.getDay()
  }
  else if (createdAt.getDay() == 5) {
    var tomorrow = new Date(createdAt)      //tomorrow for friday is Monday
    tomorrow.setDate(createdAt.getDate() + 3)
    timingTomorrow = Math.floor(tomorrow.getTime() )
    // dayTomorrow = tomorrow.getDay()

    var dayAfterTomorrow = new Date(tomorrow)       //day after tomorrow for friday is tuesday
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1)
    timingDayAfterTomorrow = Math.floor(dayAfterTomorrow.getTime())
    // var dayDayAfterTomorrow = dayAfterTomorrow.getDay()
  }
  else if (createdAt.getDay() == 6) {
    var tomorrow = new Date(createdAt)      //tomorrow for saturday is monday
    tomorrow.setDate(createdAt.getDate() + 2)
    timingTomorrow = Math.floor(tomorrow.getTime() )
    // dayTomorrow = tomorrow.getDay()

    var dayAfterTomorrow = new Date(tomorrow)       //day after tomorrow for saturday is tuesday
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1)
    timingDayAfterTomorrow = Math.floor(dayAfterTomorrow.getTime() )
    // var dayDayAfterTomorrow = dayAfterTomorrow.getDay()
  }
  else {
    var tomorrow = new Date(createdAt)      //tomorrow
    tomorrow.setDate(createdAt.getDate() + 1)
    timingTomorrow = Math.floor(tomorrow.getTime() )
    // dayTomorrow = tomorrow.getDay()

    var dayAfterTomorrow = new Date(tomorrow)       //day after tomorrow
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1)
    timingDayAfterTomorrow = Math.floor(dayAfterTomorrow.getTime() )
    // var dayDayAfterTomorrow = dayAfterTomorrow.getDay()
  }

  return { 'timingTomorrow': timingTomorrow, 'timingDayAfterTomorrow': timingDayAfterTomorrow};
}



module.exports.schedulerForEmails = async () => {
  // let requestWithoutMails = await Requests.find({mailSent: false})
  let requestsWithoutProjectContact  = await Requests.find({ projectContact: null })
  // console.log('requestsWithoutProjectContact', requestsWithoutProjectContact)
  let createdAts = []
  let mailsToSendTo = []
  let index = 0
    requestsWithoutProjectContact.map(async (req)=>{
      currTime = new Date()
      newTime = new Date().setHours(currTime.getHours() + (24))
      let time_remaining = findTimeRemaining(req.createdAt)
      // FOR TESTING : PASS new Date(2021,9,21,14,new Date().getMinutes()+index) to the findTimeRemaining
      // to test for how it will handle requests that would be created on different days of the week, like
      // on a friday, or a saturday.
        index++
      // console.log(new Date(time_remaining.timingTomorrow))
      if (Math.floor(time_remaining.timingTomorrow / (60 * 1000)) === Math.floor((new Date() / (60 * 1000) 
        // + (24*60*3) 
        ) )) {
        createdAts.push({ 'createdAt': req.createdAt, 'name': req.jobName })
        console.log('email sent!')
        let approverData = await User.findOne({ approverLevel: "level1" })
        let requestCreaterData = await User.findOne({ _id: req.userId })
        let WEBSITE_NAME = 'msrhwlab.azurewebsites.net'
        console.log(JSON.stringify(approverData))  //get data of approver
        // console.log(JSON.stringify(`req.jobName ${req.jobName}`))
        if (approverData){
          console.log(JSON.stringify(approverData.email))
        const content = {
          // to: 'suharsh.tyagi@brickred.in', 
          to : approverData.email,
          from: "v-pamoh@microsoft.com",
          subject: "New Request Waiting for Assignment",
          body: `Hello, A new request titled ${req.jobName} has been created on the Hardware Lab
                 Webpage by ${requestCreaterData.firstname}. Please review and assign the request
                  <strong><ul> <a href="https://${WEBSITE_NAME}/jobDetail/${req._id}"></a>. </ul></strong>`
          }
          // console.log(content)
          // if(process.env.SEND_MAILS){
            // console.log('sending mail')
            await this.emailFunction(content) 
          // }
          // enable email function to actually send the emails through in prod environment
        }
        else{
            const content = {
              from: "v-pamoh@microsoft.com",
              to: "suharsh.tyagi@brickred.in", //approverData.email
               // to : approverData.email,
              
              subject: "New Request Waiting for Assignment",
              body: `Hello, A new request titled ${req.jobName} was created 24 hours ago on the Hardware Lab
                 Webpage by ${requestCreaterData.firstname} , (${requestCreaterData.email}). Please review and assign a Project Contact to the request.
                  at https://${WEBSITE_NAME}/jobDetail/${req._id}`            }
           await this.emailFunction(content)
        // enable email function to actually send the emails through in prod environment
        }
        
      }

      else if (Math.floor(time_remaining.timingDayAfterTomorrow / (60 * 1000)) === Math.floor(Date.now() / (60 * 1000) + (24* 60))) {
        createdAts.push({ 'createdAt': req.createdAt, 'name': req.jobName })
        console.log('email sent after 48!')
      }
    return createdAts
  })
  // console.log(`createdAts ${JSON.stringify(createdAts)}`)
  // console.log(`requestsWithoutProjectContact ${requestsWithoutProjectContact }`)
  // --()-- cron job function runs every minute --()--
  // job = new Cron
  // go through all requests with projectContact === null. 
    // get their createdAt times
      // check if date.now() === createdAt + 24 hours
        // if true -> send mail to second approver.
         // if done -> set mail_sent_to_second_approver = true
      // elfe if date.now() === createdAt + 48 hours
        // if true -> send mail to third approver. 
          // if done -> set mail_sent_to_third_approver = true
      
}

// let approverData = User.findOne({ approverLevel: "level2" }).then((data) =>{
//   console.log(data)
// })
module.exports.emailFunction = (content) => {  //funtion to send email
  console.log('content', content)
    return new Promise((resolve,reject) => {
        try {
          var config = {
            method: 'post',
            url: 'https://hwlabemailservice.azurewebsites.net:443/api/EmailWorkflow/triggers/manual/invoke?api-version=2020-05-01-preview&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-9SbaUc8DshxCgh8k7HKtGGM2QFtTiNW2EtRP0JQnmc',
            headers: {
              'Content-Type': 'application/json'
            }, 
            data: content
          };
          axios(config)
            .then(function (response) {
              console.log('data back', JSON.stringify(response.data));
              resolve('success')
            })
            .catch(function (error) {
              console.log('error', error);
              reject(error)
            });

        } catch (error) {
            console.log(error)
        }
    })
    
}

// var axios = require('axios');
