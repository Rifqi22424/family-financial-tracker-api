const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // Menghasilkan 6 karakter
};

module.exports = {
  generateUniqueId,
};
