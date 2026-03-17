/* ================= TIME UTILITIES ================= */

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
};

export const isWithin24Hours = (createdAt) => {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const EDIT_WINDOW = 24 * 60 * 60 * 1000;
  return now - createdTime <= EDIT_WINDOW;
};

export const timeRemaining = (createdAt) => {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const EDIT_WINDOW = 24 * 60 * 60 * 1000;
  const remaining = EDIT_WINDOW - (now - createdTime);

  if (remaining <= 0) return "Locked";

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m left`;
};
