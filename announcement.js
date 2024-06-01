// Get the necessary elements
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const postButton = document.getElementById('submitBtn');
const postContainer = document.getElementById('postContainer');

// Add a click event listener to the "Post" button
postButton.addEventListener('click', () => {
  // Get the values from the input fields
  const title = titleInput.value;
  const description = descriptionInput.value;

  // Create a new post element
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.innerHTML = `<h2>${title}</h2><p>${description}</p>`;

  // Append the new post to the post container
  postContainer.appendChild(postElement);

  // Clear the input fields
  titleInput.value = '';
  descriptionInput.value = '';
});

