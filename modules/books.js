import sqlite from 'sqlite-async'

class Books {
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
		const sql = 'SELECT * FROM books;'
		const data = await this.db.run(sql)
		await this.db.run(sql)
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
		sql = `SELECT * FROM books WHERE id="${id}"\
    INNER JOIN bookType ON bookType.bookid = books.id\
    INNER JOIN bookImages ON bookImages.bookid = books.bookid;`
		const data = await this.db.run(sql)
		await this.db.run(sql)
		return data
	}

	async close() {
		await this.db.close()
	}
}

export { Books }
