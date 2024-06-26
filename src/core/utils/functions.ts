export function formatFirebaseTimestamp(timestamp) {
  const date = timestamp.toDate();

  const options = { month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);

  const dateArray = formattedDate.split(' ');
  return dateArray;
}
