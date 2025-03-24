// generalService.js
import axios from 'axios';

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

export const fetchBadWords = () => {
    return axios.get(`${API_URL}/bad-words`);
};

export const geocodeAddress = (address) => {
    return axios.get(`${API_URL}/geocode`, {
        params: { address }
    }).then(response => response.data)
      .catch(error => {
          throw error;
      });
};

export const verifyQRCode = (encryptedData, userLat, userLon) => {
    return new Promise((resolve) => {
        // Simulăm un răspuns de succes
        const mockResponse = {
            message: "QR code verificat cu succes!",
            verified: true,
            locationId: 72 // ID-ul locației simulate
        };
        
        resolve(mockResponse);
    });
};

// export const verifyQRCode = (encryptedData, userLat, userLon) => {
//     return axios.post(`${API_URL}/validate-qr`, { encryptedData, userLat, userLon })
//         .then(response => response.data)
//         .catch(error => {
//             throw error;
//         });
// };



export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation is not supported by your browser.');
        } else {
            const options = {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        }
    }).then(position => {
        const { latitude, longitude } = position.coords;
        return { latitude, longitude };
    }).catch(error => {
        console.error('Error obtaining location:', error);
        throw error;
    });
};

export const postReview = async (idLocatie, text, scor) => {
    const token = sessionStorage.getItem('TellTheTruth Token');

    try {

        const response = await axios.post(`${API_URL}/post-review`, {
            idLocatie,
            text,
            scor
        },  {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data; // Asigură-te că returnezi response.data
    } catch (error) {
        throw error;
    }
};

export const fetchRoute = async (startLat, startLng, destinationAddress) => {
    try {
        const destinationCoords = await geocodeAddress(destinationAddress);

        if (!destinationCoords) {
            throw new Error('Failed to retrieve coordinates for destination address.');
        }

        const response = await axios.post(`${API_URL}/route`, {
            startLat,
            startLng,
            endLat: destinationCoords.lat,
            endLng: destinationCoords.lng
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching route:', error);
        throw error;
    }
};

export const reportReview = async (reviewId, reason) => {
    const token = sessionStorage.getItem('TellTheTruth Token');

    try {
        const response = await axios.post(`${API_URL}/report-review`, {
            reviewId,
            reason
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error reporting review:', error);
        throw error;
    }
};

export const reportLocation = async (locationId, reason) => {
    const token = sessionStorage.getItem('TellTheTruth Token');

    try {
        const response = await axios.post(`${API_URL}/report-location`, {
            locationId,
            reason
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error reporting location:', error);
        throw error;
    }
};

export const deleteReview = async (reviewId) => {
    const token = sessionStorage.getItem('TellTheTruth Token'); // Presupunem că token-ul este stocat în sessionStorage
    try {
        const response = await axios.post(`${API_URL}/delete_review`, { reviewId }, {
            headers: {
                Authorization: `Bearer ${token}`  // Trimite token-ul JWT în header pentru autentificare
            }
        });

        return response.data; // Returnează răspunsul de la server
    } catch (error) {
        console.error('Error deleting review:', error);
        throw error; // Aruncă o excepție pentru a putea fi gestionată în altă parte
    }
};

// Funcție pentru ștergerea unei locații
export const deleteLocation = async (locationId) => {
    const token = sessionStorage.getItem('TellTheTruth Token');

    try {
        const response = await axios.post(`${API_URL}/delete_location`, { locationId }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data; // Returnează răspunsul de la server
    } catch (error) {
        console.error('Error deleting location:', error);
        throw error; // Aruncă o excepție pentru a putea fi gestionată în altă parte
    }
};

// Funcție pentru adăugarea unei locații la favorite
export const addFavoriteLocation = async (locationId) => {
    const token = sessionStorage.getItem('TellTheTruth Token');
    try {
        const response = await axios.post(`${API_URL}/add-favorite`, { locationId }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data; // Returnează răspunsul de la server
    } catch (error) {
        console.error('Error adding favorite location:', error);
        throw error; // Aruncă o excepție pentru a putea fi gestionată în altă parte
    }
};

// Funcție pentru ștergerea unei locații din lista de favorite
export const removeFavoriteLocation = async (locationId) => {
    const token = sessionStorage.getItem('TellTheTruth Token');
    try {
        const response = await axios.delete(`${API_URL}/remove-favorite`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: { locationId }  // Trimiterea locationId în corpul cererii
        });

        return response.data; // Returnează răspunsul de la server
    } catch (error) {
        console.error('Error removing favorite location:', error);
        throw error; // Aruncă o excepție pentru a putea fi gestionată în altă parte
    }
};

// Funcție pentru ștergerea unui raport de locație
export const deleteLocationReport = async (userId, locationId) => {
    const token = sessionStorage.getItem('TellTheTruth Token');

    try {
        const response = await axios.delete(`${API_URL}/delete-report-location`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: { userId, locationId }
        });

        return response.data; // Returnează răspunsul de la server
    } catch (error) {
        console.error('Error deleting location report:', error);
        throw error; // Aruncă o excepție pentru a putea fi gestionată în altă parte
    }
};

// Funcție pentru ștergerea unui raport de recenzie
export const deleteReviewReport = async (userId, reviewId) => {
    const token = sessionStorage.getItem('TellTheTruth Token');

    try {
        const response = await axios.delete(`${API_URL}/delete-report-review`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: { userId, reviewId }
        });

        return response.data; // Returnează răspunsul de la server
    } catch (error) {
        console.error('Error deleting review report:', error);
        throw error; // Aruncă o excepție pentru a putea fi gestionată în altă parte
    }
};
