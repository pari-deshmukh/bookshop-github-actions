import sqlite from 'sqlite-async'

class Books {

	/**
	 * create a book object
	 * @params {String} [dbName=":memory:"] name of the database file to use
	 */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			let sql = 'CREATE TABLE IF NOT EXISTS books\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,\
				author TEXT, description TEXT);'
			await this.db.run(sql)
			sql = 'CREATE TABLE IF NOT EXISTS bookType\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL,\
				price_mu INTEGER, ean TEXT, type TEXT, condition TEXT,\
				qty INTEGER, weight_gm INTEGER,\
				FOREIGN KEY (book_id) REFERENCES books (id));'
			await this.db.run(sql)
			sql = 'CREATE TABLE IF NOT EXISTS bookImages\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL,\
				thumbnail_name TEXT, fullsize_name TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * gets all books
	 * @returns {Array} returns array of book objects if books are present
	 */
	async getAll() {
		let sql = 'SELECT * FROM books;'
		const books = await this.db.all(sql)

		for (const book of books) {
			sql = `SELECT * FROM bookType WHERE book_id = ${book.id};`
			book.types = await this.db.all(sql)
			sql = `SELECT * FROM bookImages WHERE book_id = ${book.id};`
			book.images = await this.db.all(sql)
		}

		return books
	}

	/**
	 * gets a book by it's id
	 * @param {String} id the id to check
	 * @returns {Object} returns object with the book details if the book exists
	 */
	async get(id) {
		let sql = `SELECT count(id) AS count FROM books WHERE id="${id}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`book id "${id}" not found`)

		sql = `SELECT * FROM books WHERE id = ${id};`
		const bookRecord = await this.db.get(sql)
		sql = `SELECT * FROM bookType WHERE book_id = ${id};`
		const bookTypes = await this.db.all(sql)
		sql = `SELECT * FROM bookImages WHERE book_id = ${id};`
		const bookImages = await this.db.all(sql)
		bookRecord.types = await JSON.parse(JSON.stringify(bookTypes))
		bookRecord.images = await JSON.parse(JSON.stringify(bookImages))
		return bookRecord
	}

	/**
	 * adds a new book type
	 * @param {Number} book_id the book's unique identifier
	 * @param {Object} bookType an Object with the book's type details
	 * @param {Number} bookType.price_mu the book's price in monetory units
	 * @param {Number} bookType.ean the book's ean (barcode)
	 * @param {String} bookType.type the book type (paperback/hardback)
	 * @param {String} bookType.condition the book's condition (new/used)
	 * @param {Number} bookType.qty the number of books available in inventory
	 * @param {Number} bookType.weight_gm the weight of the book in grams
	 * @returns {Object} returns bookTypeRecord object with change details if the bookType has been added
	 * @returns {Number} returns bookTypeRecord.lastID if the bookType has been added
	 * @returns {Number} returns bookTypeRecord.changes count if the bookType has been added
	 */
	async addBookType(bookId, bookType) {
		if(!Object.keys(bookType).length) throw new Error('bookType object is empty')
		if(!bookId) throw new Error('missing bookId')

		const sql = `INSERT INTO bookType(book_id, price_mu, ean, type, condition, qty, weight_gm)\ 
		VALUES(${bookId}, ${bookType.price_mu}, "${bookType.ean}", "${bookType.type}",\
		"${bookType.condition}", ${bookType.qty}, ${bookType.weight_gm});`
		const bookTypeRecord = await this.db.run(sql)

		return bookTypeRecord
	}

	/**
	 * adds a new set of book images
	 * @param {Number} book_id the book's unique identifier
	 * @param {Object} bookImages an Object with the filenames of the book's images
	 * @param {String} bookImages.thumbnail_name filename of the book's thumbnail image
	 * @param {String} bookImages.fullsize_name filename of the book's full size image
	 * @returns {Object} returns book object with change details if the new book has been added
	 * @returns {Number} returns book.lastID if the new book has been added
	 * @returns {Number} returns book.changes count if the new book has been added
	 */
	async addBookImages(bookId, bookImages) {
		if(!Object.keys(bookImages).length) throw new Error('bookImages object is empty')
		if(!bookId) throw new Error('missing bookId')

		let sql = `SELECT COUNT(id) as records FROM bookImages WHERE book_id=${bookId} AND \
		thumbnail_name="${bookImages.thumbnail_name}" AND fullsize_name="${bookImages.fullsize_name}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error('this set of bookImages is already added')

		sql = `INSERT INTO bookImages(book_id, thumbnail_name, fullsize_name)\
		VALUES(${bookId}, "${bookImages.thumbnail_name}", "${bookImages.fullsize_name}");`
		const bookImagesRecord= await this.db.run(sql)

		return bookImagesRecord
	}

	/**
	 * adds a new book
	 * @param {Object} book an Object with the book details
	 * @param {String} book.name the book's name
	 * @param {String} book.author the book's author
	 * @param {String} book.description the book's description
	 * @param {Object} book.type an Object with the book's type details
	 * @param {Number} book.type.price_mu the book's price in monetory units
	 * @param {Number} book.type.ean the book's ean (barcode)
	 * @param {String} book.type.type the book type (paperback/hardback)
	 * @param {String} book.type.condition the book's condition (new/used)
	 * @param {Number} book.type.qty the number of books available in inventory
	 * @param {Number} book.type.weight_gm the weight of the book in grams
	 * @param {Object} book.images an Object with the filenames of the book's images
	 * @param {String} book.images.thumbnail_name filename of the book's thumbnail image
	 * @param {String} book.images.fullsize_name filename of the book's full size image
	 * @returns {Object} returns bookRecord object with change details if the new book has been added
	 * @returns {Number} returns bookRecord.lastID if the new book has been added
	 * @returns {Number} returns bookRecord.changes count if the new book has been added
	 */
	async add(book) {
		if(!Object.keys(book).length) throw new Error('book object is empty')
		if(!book.name) throw new Error('missing book name')

		let sql = `SELECT COUNT(id) as records FROM books WHERE\
		name="${book.name}" AND author="${book.author}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`book "${book.name}" by author "${book.author}" is already added`)

		sql = `INSERT INTO books(name, author, description) VALUES("${book.name}",\
		"${book.author}", "${book.description}");`
		const booksRecord = await this.db.run(sql)

		for (const bookType of book.types) {
			await this.addBookType(booksRecord.lastID, bookType)
		}

		for (const bookImages of book.images) {
			await this.addBookImages(booksRecord.lastID, bookImages)
		}
		return booksRecord
	}

	// 	/**
	// 	 * updates an existing new book
	// 	 * @param {Object} book an Object with the book details
	// 	 * @param {Number} book.id the book's unique identifier
	// 	 * @param {String} book.name the book's name
	// 	 * @param {String} book.author the book's author
	// 	 * @param {String} book.description the book's description
	// 	 * @param {Number} book.price_mu the book's price in monetory units
	// 	 * @param {Number} book.ean the book's ean (barcode)
	// 	 * @param {String} book.type the book type (paperback/hardback)
	// 	 * @param {String} book.condition the book's condition (new/used)
	// 	 * @param {Number} book.qty the number of books available in inventory
	// 	 * @param {Number} book.weight_gm the weight of the book in grams
	// 	 * @param {String} book.thumbnail_name filename of the book's thumbnail image
	// 	 * @param {String} book.fullsize_name filename of the book's full size image
	// 	 * @returns {Object} returns book object with change details if the new book has been added
	// 	 * @returns {Number} returns book.lastID if the new book has been added
	// 	 * @returns {Number} returns book.changes count if the new book has been added
	// 	 */
	// 	async update(book) {
	// 		if(!Object.keys(book).length) throw new Error('book object is empty')
	// 		if(!book.name) throw new Error('missing book name')

	// 		let sql = `SELECT COUNT(id) as records FROM books WHERE\
	// 		name="${book.name}" AND author="${book.author}";`
	// 		const data = await this.db.get(sql)
	// 		if(data.records === 0) throw new Error(`book "${book.name}" by author "${book.author}" doesn't exist`)

	// 		sql = `UPDATE books SET name = "${book.name}", author = "${book.author}", \
	// 		description = "${book.description}" WHERE id = ${book.id};`
	// 		const booksRecord = await this.db.run(sql)

	// 		sql = `UPDATE bookType SET price_mu = ${book.price_mu}, ean = "${book.ean}", \
	// 		type = "${book.type}", condition = "${book.condition}", qty = ${book.qty}, \
	// 		weight_gm = ${book.weight_gm} WHERE book_id = ${book.id};`
	// 		???????????? ADD BOOK TYPE AND ADD BOOK IMAGES IS NEEDED AND SAME FOR UPDATE AND DELETE
	// 		await this.db.run(sql)

	// 		sql = `INSERT INTO bookImages(book_id, thumbnail_name, fullsize_name)\
	// 		VALUES("${booksRecord.lastID}", "${book.thumbnail_name}", "${book.fullsize_name}");`
	// 		await this.db.run(sql)
	// 		return booksRecord
	// 	}

	async close() {
		await this.db.close()
	}
}

export { Books }
