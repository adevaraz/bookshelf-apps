//====================================
//             CONSTANTS
//====================================
const STORAGE_KEY = 'BOOKSHELF_APP';
const RENDER_EVENT = 'render-books';

//====================================
//           GLOBAL VARS
//====================================
let books = [];

//====================================
//           EVENT HANDLERS
//====================================

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('add-book-form');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addNewBook();

    event.target.reset();
  });

  const searchForm = document.getElementById('search-book-form');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    findAllBooks();
  })

  const searchField = document.getElementById('search-title');
  searchField.addEventListener('change', function (event) {
    event.preventDefault();
    findAllBooks();
  })

  const storageVal = JSON.parse(localStorage.getItem(STORAGE_KEY));
  books = isStorageExist() && storageVal !== null ? books.concat(storageVal) : [];
  document.dispatchEvent(new Event(RENDER_EVENT));
});

document.addEventListener(RENDER_EVENT, function (e) {
  const isUnreadExist = books.filter(book => !book.isComplete).length > 0;
  const unreadBooks = document.getElementById('unread-book-list');
  unreadBooks.innerHTML = '';
  unreadBooks.removeAttribute('class');

  if (!isUnreadExist) {
    unreadBooks.innerHTML = 'No unread books';
    unreadBooks.classList.add('text-center');
  }

  const isCompleteExist = books.filter(book => book.isComplete).length > 0;
  const readBooks = document.getElementById('read-book-list');
  readBooks.innerHTML = '';
  readBooks.removeAttribute('class');

  if (!isCompleteExist) {
    readBooks.innerHTML = 'No finish read books';
    readBooks.classList.add('text-center');
  }

  for (const book of books) {
    const bookElm = makeBookElm(book);
    if (!book.isComplete) {
      unreadBooks.append(bookElm);
    } else {
      readBooks.append(bookElm);
    }
  }
});

//====================================
//             FUNCTIONS
//====================================

/**
 * Generate id by current timestamp
 * 
 * @returns {Number} date in number
 */
const generateId = () => {
  return +new Date();
}

/**
 * Add new book
 * 
 * @returns
 */
const addNewBook = () => {
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const year = document.getElementById('year').value;
  const isComplete = document.getElementById('is-complete').checked;

  const currentBook = findOneByCriteria(title, parseInt(year), author);

  if (currentBook) {
    alert('Book with title, author, and year you inserted is already exist')
  } else {
    const bookObject = generateBookObject(title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

/**
 * Generate book object
 * 
 * @returns {Object} book
 */
const generateBookObject = (title, author, year, isComplete) => ({
  id: generateId(),
  title,
  author,
  year: parseInt(year),
  isComplete
});

/**
 * Check is storage exist
 * 
 * @returns {Boolean}
 */
const isStorageExist = () => {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

/**
 * Save data to local storage
 * 
 * @returns
 */
const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

/**
 * Generate book html elm
 * 
 * @returns container
 */
const makeBookElm = (bookObj) => {
  // Create book container
  const textTitle = document.createElement('h2');
  textTitle.innerText = bookObj.title;

  const textAuthorYear = document.createElement('p');
  textAuthorYear.innerText = `${bookObj.author}, ${bookObj.year}`;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthorYear);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObj.id}`);

  if (bookObj.isComplete) {
    // Add undo and trash button for completed book
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');

    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObj.id);
    });

    container.append(undoButton);
  } else {
    // Add check button for incomplete book
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');

    checkButton.addEventListener('click', function () {
      addBookToCompleted(bookObj.id);
    });

    container.append(checkButton);
  }

  const trashButton = document.createElement('button');
  trashButton.classList.add('trash-button');

  trashButton.addEventListener('click', function () {
    removeBookFromCompleted(bookObj.id);
  });

  container.append(trashButton);

  return container;
}

/**
 * Find book with id
 * 
 * @param {Number} id
 * 
 * @returns container
 */
const findOneById = (id) => {
  const result = books.find(book => book.id === id);

  if (!result) return;

  return result;
}

/**
 * Find one book with title, year, and author
 * 
 * @param {String} title
 * @param {Number} year
 * @param {String} author
 * 
 * @returns container
 */
const findOneByCriteria = (title, year, author) => {
  const result = books.find(book => (book.title.toLowerCase() === title.toLowerCase()) && (book.year === year) && (book.author.toLowerCase() === author.toLowerCase()));

  if (!result) return;

  return result;
}

/**
 * Find book index with id
 * 
 * @param {Number} id
 * 
 * @returns container
 */
const findOneIndex = (id) => {
  const result = books.find(book => book.id === id);

  if (!result) return;

  return books.indexOf(result);
}

/**
 * Change book status from complete to incomplete
 * 
 * @param {Number} id
 * 
 * @returns
 */
const undoBookFromCompleted = (id) => {
  const isAgree = confirm('Are you sure you want move this book to unfinish read?');

  if (isAgree) {
    const bookDto = findOneById(id);

    if (!bookDto) return;

    bookDto.isComplete = false;
    saveData();

    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

/**
 * Change book status from incomplete to complete
 * 
 * @param {Number} id
 * 
 * @returns
 */
const addBookToCompleted = (id) => {
  const bookDto = findOneById(id);

  if (!bookDto) return;

  bookDto.isComplete = true;
  saveData();

  document.dispatchEvent(new Event(RENDER_EVENT));
}

/**
 * Remove book from list
 * 
 * @param {Number} id
 * 
 * @returns
 */
const removeBookFromCompleted = (id) => {
  const isAgree = confirm('Are you sure you want delete this book?');

  if (isAgree) {
    const index = findOneIndex(id);

    if (index === -1) return;

    books.splice(index, 1);
    saveData();

    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

/**
 * Find all books by title
 * 
 * @returns
 */
const findAllBooks = () => {
  const keyword = document.getElementById('search-title').value;
  const rawBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (keyword !== '') {
    books = rawBooks.filter(book => book.title.toLowerCase().includes(keyword.toLowerCase()));
  } else {
    books = rawBooks;
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
