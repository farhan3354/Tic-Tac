import React, { useState, useEffect } from "react";
import { Box, Snackbar, Alert, Typography, Switch } from "@mui/material";
import axios from "axios";
import soundWaveImage from "./webio.jpeg"; // Add a sound wave image for visual appeal

const SoundDetection = () => {
  const [isListening, setIsListening] = useState(false);
  const [detectedSounds, setDetectedSounds] = useState([]);
  const [notification, setNotification] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingInterval, setRecordingInterval] = useState(null);

  useEffect(() => {
    if (isListening) {
      startRecording();
    } else {
      stopRecording();
    }
    return () => stopRecording();
  }, [isListening]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const testSounds = {
        1: "Running Water",
        2: "Stove ON",
        3: "Front Door",
        4: "Stove OFF",
      };
      if (testSounds[event.key]) {
        handleDetection({ predicted_class: testSounds[event.key] });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        if (!isListening) return;

        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        audioChunks = [];
        sendAudioToAPI(audioBlob);

        recorder.start();
        setTimeout(() => recorder.stop(), 5000); // Capture 5-second chunks
      };

      recorder.start();
      setTimeout(() => recorder.stop(), 5000); // First recording after 5s
      setMediaRecorder(recorder);

      // Set an interval to send API request every 5-10 seconds
      const interval = setInterval(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, Math.random() * (10000 - 5000) + 5000); // Random interval between 5-10 sec
      setRecordingInterval(interval);
    } catch (error) {
      console.error("Error accessing microphone: ", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
  };

  const sendAudioToAPI = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/predict-audio/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      handleDetection(response.data);
      setApiStatus({
        message: "Sound detected successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending audio to API: ", error);
      setApiStatus({ message: "API request failed!", severity: "error" });
    }
  };

  const handleDetection = (data) => {
    if (data.predicted_class) {
      setDetectedSounds((prev) => [...prev, data.predicted_class]);
      setNotification(`Detected: ${data.predicted_class}`);
    }
  };

  return (
    <Box className="sound-detection-container">
      <img
        src={soundWaveImage}
        alt="Sound Wave"
        style={{ width: "100px", marginBottom: "20px" }}
      />
      <Typography className="sound-detection-header">
        Real-Time Sound Detection
      </Typography>
      <Typography className="sound-detection-subheader">
        Toggle sound detection ON/OFF
      </Typography>
      <Switch
        className="sound-detection-switch"
        checked={isListening}
        onChange={() => setIsListening(!isListening)}
      />

      {/* Detected Sounds History */}
      <Box className="detection-history-box">
        <Typography className="detection-history-header">
          Detection History
        </Typography>
        {detectedSounds.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No sounds detected yet.
          </Typography>
        ) : (
          detectedSounds.map((sound, index) => (
            <Typography key={index} className="detection-history-item">
              {sound}
            </Typography>
          ))
        )}
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
      >
        <Alert onClose={() => setNotification(null)} severity="info">
          {notification}
        </Alert>
      </Snackbar>

      {/* API Status Snackbar */}
      <Snackbar
        open={!!apiStatus}
        autoHideDuration={3000}
        onClose={() => setApiStatus(null)}
      >
        <Alert
          onClose={() => setApiStatus(null)}
          severity={apiStatus?.severity}
        >
          {apiStatus?.message}
        </Alert>
      </Snackbar>

      {/* Testing Mode Instructions */}
      <Box className="testing-mode-box">
        <Typography className="testing-mode-header">Testing Mode</Typography>
        <Typography className="testing-mode-instructions">
          Press 1 for Running Water, 2 for Stove ON, 3 for Front Door, 4 for
          Stove OFF
        </Typography>
      </Box>
    </Box>
    // <Box sx={{ textAlign: "center", p: 3 }}>
    //   <Typography variant="h5">Real-Time Sound Detection</Typography>
    //   <Typography variant="body2" color="textSecondary">
    //     Toggle sound detection ON/OFF
    //   </Typography>
    //   <Switch
    //     checked={isListening}
    //     onChange={() => setIsListening(!isListening)}
    //   />
    //   {/* Detected Sounds History */}
    //   <Box
    //     mt={3}
    //     p={2}
    //     sx={{
    //       border: "1px solid #ddd",
    //       borderRadius: 2,
    //       maxWidth: 400,
    //       margin: "auto",
    //     }}
    //   >
    //     <Typography variant="h6">Detection History</Typography>
    //     {detectedSounds.length === 0 ? (
    //       <Typography variant="body2" color="textSecondary">
    //         No sounds detected yet.
    //       </Typography>
    //     ) : (
    //       detectedSounds.map((sound, index) => (
    //         <Typography key={index}>{sound}</Typography>
    //       ))
    //     )}
    //   </Box>

    //   {/* Notification Snackbar */}
    //   <Snackbar
    //     open={!!notification}
    //     autoHideDuration={5000}
    //     onClose={() => setNotification(null)}
    //   >
    //     <Alert onClose={() => setNotification(null)} severity="info">
    //       {notification}
    //     </Alert>
    //   </Snackbar>

    //   {/* API Status Snackbar */}
    //   <Snackbar
    //     open={!!apiStatus}
    //     autoHideDuration={3000}
    //     onClose={() => setApiStatus(null)}
    //   >
    //     <Alert
    //       onClose={() => setApiStatus(null)}
    //       severity={apiStatus?.severity}
    //     >
    //       {apiStatus?.message}
    //     </Alert>
    //   </Snackbar>

    //   {/* Testing Mode Instructions */}
    //   <Box mt={2}>
    //     <Typography variant="h6">Testing Mode</Typography>
    //     <Typography variant="body2">
    //       Press 1 for Running Water, 2 for Stove ON, 3 for Front Door, 4 for
    //       Stove OFF
    //     </Typography>
    //   </Box>
    // </Box>
  );
};

export default SoundDetection;

// import React, { useState, useEffect } from "react";
// import { Box, Snackbar, Alert, Typography, Switch } from "@mui/material";
// import axios from "axios";
// import soundWaveImage from "./webio.jpeg"; // Add a sound wave image for visual appeal

// const SoundDetection = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [detectedSounds, setDetectedSounds] = useState([]);
//   const [notification, setNotification] = useState(null);
//   const [apiStatus, setApiStatus] = useState(null);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [recordingInterval, setRecordingInterval] = useState(null);

//   useEffect(() => {
//     if (isListening) {
//       startRecording();
//     } else {
//       stopRecording();
//     }
//     return () => stopRecording();
//   }, [isListening]);

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       const testSounds = {
//         1: "Running Water",
//         2: "Stove ON",
//         3: "Front Door",
//         4: "Stove OFF",
//       };
//       if (testSounds[event.key]) {
//         handleDetection({ predicted_class: testSounds[event.key] });
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       let audioChunks = [];

//       recorder.ondataavailable = (event) => {
//         audioChunks.push(event.data);
//       };

//       recorder.onstop = async () => {
//         if (!isListening) return;

//         const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//         audioChunks = [];
//         sendAudioToAPI(audioBlob);

//         recorder.start();
//         setTimeout(() => recorder.stop(), 5000); // Capture 5-second chunks
//       };

//       recorder.start();
//       setTimeout(() => recorder.stop(), 5000); // First recording after 5s
//       setMediaRecorder(recorder);

//       // Set an interval to send API request every 5-10 seconds
//       const interval = setInterval(() => {
//         if (recorder.state === "recording") {
//           recorder.stop();
//         }
//       }, Math.random() * (10000 - 5000) + 5000); // Random interval between 5-10 sec
//       setRecordingInterval(interval);
//     } catch (error) {
//       console.error("Error accessing microphone: ", error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder) {
//       mediaRecorder.stop();
//       mediaRecorder.stream.getTracks().forEach((track) => track.stop());
//     }
//     if (recordingInterval) {
//       clearInterval(recordingInterval);
//       setRecordingInterval(null);
//     }
//   };

//   const sendAudioToAPI = async (audioBlob) => {
//     const formData = new FormData();
//     formData.append("file", audioBlob, "audio.wav");

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8080/predict-audio/",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       handleDetection(response.data);
//       setApiStatus({
//         message: "Sound detected successfully!",
//         severity: "success",
//       });
//     } catch (error) {
//       console.error("Error sending audio to API: ", error);
//       setApiStatus({ message: "API request failed!", severity: "error" });
//     }
//   };

//   const handleDetection = (data) => {
//     if (data.predicted_class) {
//       setDetectedSounds((prev) => [...prev, data.predicted_class]);
//       setNotification(`Detected: ${data.predicted_class}`);
//     }
//   };

//   return (
//     <Box className="sound-detection-container">
//       <img src={soundWaveImage} alt="Sound Wave" style={{ width: "100px", marginBottom: "20px" }} />
//       <Typography className="sound-detection-header">Real-Time Sound Detection</Typography>
//       <Typography className="sound-detection-subheader">
//         Toggle sound detection ON/OFF
//       </Typography>
//       <Switch
//         className="sound-detection-switch"
//         checked={isListening}
//         onChange={() => setIsListening(!isListening)}
//       />

//       {/* Detected Sounds History */}
//       <Box className="detection-history-box">
//         <Typography className="detection-history-header">Detection History</Typography>
//         {detectedSounds.length === 0 ? (
//           <Typography variant="body2" color="textSecondary">
//             No sounds detected yet.
//           </Typography>
//         ) : (
//           detectedSounds.map((sound, index) => (
//             <Typography key={index} className="detection-history-item">
//               {sound}
//             </Typography>
//           ))
//         )}
//       </Box>

//       {/* Notification Snackbar */}
//       <Snackbar
//         open={!!notification}
//         autoHideDuration={5000}
//         onClose={() => setNotification(null)}
//       >
//         <Alert onClose={() => setNotification(null)} severity="info">
//           {notification}
//         </Alert>
//       </Snackbar>

//       {/* API Status Snackbar */}
//       <Snackbar
//         open={!!apiStatus}
//         autoHideDuration={3000}
//         onClose={() => setApiStatus(null)}
//       >
//         <Alert
//           onClose={() => setApiStatus(null)}
//           severity={apiStatus?.severity}
//         >
//           {apiStatus?.message}
//         </Alert>
//       </Snackbar>

//       {/* Testing Mode Instructions */}
//       <Box className="testing-mode-box">
//         <Typography className="testing-mode-header">Testing Mode</Typography>
//         <Typography className="testing-mode-instructions">
//           Press 1 for Running Water, 2 for Stove ON, 3 for Front Door, 4 for Stove OFF
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// export default SoundDetection;
