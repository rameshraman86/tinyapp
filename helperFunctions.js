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

module.exports = { findUserByEmail };