//User Lookup by email Helper 
const findUserByEmail = (emailtoFind, obj) => {
  for (let key in obj) {
    const user = obj[key];
    if (user.email === emailtoFind) {
      return user;
    }
  }
  return null;
};


//Function to generate alphanumeric string of "length"
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}


module.exports = { findUserByEmail, generateRandomString };