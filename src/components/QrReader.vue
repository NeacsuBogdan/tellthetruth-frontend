<template>
    <v-dialog v-model="dialog" max-width="600px" persistent>
        <v-card>
            <v-card-title>
                QR Scanner
            </v-card-title>
            <v-card-text>
                <div class="qr-scanner">
                    <div class="scanner-overlay"></div>
                    <video ref="video" @loadedmetadata="handleLoadedMetadata" playsinline></video>
                </div>
                <v-btn icon @click="stopScan" class="close-btn">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <select v-model="selectedDeviceId" @change="changeCamera" class="camera-select">
                    <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
                        {{ device.label || `Camera ${device.deviceId}` }}
                    </option>
                </select>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialogReview" max-width="600px">
        <review-form :idLocatie="idLocatieSelectata" @review-submitted="handleReviewSubmitted"></review-form>
    </v-dialog>

    <v-dialog v-model="showConsentDialog" class="confidential">
        <v-card>
            <v-card-title>Consimțământ pentru confidențialitate</v-card-title>
            <v-card-text>
                Avem nevoie de acces la camera și la locația dispozitivului pentru a putea folosi funcția de scanare. Ne permiteti să colectăm aceste informații?
            </v-card-text>
            <v-card-actions>
                <v-btn color="green" @click="giveConsent">Yes</v-btn>
                <v-btn color="red" @click="denyConsent">No</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>


<script setup>
import { ref } from 'vue';
import jsQR from 'jsqr';
import { verifyQRCode, getCurrentLocation } from '../services/generalService.js'; // Make sure paths are correct
import { toast } from 'vue3-toastify';
import ReviewForm from './ReviewForm.vue'; // Adaugă această linie sub celelalte importuri

const dialog = ref(false);
const video = ref(null);
let stream = null;
let scanning = false;
const videoDevices = ref([]);
const selectedDeviceId = ref('');
const dialogReview = ref(false); // Aceasta va controla afișarea dialogului formularului de recenzie
const idLocatieSelectata = ref(null); // Stocăm ID-ul locației selectate
const showConsentDialog = ref(false); // Automatically show the dialog when the component is used
const userConsent = ref(false); // Store the user's consent status
const userAgentInfo = ref('');


function giveConsent() {
    userConsent.value = true;
    showConsentDialog.value = false;
    sessionStorage.setItem('userConsent', 'true');
    startScanFlow(); // Start the scan flow after consent
}

function denyConsent() {
    userConsent.value = false;
    showConsentDialog.value = false;
    sessionStorage.setItem('userConsent', 'false');
    // Optionally, you can handle denial of consent by showing a message or disabling features
}


async function startScan() {
    const consent = sessionStorage.getItem('userConsent');
    if (consent === 'true') {
        userConsent.value = true;
        startScanFlow();
    } else {
        showConsentDialog.value = true;
    }
}


// Function to handle the complete scan flow
async function startScanFlow() {
        toast.info("Se pregătește scanerul...", {
        position: "top-right",
        timeout: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        hideProgressBar: false,
    });
    await enumerateDevices();
    if (videoDevices.value.length > 0) {
        selectedDeviceId.value = videoDevices.value[videoDevices.value.length-2].deviceId; // Default to the first camera
        startVideoStream();
    }
}

// Initialize and enumerate devices
async function enumerateDevices() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true }); // Prompt user for permissions
        const devices = await navigator.mediaDevices.enumerateDevices();
        stream.getTracks().forEach(track => track.stop()); // Oprirea stream-ului imediat după enumerare

        videoDevices.value = devices.filter(device => device.kind === 'videoinput').map(device => {
            return { deviceId: device.deviceId, label: device.label.split('(')[0].trim() };  // Clean label
        });
    } catch (error) {
        console.error('Error initializing camera:', error);
    }
}

// Start the video stream with the selected camera
async function startVideoStream() {
    if (!selectedDeviceId.value) {
        console.error("No camera selected.");
        return;
    }

    dialog.value = true;
    const constraints = { video: { deviceId: { exact: selectedDeviceId.value } } };

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.value.srcObject = stream;
        video.value.play();
        scanning = true;
        scanQRCode(); // Apelează scanarea după ce camera a început să transmită
    } catch (error) {
        console.error('Error accessing the camera:', error);
        dialog.value = false;
        scanning = false;
    }
}

// Handle video metadata loaded
function handleLoadedMetadata() {
    scanQRCode(); // Initiate QR code scanning once video metadata is loaded
}

// Called when a new camera is selected
function changeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Stop any existing streams
    }
    startVideoStream(); // Restart scanning with the newly selected camera
}

// Scan for QR codes
async function scanQRCode() {
    if (!scanning || video.value.readyState !== HTMLVideoElement.HAVE_ENOUGH_DATA) return;
    const canvasElement = document.createElement('canvas');
    const videoElement = video.value;
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const canvasContext = canvasElement.getContext("2d");
    canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

    if (code) {
        toast.info("QR Code detectat, incepe verificarea...", {
            position: "top-right",
            timeout: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            hideProgressBar: false,
        });

        try {
            const location = await getCurrentLocation();
            const response = await verifyQRCode(code.data, location.latitude, location.longitude);
            toast.success(`Rezultat verificare: ${response.message}`);
            if (response.verified) {
                idLocatieSelectata.value = response.locationId; // Salvăm ID-ul locației
                dialogReview.value = true; // Deschidem dialogul de recenzie
            }
        } catch (error) {
            toast.error(`Rezultat verificare: ${error.response.data.error || "Failed to verify QR Code."} distanta ${error.response.data.distance}`, {
                position: "top-right",
                timeout: 5000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                hideProgressBar: false,
            });
        }
        stopScan();
    } else {
        requestAnimationFrame(scanQRCode); // Continue scanning if no QR code found
    }
}

// Stop the video stream and scanning
function stopScan() {
    scanning = false;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (video.value) {
        video.value.pause();
        video.value.srcObject = null;
    }
    dialog.value = false;
}

function handleReviewSubmitted() {
    dialogReview.value = false;
}

// Expose methods and properties that need to be accessible from the parent
defineExpose({ startScan, stopScan, dialog, showConsentDialog });
</script>

<style scoped>
.qr-scanner {
    position: relative;
    width: 100%;
    height: 400px;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

video {
    width: 100%;
    height: 100%;
}

.scanner-overlay {
    position: absolute;
    width: 80%;
    max-width: 300px;
    height: auto;
    aspect-ratio: 1;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    color: white;
    background: red;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1000;
}

.camera-select {
    display: block;
    margin: 10px auto;
    color: white;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid white;
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 16px;
    cursor: pointer;
    z-index: 1000;
}

.confidential{
    max-width: 500px;
}
</style>