// locationService.js
import axios from 'axios';


// Determine the base URL dynamically
const getApiUrl = () => {
    let apiUrl;
    if (window.location.hostname === 'localhost') {
        apiUrl = 'http://localhost:8080';  // Local development
    } else {
        const hostname = window.location.hostname;
        apiUrl = `https://${hostname}:8080`;  // Presupunem HTTPS și portul 8080
    }
    return apiUrl;
}


const API_URL = getApiUrl();

// Function to submit location data to the backend with the token
export const submitLocation = async (locationData, images) => {
    try {
        // Retrieve the token stored in session storage
        const token = sessionStorage.getItem('TellTheTruth Token');

        // Create an instance of FormData
        const formData = new FormData();

        // Append each field in locationData to the formData
        for (const key in locationData) {
            if (locationData.hasOwnProperty(key)) {
                formData.append(key, locationData[key]);
            }
        }

        // Append images to formData under the same field name for compatibility with multer.array()
        images.forEach((image) => {
            formData.append('images', image); // Use 'images' for all files if using multer.array('images')
        });


        // Make the POST request with the Authorization header and FormData
        const response = await axios.post(`${API_URL}/submit-location`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'  // This is usually not necessary as axios sets it automatically
            }
        });

        return response.data;  // Returns the response data from the server
    } catch (error) {
        throw error;  // Rethrows the error to be handled by the caller
    }
}

export const updateLocation = async (locationData) => {
    try {
        const token = sessionStorage.getItem('TellTheTruth Token');
        const response = await axios.post(`${API_URL}/update-location`, locationData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Funcție pentru generarea unui cod QR pe baza denumirii și adresei
export const generateQRCode = (name, address) => {
    return axios.post(`${API_URL}/generate-qr`, {
        name: name,
        address: address
    }).then(response => response.data)
      .catch(error => {
          throw error; // Aruncă o eroare mai departe pentru a fi gestionată de apelant
      });
};



export const checkLocation = (cui, data) => {
    return new Promise((resolve) => {
        resolve({
            found: [
                {
                    date_generale: {
                        denumire: 'test'
                    }
                }
            ]
        });
    });
};

// export const checkLocation = (cui, data) => {
//     return axios.post(`${API_URL}/check-location`, {
//         cui: cui, // Trimite CUI-ul (Cod Unic de Identificare) al locației
//         data: data // Trimite datele asociate locației
//     }).then(response => {
//         return response.data; // Returnează datele primite de la server
//     }).catch(error => {
//         throw error; // Aruncă eroarea pentru a fi gestionată de apelant
//     });
// };

// Function to get recommended locations based on user coordinates
export const getRecommendedLocations = async (latitude, longitude) => {
    try {
        const token = sessionStorage.getItem('TellTheTruth Token');
        const response = await axios.post(
            `${API_URL}/recommendations`,
            { latitude, longitude },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return response.data.recommendations; // Returnăm direct array-ul de ID-uri

    } catch (error) {
        throw error;
    }
}




// You can add more service functions here as needed
