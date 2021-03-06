'use strict';

process.env.DEBUG = 'actions-on-google:*';
const Assistant = require('actions-on-google').ApiAiAssistant;
const fs = require('fs')
const request = require('request');
const path = require('path')
const NAME_ACTION = 'build_phrase';
const chatbase_api_key = '****'
const verifier = require('alexa-verifier')

function generatePhrase(){
  var words, wordTypes, phrase, wordCount, rand, wordType, wt;
  words = {};
  phrase = "";
  wordTypes = [
      'intros',
      'adverbs',
      'verbs',
      'adjectives',
      'nouns'
  ]; // Order matters 

  words['intros'] = {"data":["I don't want to derail the meeting but I think we need to", "If you ask me, I think we should", "The key take away here is that we need to", "Does this"]};
  words['adverbs'] = {"data":["appropriately","assertively","authoritatively","collaboratively","compellingly","competently","completely","continually","conveniently","credibly","distinctively","dramatically","dynamically","efficiently","energistically","enthusiastically","globally","holisticly","interactively","intrinsicly","monotonectally","objectively","phosfluorescently","proactively","professionally","progressively","quickly","rapidiously","seamlessly","synergistically","uniquely"]};
  words['verbs'] = {"data":["actualize","administrate","aggregate","architect","benchmark","brand","build","communicate","conceptualize","coordinate","create","cultivate","customize","deliver","deploy","develop","disintermediate","disseminate","drive","embrace","e-enable","empower","enable","engage","engineer","enhance","envisioneer","evisculate","evolve","expedite","exploit","extend","fabricate","facilitate","fashion","formulate","foster","generate","grow","harness","impact","implement","incentivize","incubate","initiate","innovate","integrate","iterate","leverage existing","leverage other's","maintain","matrix","maximize","mesh","monetize","morph","myocardinate","negotiate","network","optimize","orchestrate","parallel task","plagiarize","pontificate","predominate","procrastinate","productivate","productize","promote","provide access to","pursue","recaptiualize","reconceptualize","redefine","re-engineer","reintermediate","reinvent","repurpose","restore","revolutionize","scale","seize","simplify","strategize","streamline","supply","syndicate","synergize","synthesize","target","transform","transition","underwhelm","unleash","utilize","visualize","whiteboard"]};
  words['adjectives'] = {"data":["24/7","24/365","accelerated","accurate","adaptive","alternative","an expanded array of","B2B","B2C","backend","backward-compatible","best-of-breed","bleeding-edge","bricks-and-clicks","business","clicks-and-mortar","client-based","client-centered","client-centric","client-focused","collaborative","compelling","competitive","cooperative","corporate","cost effective","covalent","cross functional","cross-media","cross-platform","cross-unit","customer directed","customized","cutting-edge","distinctive","distributed","diverse","dynamic","e-business","economically sound","effective","efficient","emerging","empowered","enabled","end-to-end","enterprise","enterprise-wide","equity invested","error-free","ethical","excellent","exceptional","extensible","extensive","flexible","focused","frictionless","front-end","fully researched","fully tested","functional","functionalized","future-proof","global","go forward","goal-oriented","granular","high standards in","high-payoff","high-quality","highly efficient","holistic","impactful","inexpensive","innovative","installed base","integrated","interactive","interdependent","intermandated","interoperable","intuitive","just in time","leading-edge","leveraged","long-term high-impact","low-risk high-yield","magnetic","maintainable","market positioning","market-driven","mission-critical","multidisciplinary","multifunctional","multimedia based","next-generation","one-to-one","open-source","optimal","orthogonal","out-of-the-box","pandemic","parallel","performance based","plug-and-play","premier","premium","principle-centered","proactive","process-centric","professional","progressive","prospective","quality","real-time","reliable","resource sucking","resource maximizing","resource-leveling","revolutionary","robust","scalable","seamless","stand-alone","standardized","standards compliant","state of the art","sticky","strategic","superior","sustainable","synergistic","tactical","team building","team driven","technically sound","timely","top-line","transparent","turnkey","ubiquitous","unique","user-centric","user friendly","value-added","vertical","viral","virtual","visionary","web-enabled","wireless","world-class","worldwide"]};
  words['nouns'] = {"data":["action items","alignments","applications","architectures","bandwidth","benefits","best practices","blamestorming","cadence","catalysts for change","channels","collaboration and idea-sharing","communities","content","convergence","core competencies","creative","customer service","data","deliverables","e-business","e-commerce","e-markets","e-tailers","e-services","experiences","expertise","functionalities","growth strategies","human capital","ideas","imperatives","infomediaries","information","infrastructures","initiatives","innovation","intellectual capital","interfaces","internal or organic sources","leadership","leadership skills","manufactured products","markets","materials","meta-services","methodologies","methods of empowerment","metrics","mindshare","models","networks","niches","niche markets","offline","opportunities","outsidethebox thinking","outsourcing","paradigms","partnerships","platforms","portals","potentialities","process improvements","processes","products","quality vectors","relationships","resources","results","ROI","scenarios","schemas","services","solutions","sources","strategic theme areas","supply chains","synergy","systems","technologies","technology","testing procedures","total linkage","upshot","users","value","vortals","web-readiness","web services","win-win"]};

  for (var i in wordTypes) {
      wt  = wordTypes[i];
      wordCount = words[wt]['data'].length;
      rand      = Math.round(Math.random() * (wordCount - 1));
      phrase    = phrase + words[wt]['data'][rand] + " ";
  }

  return phrase;
}

// [START ActionsValueAdder]
exports.actionsValueAdder = (req, res) => {
  const assistant = new Assistant({request: req, response: res});

  var q = '';
  try{
     q = req.body.result.resolvedQuery;
  }catch(e){
     q = '';
  }

  var formData = {
    api_key: chatbase_api_key,
    type: "user",
    user_id: req.body.originalRequest.data.user.user_id,
    time_stamp: (new Date).getTime(),
    platform: "Google-Home",
    message: q,
    not_handled: false
  }

  request.post('https://chatbase-area120.appspot.com/api/message').form(formData);

  function makePhrase (assistant) {
    assistant.tell('<speak>'
    + generatePhrase()
    + '<audio src="https://actions.google.com/sounds/v1/office/click_continuous.ogg"></audio>'
    + '</speak>');
  }

  let actionMap = new Map();
  actionMap.set(NAME_ACTION, makePhrase);
  actionMap.set('input.unknown', makePhrase);

  assistant.handleRequest(actionMap);
};
// [END ActionsValueAdder]

// [START SlackValueAdder]
exports.slackValueAdder = (req, res) => {

  return Promise.resolve()
    .then(() => {
      if (req.method !== 'POST') {
        const error = new Error('Only POST requests are accepted');
        error.code = 405;
        throw error;
      }
    })
    .then((response) => {

      var formData = {
        api_key: chatbase_api_key,
        type: "user",
        user_id: req.body.user_id,
        time_stamp: (new Date).getTime(),
        platform: "Slack",
        message: req.body.text,
        not_handled: false
      }

      // Send the formatted message back to Slack
      if(req.body.text == 'help') {
        res.json({
          response_type: 'in_channel',
          text: "It is as simple as typing `/addvalue`. Type that command in any DM or channel and I'll generate some random jargon for you to use in your next meeting.",
          attachments: []
        });
      } else {
        res.json({
          response_type: 'in_channel',
          text: generatePhrase(),
          attachments: []
        });        
      }

      request.post('https://chatbase-area120.appspot.com/api/message').form(formData);

    })
    .catch((err) => {
      console.error(err);
      res.status(err.code || 500).send(err);
      return Promise.reject(err);
    });

};
// [END SlackValueAdder]


// [START AlexaValueAdder]
exports.alexaValueAdder = (req, res) => {

  var formData = {
    api_key: chatbase_api_key,
    type: "user",
    user_id: req.body.session.user.userId,
    time_stamp: (new Date).getTime(),
    platform: "Alexa",
    message: "",
    not_handled: false
  }

  request.post('https://chatbase-area120.appspot.com/api/message').form(formData);

  // req.body.timestamp = 0;
  verifier(req.headers.signaturecertchainurl, req.headers.signature, JSON.stringify(req.body), function(err) {
    if (err) {
      return Promise.resolve()
        .then((response) => {
          res.status(401).json({ status: 'failure', reason: err });
        })
        .catch((err) => {
          res.status(err.code || 500).send(err);
          return Promise.reject(err);
        });
    } else {
      return Promise.resolve()
        .then(() => {
          if (req.method !== 'POST') {
            const error = new Error('Only POST requests are accepted');
            error.code = 405;
            throw error;
          }
        })
        .then((response) => {
          res.json({
            "version": "1.0",
            "sessionAttributes": {},
            "response": {
              "outputSpeech": {
                "type": "PlainText",
                "text": generatePhrase()
              },
              "shouldEndSession": true
            }
          });
        })
        .catch((err) => {
          res.status(err.code || 500).send(err);
          return Promise.reject(err);
        });
    }
  });
};
// [END AlexaValueAdder]


