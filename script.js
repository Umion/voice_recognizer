(() => {
  // SpeechRecognition start
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent =
    SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  var recordBtn = document.querySelector(".button.test");

  const words = ["selfie", "photo", "picture"];

  var recognition = new SpeechRecognition();
  if (SpeechGrammarList) {
    // SpeechGrammarList is not currently available in Safari, and does not have any effect in any other browser.
    // This code is provided as a demonstration of possible capability. You may choose not to use it.
    var speechRecognitionList = new SpeechGrammarList();
    var grammar =
      "#JSGF V1.0; grammar words; public <word> = " + words.join(" | ") + " ;";
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
  }
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  function startVoiceRecord() {
    recordBtn.disabled = true;
    recordBtn.textContent = "Test in progress";
    recognition.start();
  }

  recognition.onresult = function (event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    var speechResult = event.results[0][0].transcript.toLowerCase();
    console.log("sr", speechResult);
    for (let i = 0; i < words.length; i++) {
      if (speechResult.toLowerCase().includes(words[i].toLowerCase())) {
        takepicture();
        break;
      }
    }
    // diagnosticPara.textContent = "Speech received: " + speechResult + ".";
    // if (speechResult === phrase) {
    //   resultPara.textContent = "I heard the correct phrase!";
    //   resultPara.style.background = "lime";
    // } else {
    //   resultPara.textContent = "That didn't sound right.";
    //   resultPara.style.background = "red";
    // }

    console.log("Confidence: " + event.results[0][0].confidence);
  };

  recognition.onspeechend = function () {
    recognition.stop();
    recordBtn.disabled = false;
    recordBtn.textContent = "Voice";
  };

  recognition.onerror = function (event) {
    recordBtn.disabled = false;
    recordBtn.textContent = "Voice";
  };

  recognition.onaudiostart = function (event) {
    //Fired when the user agent has started to capture audio.
    console.log("SpeechRecognition.onaudiostart");
  };

  recognition.onaudioend = function (event) {
    //Fired when the user agent has finished capturing audio.
    console.log("SpeechRecognition.onaudioend");
  };

  recognition.onend = function (event) {
    //Fired when the speech recognition service has disconnected.
    console.log("SpeechRecognition.onend");
  };

  recognition.onnomatch = function (event) {
    //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    console.log("SpeechRecognition.onnomatch");
  };

  recognition.onsoundstart = function (event) {
    //Fired when any sound — recognisable speech or not — has been detected.
    console.log("SpeechRecognition.onsoundstart");
  };

  recognition.onsoundend = function (event) {
    //Fired when any sound — recognisable speech or not — has stopped being detected.
    console.log("SpeechRecognition.onsoundend");
  };

  recognition.onspeechstart = function (event) {
    //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    console.log("SpeechRecognition.onspeechstart");
  };
  recognition.onstart = function (event) {
    //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    console.log("SpeechRecognition.onstart");
  };

  // recordBtn.addEventListener("click", testSpeech);

  // SpeechRecognition end

  const width = 320; // We will scale the photo width to this
  let height = 0; // This will be computed based on the input stream

  let streaming = false;

  let video = null;
  let canvas = null;
  let photo = null;
  const content = document.querySelector(".content");
  const trymore = document.querySelector(".trymore");
  let record = false;

  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      // Ensure that if our document is in a frame, we get the user
      // to first open it in its own tab or window. Otherwise, it
      // won't be able to request permission for camera access.
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent = "View live result of the example code above";
      document.body.append(button);
      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }

  function startup() {
    if (showViewLiveResultButton()) {
      return;
    }
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");
    record = true;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
        record = false;
      });

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          // Firefox currently has a bug where the height can't be read from
          // the video, so we will make assumptions if this happens.

          if (isNaN(height)) {
            height = width / (4 / 3);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false
    );

    // startbutton.addEventListener(
    //   "click",
    //   (ev) => {
    //     takepicture();
    //     ev.preventDefault();
    //   },
    //   false
    // );

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    const context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    } else {
      clearphoto();
    }
  }

  function startRecord() {
    content.style.display = "block";
    trymore.style.display = "none";
    !record && startup();
    startVoiceRecord();
    // testSpeech();
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  recordBtn.addEventListener("click", startRecord, false);
})();
