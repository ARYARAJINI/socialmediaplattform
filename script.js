// Utility function to check if a user is logged in
function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

// Utility function to set the logged-in user
function setCurrentUser(username) {
    localStorage.setItem('currentUser', username);
}

// Function to clear the current session (logout)
function logout() {
    localStorage.removeItem('currentUser'); // Remove the current user from localStorage
    window.location.href = 'profile-create.html'; // Redirect to the profile creation page
}

// Function to load posts for the current user
function loadPosts() {
    const user = getCurrentUser();
    if (!user) {
        alert("Please create a profile first!");
        window.location.href = 'profile-create.html'; // Redirect to profile creation page
        return;
    }

    const postList = document.getElementById('post-list');
    const userData = JSON.parse(localStorage.getItem('users')) || {};
    const posts = userData[user]?.posts || [];

    postList.innerHTML = ''; // Clear previous posts

    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        
        // Create post HTML
        const postContent = `
            <p>"${post.quote}"</p>
            ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image" />` : ''}
            <button onclick="deletePost(${index})">Delete</button>
        `;
        
        postElement.innerHTML = postContent;
        postList.appendChild(postElement);
    });
}

// Function to delete a post
function deletePost(index) {
    const user = getCurrentUser();
    const userData = JSON.parse(localStorage.getItem('users')) || {};
    userData[user].posts.splice(index, 1); // Remove the post at the given index
    localStorage.setItem('users', JSON.stringify(userData)); // Save updated posts
    loadPosts(); // Reload posts
}

// Function to save a new post
function savePost(quote, image) {
    const user = getCurrentUser();
    const userData = JSON.parse(localStorage.getItem('users')) || {};

    if (!userData[user]) {
        userData[user] = { posts: [] }; // If no posts yet for user, create an array
    }

    userData[user].posts.push({ quote, image }); // Save the new post
    localStorage.setItem('users', JSON.stringify(userData)); // Save to localStorage
}

// Profile creation page (profile-create.html)
if (window.location.pathname.includes('profile-create.html')) {
    const form = document.getElementById('profile-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        const username = document.getElementById('username').value;
        
        // Save the new profile and set as current user
        const users = JSON.parse(localStorage.getItem('users')) || {};
        users[username] = { posts: [] }; // Create a new user with empty posts array
        localStorage.setItem('users', JSON.stringify(users));
        
        setCurrentUser(username); // Set this user as logged in
        window.location.href = 'profile.html'; // Redirect to profile page
    });
}

// Create Post Page (post.html)
if (window.location.pathname.includes('post.html')) {
    const form = document.getElementById('post-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const quote = document.getElementById('post-quote').value;
        const imageInput = document.getElementById('post-image');
        const imageFile = imageInput.files[0];

        if (quote && imageFile) {
            const reader = new FileReader();
            reader.onloadend = function() {
                const imageUrl = reader.result; // Get base64 image URL
                savePost(quote, imageUrl); // Save the post to localStorage
                document.getElementById('post-quote').value = '';
                imageInput.value = '';
                alert('Post created!');
                window.location.href = 'profile.html'; // Redirect to profile page
            };
            reader.readAsDataURL(imageFile); // Convert to base64
        } else {
            alert('Please fill in both fields!');
        }
    });
}

// Profile Page (profile.html)
if (window.location.pathname.includes('profile.html')) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'profile-create.html'; // If no user, go to profile creation page
    }
    document.getElementById('profile-header').textContent = `${user}'s Profile`; // Show user's name
    loadPosts(); // Load user's posts on profile page

    // Attach logout function to the logout link
    const logoutLink = document.getElementById('logout-link');
    logoutLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior
        logout(); // Call the logout function
    });
}
// Handle form submission for creating a post
document.getElementById('post-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const quote = document.getElementById('post-quote').value;
    const image = document.getElementById('post-image').files[0]; // Get the selected image file

    const formData = new FormData();
    formData.append('quote', quote);
    if (image) {
        formData.append('image', image);
    }

    fetch('http://localhost:3000/createPost', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert('Post created successfully!');
        // Optionally, redirect or clear the form
        window.location.href = 'index.html'; // Redirect to homepage after posting
    })
    .catch(error => {
        console.error('Error creating post:', error);
        alert('There was an error creating the post.');
    });
});

