import sqlite from 'sqlite-async'

class Books {
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const bookSql = 'CREATE TABLE IF NOT EXISTS books\
        (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,\
        author TEXT, description TEXT);'
			await this.db.run(bookSql)
			const bookTypeSql = 'CREATE TABLE IF NOT EXISTS bookType\
        (id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL,\
        price_mu INTEGER, ean TEXT, type TEXT, condition TEXT,\
        qty INTEGER, weight_gm INTEGER,\
        FOREIGN KEY (book_id) REFERENCES books (id));'
			await this.db.run(bookTypeSql)
			const bookImagesSql = 'CREATE TABLE IF NOT EXISTS bookImages\
        (id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL,\
        image_thumbnail_name TEXT, image_fullsize_name TEXT);'
			await this.db.run(bookImagesSql)
			return this
		})()
	}

	async close() {
		await this.db.close()
	}
}

export { Books }
