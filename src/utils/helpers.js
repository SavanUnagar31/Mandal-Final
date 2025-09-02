const formatDate = (date) => new Date(date).toISOString().split('T')[0];

module.exports = { formatDate };