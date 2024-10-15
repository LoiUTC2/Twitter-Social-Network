const firebase = require('firebase')
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      onSignInSubmit();
    }
});
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'normal',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      // ...
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
      // ...
    }
});
recaptchaVerifier.render().then((widgetId) => {
    window.recaptchaWidgetId = widgetId;
});
const recaptchaResponse = grecaptcha.getResponse(recaptchaWidgetId);

const appVerifier = window.recaptchaVerifier;
firebase.auth().signInWithPhoneNumber("0345263131", appVerifier)
    .then((confirmationResult) => {
      // SMS sent. Prompt user to type the code from the message, then sign the
      // user in with confirmationResult.confirm(code).
      window.confirmationResult = confirmationResult;
      // ...
    }).catch((error) => {
      // Error; SMS not sent
      // ...
    });