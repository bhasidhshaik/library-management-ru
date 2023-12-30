let data = []; // Initialize an empty array to hold the data.

const itemsPerPage = 15;
let currentPage = 1;

function displayPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = i;
    a.addEventListener("click", () => {
      currentPage = i;
      displayData();
      displayPagination();
    });
    li.appendChild(a);
    pagination.appendChild(li);
  }
}
function displayData() {
  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = "";

  // Reverse the data array to show newly added data at the top
  const reversedData = [...data].reverse();

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  for (let i = startIndex; i < endIndex && i < reversedData.length; i++) {
    const row = document.createElement("tr");
    const sNo = i + 1;
    row.innerHTML = `<td>${sNo}</td>
                  <td>${reversedData[i].booktitle}</td>
                  <td>${reversedData[i].authorname}</td>
                  <td>${reversedData[i].publishers}</td>
                  <td>${reversedData[i].programme}</td>`;
    tableBody.appendChild(row);
  }
}


function getFilteredData() {
    const statusFilter = document.getElementById("status-filter").value;
    const searchQuery = document
      .getElementById("search-input")
      .value.toLowerCase();
  
    return data.filter(
      (item) =>
        (statusFilter === "all" || item.programme === statusFilter) &&
        (searchQuery === "" ||
          item.booktitle.toLowerCase().includes(searchQuery) ||
          item.authorname.toLowerCase().includes(searchQuery) ||
          item.publishers.toLowerCase().includes(searchQuery))
    );
  }

function displaySearchData() {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filteredData = getFilteredData();

    for (let i = startIndex; i < endIndex && i < filteredData.length; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${i+1}</td>
                  <td>${filteredData[i].booktitle}</td>
                  <td>${filteredData[i].authorname}</td>
                  <td>${filteredData[i].publishers}</td>
                  <td>${filteredData[i].programme}</td>`;
        tableBody.appendChild(row);
    }
}

  

// Listen for changes in the status filter dropdown
const statusFilterDropdown = document.getElementById("status-filter");
statusFilterDropdown.addEventListener("change", () => {
  currentPage = 1;
  displaySearchData();
  displayPagination();
});

// Listen for input changes in the search field
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", () => {
  currentPage = 1;
  displaySearchData();
  displayPagination();
});

// Fetch the data from the JSON file.
fetch("../json/data.json")
  .then((response) => response.json())
  .then((jsonData) => {
    data = jsonData; // Store the retrieved data in the 'data' variable.
    displayData();
    displayPagination();
  })
  .catch((error) => console.error("Error fetching data:", error));
