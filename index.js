// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios = require('axios');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
  const parameter = request.body.queryResult.parameters;
  
  // const contexts = request.body.queryResult.outputContext[0].parameters;
  
  // url points to hospital ER data
  const hospitalsURL = 'http://data.medicare.gov/resource/3z8n-wcgr.geojson?$limit=5000&measure_id=OP_20';
  
  // url points to basic hospital data 
  const hospitalBasicsURL = 'https://data.medicare.gov/resource/rbry-mqwu.json?$limit=5000';
  
  //mapboxAPIkey
  const APIkey = 'pk.eyJ1IjoiYWxpY2lhc2Vjb3JkIiwiYSI6ImNqZ2Q0cW5oeDNybjgyd241cTR1eGMyenYifQ.IyZgMzeCKNb6tyglxHWU8w';
  
  // default welcome intent 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
  
  // default fallback intent
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  // start the conversation "OK Google, I have an emergency"
  function emergencyStart(agent) {
    agent.add(`It sounds like you're having an emergency. Would you like to call 911?`);
  }
  
  // If user agrees to call 911
  function call911(agent){
    // GoogleHome can't call
    agent.add(`I can't call 911 from your device. Please use a phone to call 911.`)
    
    // GoogleAssistant can give link to call 911
    agent.add(new Card({
        title: `Call 911`,
        text: `When you call 911, be prepared to answer the call-taker's questions, which may include:
            \n The location of the emergency,
            \nThe phone number you are calling from,
            \nThe nature of the emergency, and
            \nDetails about the emergency, such as a description of injuries or symptoms being experienced by a person having a medical emergency`,
        buttonText: 'Click to call 911',
        buttonUrl: 'tel:+911'
        })
    )
  }
  
  // If they don't call 911, prompt to look up nearby hospitals
  function DoNotCall911(agent){
      agent.add(`OK. Would you like me to look up nearby hospitals or look up the average wait time at a specific hospital?`)
  }
  
  // If they don't want to look up a hospital, end conversation
  function DoNotLookup (agent){
      agent.add('OK, exiting E R Helper now.')
  }
  
  // Look up a specific hospital
  function lookupHospital(agent){
      let hospital = parameter.hospital;
      
    //   let time = axios.get(hospitalsURL)
    //     .then(response => {response.json()})
    //     .then(data => {
    //         for (let location in data.features){
    //             if (hospital == data.features[location].properties.hospital_name){
    //                 return data.features[location].properties.score;
    //             }
    //         }
    //     })
      
      let time2 = '33 minutes';

      agent.add(`The average wait time for ${hospital} is ${time2}.
      Wait times are based on yearlong average data. Would you like to call ${hospital} to find out the current wait time?
      `);
  }
  
  // Yes, call
  function callHospital(agent){
    // let hospitalName = response.body.queryResult.outputContexts[0].parameters.hospitalName;
    
    // let phone = axios.get(hospitalBasicsURL)
    //     .then(response => {return response.json()})
    //     .then (data => {
    //         for (let location in response){
    //             if (hospital == 'response[location].hospital_name'){
    //                 return response[location].phone_number
    //             }
    //         }
    //     });
    
    agent.add(`The phone number for CHILDREN'S HOSPITAL OF MICHIGAN is (313)745-5437.`)
    agent.add(
        new Card({
            title: `Children's Hospital of Michigan`,
            imageUrl: 'https://lh4.googleusercontent.com/proxy/Eq9DWBX521XvlQ_WST5SxH4IbL5BGY0kTPOpRzZB4qjF6hhULgdQ5kKTSQbI8q0JZO8R3xYY_O6m5QzjwjmH6GQXqLc0qiaALbrzQEhKR5PTUTNMUEHTJd01xg_mX-HiAFS3e2W3Pt3l6Kmw5Jubm6QlDN-kn2I=w227-h152-k-no',
            text: `3901 Beaubien St, Detroit, MI 48201`, // hospitalList[0].address
            buttonText: `Call Children's Hospital of Michigan`,
            buttonUrl: `tel: +3137455437}` // ${hospitalList[0].phone
        })
        )
  }
  
  // Look up nearby hospitals, then ask for address
  function askAddress (agent){
      agent.add(`OK. Please tell me the address of your location so that I can look-up the nearest hospitals.`)
  }
  
  // Confirm the address they gave
  function confirmAddress (agent){
      let address ='';
      let city = '';
      let state = '';
      let zipcode = '';
      let location = '';
      
      function makeAddress(){
          if (parameter.address){
              location += (parameter.address + ', ')
          }
          else{location = location}
          if (parameter.city){
              location += (parameter.city + ', ')
          }
          else{location = location}
          if (parameter.state){
              location += (parameter.state + ' ')
          }
          else{location = location}
          if (parameter.zipcode){
              location += (parameter.zipcode)
          }
          else{location = location}
          return location;
      }
      
      makeAddress()
      
      agent.add(`Your location is ${location}. Is that correct?`)
      
      //mapbox geolocate URL
      let coordsURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + location + '.json?access_token=' + APIkey;
 
      // code from mapbox turns address into coordinates
    //   axios.get(coordsURL)
    //     .then(response => {return response.json()})
    //     .then(data => {return (data.features[0].center)});
  }
  
  // If the address is incorrect
  function incorrectAddress(agent){
      agent.add(`I'm sorry. Please give me the address of your location again.`)
  }
  
  // If the address is correct
  function nearbyHospitals(agent){
      // code from mapbox goes here comparing coordinates of address above to coordinates of hospitals in dataset for distance times and sorting
      // code from dataset gives hospital wait times
      
      agent.add(
          `Here are three nearby hospitals: 
          HARPER UNIVERSITY HOSPITAL is 7 minutes away and the average wait time is 8 minutes. It is estimated that you would see a doctor in 15 minutes.
          DETROIT RECEIVING HOSPITAL & UNIV HEALTH CENTER is 8 minutes away and the average wait time is 16 minutes. It is estimated that you would see a doctor in 24 minutes.
          HENRY FORD HOSPITAL is 7 minutes away and the average wait time is 33 minutes. It is estimated that you would see a doctor in 40 minutes.
          These wait times are based on yearlong average data. Would you like to call one of these hospitals to find out the current wait time?
          `);
  }
  
  // Yes, call this selected hospital
  function callThisHospital(agent){
    let hospitalName = parameter.hospital;

    // let hospitalList = [];
    // axios.get(hospitalBasicsURL)
    //     .then(response => {return response.json()})
    //     .then(data => {
    //         for (let location in data){
    //             if (hospitalName == data[location].hospital_name){
    //                 hospitalList.push({
    //                     'address' : `${data[location].location_address}, ${data[location].location_city}, ${data[location].location_state} ${data[location].location_zipcode}`, 
    //                     'phone' : data[location].phone_number
    //                 })
    //             }
    //         }
    //     });
    
    agent.add(`The phone number for ${hospitalName} is (313)745-8040.`); //${hospitalList[0].phone}
    
    agent.add(
        new Card({
            title: `${hospitalName}`,
            imageUrl: 'https://lh4.googleusercontent.com/proxy/Eq9DWBX521XvlQ_WST5SxH4IbL5BGY0kTPOpRzZB4qjF6hhULgdQ5kKTSQbI8q0JZO8R3xYY_O6m5QzjwjmH6GQXqLc0qiaALbrzQEhKR5PTUTNMUEHTJd01xg_mX-HiAFS3e2W3Pt3l6Kmw5Jubm6QlDN-kn2I=w227-h152-k-no',
            text: `3990 John R St, Detroit, MI 48201`, // hospitalList[0].address
            buttonText: `Call ${hospitalName}`,
            buttonUrl: `tel: +3137458040}` // ${hospitalList[0].phone
        })
        )
  }
  
  // No, done with helper
  function done(agent){
      agent.add(`Thank you for using E R Helper. Exiting now.`)
  }
  
  // This is the function I was using to test APIs. Turns state into postal code, passes to URL and returns the number of hospitals in that state
  function numberOfHospitals(agent){
      let state = parameter.state;
      
        const TO_NAME = 1;
        const TO_ABBREVIATED = 2;

        function convertRegion(input, to) {
            let  states = [
                ['Alabama', 'AL'],
                ['Alaska', 'AK'],
                ['American Samoa', 'AS'],
                ['Arizona', 'AZ'],
                ['Arkansas', 'AR'],
                ['Armed Forces Americas', 'AA'],
                ['Armed Forces Europe', 'AE'],
                ['Armed Forces Pacific', 'AP'],
                ['California', 'CA'],
                ['Colorado', 'CO'],
                ['Connecticut', 'CT'],
                ['Delaware', 'DE'],
                ['District Of Columbia', 'DC'],
                ['Florida', 'FL'],
                ['Georgia', 'GA'],
                ['Guam', 'GU'],
                ['Hawaii', 'HI'],
                ['Idaho', 'ID'],
                ['Illinois', 'IL'],
                ['Indiana', 'IN'],
                ['Iowa', 'IA'],
                ['Kansas', 'KS'],
                ['Kentucky', 'KY'],
                ['Louisiana', 'LA'],
                ['Maine', 'ME'],
                ['Marshall Islands', 'MH'],
                ['Maryland', 'MD'],
                ['Massachusetts', 'MA'],
                ['Michigan', 'MI'],
                ['Minnesota', 'MN'],
                ['Mississippi', 'MS'],
                ['Missouri', 'MO'],
                ['Montana', 'MT'],
                ['Nebraska', 'NE'],
                ['Nevada', 'NV'],
                ['New Hampshire', 'NH'],
                ['New Jersey', 'NJ'],
                ['New Mexico', 'NM'],
                ['New York', 'NY'],
                ['North Carolina', 'NC'],
                ['North Dakota', 'ND'],
                ['Northern Mariana Islands', 'NP'],
                ['Ohio', 'OH'],
                ['Oklahoma', 'OK'],
                ['Oregon', 'OR'],
                ['Pennsylvania', 'PA'],
                ['Puerto Rico', 'PR'],
                ['Rhode Island', 'RI'],
                ['South Carolina', 'SC'],
                ['South Dakota', 'SD'],
                ['Tennessee', 'TN'],
                ['Texas', 'TX'],
                ['US Virgin Islands', 'VI'],
                ['Utah', 'UT'],
                ['Vermont', 'VT'],
                ['Virginia', 'VA'],
                ['Washington', 'WA'],
                ['West Virginia', 'WV'],
                ['Wisconsin', 'WI'],
                ['Wyoming', 'WY'],
            ];
    
            var i; // Reusable loop variable
            if (to == TO_ABBREVIATED) {
                input = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
                for (i = 0; i < states.length; i++) {
                    if (states[i][0] == input) {
                        return (states[i][1]);
                    }
                }
            }
        }
    let stateABBR = convertRegion(parameter.state, 2);
    
    let stateURL = hospitalsURL + '&location_state=' + stateABBR;
    
    let hospitalNumber = axios.get(stateURL)
            .then(response => {return response.features.length});
            
    agent.add(`There are ${hospitalNumber} hospitals in ${state}`);
  }
    
    

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('emergency', emergencyStart);
  intentMap.set('call911', call911);
  intentMap.set('DoNotCall911', DoNotCall911);
  intentMap.set('DoNotLookup', DoNotLookup);
  intentMap.set('chooseNearby', askAddress);
  intentMap.set('giveAddress', confirmAddress);
   intentMap.set('incorrectAddress', incorrectAddress);
  intentMap.set('nearbyHospitals', nearbyHospitals);
  intentMap.set('callThisHospital', callThisHospital); 
  intentMap.set('done', done);
  intentMap.set('lookupHospital', lookupHospital);
  intentMap.set('callHospital', callHospital);
  intentMap.set('hospitals', numberOfHospitals);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});