exports.formatDate = (date) => new Date(date).toISOString().split("T")[0];
exports.generatePNR = () => Math.floor(Math.random() * 1000000);
