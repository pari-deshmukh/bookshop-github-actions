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
				image_thumbnail_name TEXT, image_fullsize_name TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * gets all books
	 * @returns [Object] returns an array of book objects if the books have been added
	 */
	async getAll() {
		const sql = 'SELECT books.id, name, author, description, price_mu,\
		ean, type, condition, qty, weight_gm,\
		image_thumbnail_name, image_fullsize_name FROM books\
		INNER JOIN bookType ON bookType.book_id = books.id\
		INNER JOIN bookImages ON bookImages.book_id = books.id;'
		const data = await this.db.all(sql)
		return data
	}

	/**
	 * gets a book by it's id
	 * @param {String} id the id to check
	 * @returns Object returns object with the book details if the book exists
	 */
	async get(id) {
		let sql = `SELECT count(id) AS count FROM books WHERE id="${id}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`book id "${id}" not found`)

		sql = `SELECT books.id, name, author, description, price_mu,\
		ean, type, condition, qty, weight_gm,\
		image_thumbnail_name, image_fullsize_name FROM books\
		INNER JOIN bookType ON bookType.book_id = books.id\
		INNER JOIN bookImages ON bookImages.book_id = books.id\
		WHERE books.id="${id}";`
		const data = await this.db.get(sql)
		return data
	}

	/**
	 * adds a new book
	 * @param {Object} book an Object with the book details
	 * @param {String} book.name the book's name
	 * @param {String} book.author the book's author
	 * @param {String} book.description the book's description
	 * @param {Number} book.price_mu the book's price in monetory units
	 * @param {Number} book.ean the book's ean (barcode)
	 * @param {String} book.type the book type (paperback/hardback)
	 * @param {String} book.condition the book's condition (new/used)
	 * @param {Number} book.qty the number of books available in inventory
	 * @param {Number} book.weight_gm the weight of the book in grams
	 * @param {String} book.image_thumbnail_name filename of the book's thumbnail image
	 * @param {String} book.image_fullsize_name filename of the book's full size image
	 * @returns {Boolean} returns true if the new book has been added
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

		sql = `INSERT INTO bookType(book_id, price_mu, ean, type, condition, qty, weight_gm)\ 
		VALUES("${booksRecord.lastID}", "${book.price_mu}", "${book.ean}", "${book.type}",\
		"${book.condition}", "${book.qty}", "${book.weight_gm}");`
		await this.db.run(sql)

		sql = `INSERT INTO bookImages(book_id, image_thumbnail_name, image_fullsize_name)\
		VALUES("${booksRecord.lastID}", "${book.image_thumbnail_name}", "${book.image_fullsize_name}");`
		await this.db.run(sql)
		return booksRecord
	}

	async close() {
		await this.db.close()
	}
}

export { Books }
