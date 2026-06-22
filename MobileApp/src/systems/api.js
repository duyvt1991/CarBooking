import axios from 'axios';
import { API_ENDPOINT, DEBUG_WITH_MOCK_DATA } from "./constant";
import { mockData } from './mockData';

let abortTimeouts = [];

function postFormData(action, data, options = {}) {
    if (DEBUG_WITH_MOCK_DATA) {
        clearTimeout(abortTimeouts[action]);
        return new Promise((resolve) => {
            abortTimeouts[action] = setTimeout(() => {
                resolve(mockData(action, data));
            }, 250);
          });
    } else {
        const formData = new FormData();
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== '' && data[key] !== null && data[key] !== 'null') {
                if (Array.isArray(data[key])) {
                    data[key].forEach((item, index) => {
                        formData.append(`${key}[${index}]`, item);
                    });
                } else {
                    formData.append(key, data[key]);
                }
            }
        }
        let headers = {
            'Content-Type': 'multipart/form-data'
        };
        if (window.location.origin.includes('localhost')) {
            headers["Authorization"] = process.env.REACT_APP_AUTHORIZATION_TOKEN;
        }
        let url = `${API_ENDPOINT}/api/?action=${action}`;
        if (window.BX_AUTH && window.BX_AUTH.AUTH_ID) {
            url += `&auth=${encodeURIComponent(window.BX_AUTH.AUTH_ID)}`;
            if (window.BX_AUTH.DOMAIN) {
                url += `&domain=${encodeURIComponent(window.BX_AUTH.DOMAIN)}`;
            }
        }
        return axios.post(url, formData, {
            headers: headers,
            signal: options.signal,
            withCredentials: true
        }).then(response => response.data);
    }
}

export function getMasterDataVersion(options = {}) {
    return postFormData('getMasterDataVersion', {}, options);
}

export function getMasterData(options = {}) {
    return postFormData('getMasterData', {}, options);
}

export function suggestionUsers(component, keyword, options = {}) {
    return postFormData('suggestionUsers', { keyword, component }, options);
}

export function suggestionClients(component, keyword, options = {}) {
    return postFormData('suggestionClients', { keyword, component }, options);
}

export function suggestionExternalClients(component, keyword, options = {}) {
    return postFormData('suggestionExternalClients', { keyword, component }, options);
}

export function suggestionDepartureLocations(component, keyword, options = {}) {
    return postFormData('suggestionDepartureLocations', { keyword, component }, options);
}

export function deleteItem(component, id, options = {}) {
    return postFormData('deleteItem', { id, component }, options);
}

export function deactiveItem(component, id, options = {}) {
    return postFormData('deactiveItem', { id, component }, options);
}

export function activeItem(component, id, options = {}) {
    return postFormData('activeItem', { id, component }, options);
}

export function approveItem(component, id, options = {}) {
    return postFormData('approveItem', { id, component }, options);
}

export function submitItem(component, data, options = {}) {
    return postFormData('submitItem', { ...data, component }, options);
}

export function getList(component, filters = {}, page = 1, limit = 20, options = {}) {
    return postFormData('getList', { filters: JSON.stringify(filters), page, limit, component }, options);
}

export function getStatistics(component, options = {}) {
    return postFormData('getStatistics', { component }, options);
}

export function getBookings(component, data, options = {}) {
    return postFormData('getBookings', { ...data, component }, options);
}

export function getAvailableRooms(component, data, options = {}) {
    return postFormData('getAvailableRooms', { ...data, component }, options);
}

export function confirmItem(component, id, options = {}) {
    return postFormData('confirmItem', { id, component }, options);
}