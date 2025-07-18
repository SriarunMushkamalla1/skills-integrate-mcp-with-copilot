document.addEventListener("DOMContentLoaded", () => {
  const activityList = document.getElementById("activity-list");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort-select");
  const searchInput = document.getElementById("search-input");
  const filterBtn = document.getElementById("filter-btn");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Populate category filter
  async function setupToolbar() {
    const response = await fetch("/activities");
    const activities = await response.json();
    const categories = new Set();
    Object.values(activities).forEach(a => {
      if (a.category) categories.add(a.category);
    });
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }

  // Fetch activities with filters
  async function fetchActivities(params = {}) {
    let url = "/activities";
    const query = [];
    if (params.category) query.push(`category=${encodeURIComponent(params.category)}`);
    if (params.sort) query.push(`sort=${encodeURIComponent(params.sort)}`);
    if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
    if (query.length) url += "?" + query.join("&");
    try {
      const response = await fetch(url);
      const activities = await response.json();
      renderActivities(activities);
    } catch (error) {
      activityList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Render activities
  function renderActivities(activities) {
    activityList.innerHTML = "";
    Object.values(activities).forEach(activity => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <h2>${activity.name}</h2>
        <p><strong>Category:</strong> ${activity.category}</p>
        <p>${activity.description}</p>
        <p><strong>Schedule:</strong> ${activity.schedule}</p>
        <p><strong>Date:</strong> ${activity.date}</p>
        <p><strong>Participants:</strong> ${activity.participants.length} / ${activity.max_participants}</p>
        <button onclick="signup('${activity.name}')">Sign Up</button>
      `;
      activityList.appendChild(card);
    });
  }

  // Signup function
  window.signup = function(activityName) {
    const email = prompt("Enter your email to sign up:");
    if (!email) return;
    fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => alert(data.message));
  };

  // Filter button event
  filterBtn.addEventListener("click", () => {
    const category = categoryFilter.value;
    const sort = sortSelect.value;
    const search = searchInput.value;
    fetchActivities({ category, sort, search });
  });

  // Initialize
  setupToolbar();
  fetchActivities();

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // End of DOMContentLoaded
});
