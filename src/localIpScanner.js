export async function getLocalIP() {
  return new Promise((resolve, reject) => {
    const rtc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    rtc.createDataChannel("test");
    const candidates = [];

    rtc.onicecandidate = (event) => {
      if (event.candidate.candidate) {
        console.log(event.candidate, "event");
      } else {
        rtc.close();
        resolve(candidates[0] || null);
      }
    };

    rtc
      .createOffer()
      .then((offer) => rtc.setLocalDescription(offer))
      .catch(reject);
  });
}
