const baseUrl = '/api/v1/';

export const api = {
    get(url, dataType = 'json') {
        const apiUrl = `${baseUrl}${url}`;
        const promise = fetch(apiUrl, {
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                // 'Content-Type': `application/${dataType}`,
                // 'Authorization': lscache.get('authorization')
            }
        });
        // debugger;
        return promise.then(response => {
            if (response.status !== 204) {
                return dataType !== 'json' ? response.text : response.json();
            }
            return null;
        });
    },

    // post(url, data) {
    //     const apiUrl = `${baseUrl}${url}`;
    //     return fetch(apiUrl, {
    //         mode: 'cors',
    //         method: 'POST',
    //         headers: {
    //             'Access-Control-Allow-Origin': '*',
    //             'Content-Type': 'application/json',
    //             // 'Authorization': lscache.get('authorization')
    //         },
    //         body: JSON.stringify(data)
    //     });
    // }
};
