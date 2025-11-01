export const formatDate = (dateInput) => {
  if (!dateInput) return ""; // handle null or undefined
  const date = new Date(dateInput);
  if (isNaN(date)) return ""; // handle invalid date
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default formatDate;
