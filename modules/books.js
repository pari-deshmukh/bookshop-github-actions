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
				author TEXT, description TEXT, image TEXT);'
			await this.db.run(sql)
			sql = 'CREATE TABLE IF NOT EXISTS bookType\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL,\
				price_mu INTEGER, ean TEXT, type TEXT, condition TEXT,\
				qty INTEGER, weight_gm INTEGER,\
				FOREIGN KEY (book_id) REFERENCES books (id));'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * gets all books
	 * @returns {Array} returns array of book objects if books are present
	 */
	async getAll() {
		const sql = 'SELECT b.id, b.name, b.author, b.description, b.image, bt.id as book_type_id, bt.price_mu, \
    bt.ean, bt.type, bt.condition, bt.qty, bt.weight_gm FROM books b, bookType bt WHERE bt.book_id=b.id;'
		return await this.db.all(sql)
	}

	/**
	 * gets a book by it's id
	 * @param {Number} id the id to check
	 * @returns {Object} returns object with the book details if the book exists
	 */
	async get(id) {
		let sql = `SELECT count(id) AS count FROM books WHERE id="${id}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`book id "${id}" not found`)

		sql = `SELECT b.id, b.name, b.author, b.description, b.image, bt.id as book_type_id, bt.price_mu,\
    bt.ean, bt.type, bt.condition, bt.qty, bt.weight_gm FROM books b, bookType bt \
    WHERE bt.book_id=b.id AND b.id = ${id};`
		return await this.db.get(sql)
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
	 * adds a new book
	 * @param {Object} book an Object with the book details
	 * @param {String} book.name the book's name
	 * @param {String} book.author the book's author
	 * @param {String} book.description the book's description
	 * @param {String} book.image the book's image path
	 * @param {Array<{price_mu: Number, ean: Number, type: String, condition: Number, qty: Number,
	 *         weight_gm: Number}>} book.type an Object Array with the book's type details
	 * @returns {Object} returns bookRecord object with change details if the new book has been added
	 * @returns {Number} returns bookRecord.lastID if the new book has been added
	 * @returns {Number} returns bookRecord.changes count if the new book has been added
	 */
	async add(book) {
		if(!book.name) throw new Error('missing book name')

		let sql = `SELECT COUNT(id) as records FROM books WHERE\
		name="${book.name}" AND author="${book.author}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`book "${book.name}" by author "${book.author}" is already added`)

		sql = `INSERT INTO books(name, author, description, image) VALUES("${book.name}",\
		"${book.author}", "${book.description}", "${book.image}");`
		const booksRecord = await this.db.run(sql)

		for (const bookType of book.types) {
			await this.addBookType(booksRecord.lastID, bookType)
		}

		return booksRecord
	}

	/**
	 * updates an existing book type
	 * @param {Number} book_id the book's unique identifier
	 * @param {Object} bookType an Object with the book's type details
	 * @param {Number} bookType.id the bookType unique identifier
	 * @param {Number} bookType.price_mu the book's price in monetory units
	 * @param {Number} bookType.ean the book's ean (barcode)
	 * @param {String} bookType.type the book type (paperback/hardback)
	 * @param {String} bookType.condition the book's condition (new/used)
	 * @param {Number} bookType.qty the number of books available in inventory
	 * @param {Number} bookType.weight_gm the weight of the book in grams
	 * @returns {Object} returns bookTypeRecord object with change details if the book was updated
	 * @returns {Number} returns bookTypeRecord.lastID if the book was updated
	 * @returns {Number} returns bookTypeRecord.changes count if the book was updated
	 */
	async updateBookType(bookId, bookType) {
		if(!bookType.id) throw new Error('missing bookType id')
		if(!bookId) throw new Error('missing bookId')
		let sql = `SELECT COUNT(id) as records FROM bookType WHERE id=${bookType.id};`
		const data = await this.db.get(sql)
		if(data.records === 0) throw new Error('bookType not found')

		sql = `UPDATE bookType SET book_id = ${bookId}, price_mu = ${bookType.price_mu}, \
    ean = "${bookType.ean}", type = "${bookType.type}", condition = "${bookType.condition}", \
    qty = ${bookType.qty}, weight_gm = ${bookType.weight_gm} WHERE id = ${bookType.id};`
		const bookTypeRecord = await this.db.run(sql)

		return bookTypeRecord
	}

	/**
	 * updates an existing book
	 * @param {Object} book an Object with the book details
	 * @param {Number} book.id the book's unique identifier
	 * @param {String} book.name the book's name
	 * @param {String} book.author the book's author
	 * @param {String} book.description the book's description
	 * @param {String} book.image the book's image path
	 * @returns {Object} returns bookRecord object with change details if the book was updated
	 * @returns {Number} returns bookRecord.lastID if the book was updated
	 * @returns {Number} returns bookRecord.changes count if the book was updated
	 */
	async update(book) {
		if(!book.id) throw new Error('missing book id')

		let sql = `SELECT COUNT(id) as records FROM books WHERE id="${book.id}";`
		const data = await this.db.get(sql)
		if(data.records === 0) throw new Error(`book with id "${book.id}" not found`)

		sql = `UPDATE books SET name = "${book.name}", author = "${book.author}", \
    description = "${book.description}", image = "${book.image}" WHERE id="${book.id}";`
		const booksRecord = await this.db.run(sql)
		return booksRecord
	}

	/**
	 * removes an existing book
	 * @param {Number} id the book's unique identifier
	 * @returns {Boolean} returns true if the new book was removed
	 */
	async remove(id) {
		let sql = `SELECT COUNT(id) as records FROM books WHERE id="${id}";`
		const data = await this.db.get(sql)
		if(data.records === 0) throw new Error(`book with id "${id}" not found`)

		sql = `DELETE FROM bookType WHERE book_id="${id}";`
		await this.db.run(sql)
		sql = `DELETE FROM books WHERE id="${id}";`
		await this.db.run(sql)

		return true
	}

	async close() {
		await this.db.close()
	}
}

export { Books }
