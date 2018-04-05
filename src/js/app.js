(function () {
    // hack to view the error in browser
    window.onerror = function (error) {
        alert(error);
    };

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log(`Service Worker registed! Scope: ${registration.scope}`);
                })
                .catch(err => {
                    console.log(`Service Worker registration failed: ${err}`);
                });
        });
    }

})();



function postData() {
    var message = {
        name: 'David Test',
        age: 40,
        timeStamp: new Date().toString()
    }


    fetch('https://dbcoderainendpoint.herokuapp.com/notes', {
        method: 'POST',
        body: JSON.stringify(message),
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.text())
        .then(text => {
            console.log('response text is:' + text);
            try {
                return JSON.parse(text);
            } catch (err) {
                // It is text, do you text handling here
            }
        })
        .then(function (data) {
            if (data && data.success) {
                console.log('Data Sent successfully...');
            } else {
                console.log('Response from service is not good...');
            }
            return;
        });
}