import sqlite from 'sqlite-async'

class Orders {

	/**
	 * create a order object
	 * @params {String} [dbName=":memory:"] name of the database file to use
	 */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user orders
			let sql = 'CREATE TABLE IF NOT EXISTS orders\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,\
				amount_mu INTEGER, status TEXT, \
				FOREIGN KEY (user_id) REFERENCES users (id));'
			await this.db.run(sql)
			// we need this table to store the order items
			sql = 'CREATE TABLE IF NOT EXISTS orderItems\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, order_id NUMBER NOT NULL, book_type_id TEXT NOT NULL,\
				qty INTEGER NOT NULL, \
				FOREIGN KEY (book_type_id) REFERENCES bookType (id), FOREIGN KEY (order_id) REFERENCES orders (id));'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * gets all orders
	 * @returns {Array} returns array of order objects if orders are present
	 */
	async getAll() {
		const sql = 'SELECT o.id, o.user_id, o.amount_mu, o.status, oi.id as order_item_id, oi.book_type_id, \
		oi.qty FROM orders o, orderItem oi WHERE oi.order_id=o.id;'
		return await this.db.all(sql)
	}

	/**
	 * gets an order by it's id
	 * @param {Number} id the id to check
	 * @returns {Object} returns object with the order details if the order exists
	 */
	async get(id) {
		let sql = `SELECT count(id) AS count FROM orders WHERE id="${id}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`order id "${id}" not found`)

		sql = `'SELECT o.id, o.user_id, o.amount_mu, o.status, oi.id as order_item_id, oi.book_type_id, \
		oi.qty FROM orders o, orderItem oi WHERE oi.order_id=o.id AND o.id = ${id};`
		return await this.db.get(sql)
	}

	/**
	 * adds a new order item
	 * @param {Number} orderId the order's unique identifier
	 * @param {Array<book_type_id, qty>} orderItem an object array containing all ordered items
	 * @returns {Object} returns orderItemRecord object with order details if the orderItem has been added
	 * @returns {Number} returns orderItemRecord.lastID if the orderItem has been added
	 * @returns {Number} returns orderItemRecord.changes count if the orderItem has been added
	 */
	async addOrderItem(orderId, orderItem) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field(s)')
		})

		const sql = `INSERT INTO orderItems(order_id, book_type_id, qty)\ 
		VALUES(${orderId}, ${orderItem.book_type_id}, ${orderItem.qty});`
		const orderItemRecord = await this.db.run(sql)

		return orderItemRecord
	}

	/**
	 * adds a new order
	 * @param {Object} order an object containing the order details
	 * @param {Number} order.user_id the customer's unique identifier
	 * @param {Number} order.amount_mu the total order amount in monetory units
	 * @param {String} order.status the order's current status
	 * @param {Array} order.items an object array containing all ordered items
	 * @param {Number} order.items.book_type_id the bookType's unique identifier
	 * @param {Number} order.items.qty the number of books ordered
	 * @returns {Object} returns orderRecord object with change details if the new order has been added
	 * @returns {Number} returns orderRecord.lastID if the new order has been added
	 * @returns {Number} returns orderRecord.changes count if the new order has been added
	 */
	async add(order) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field(s)')
		})

		const sql = `INSERT INTO orders(user_id, amount_mu, status) VALUES(${order.user_id}, ${order.amount_mu}, \
		"${order.status}");`
		const orderRecord = await this.db.run(sql)

		for (const orderItem of order.items) {
			await this.addOrderItem(orderRecord.lastID, orderItem)
		}

		return orderRecord
	}

	async close() {
		await this.db.close()
	}
}

export { Orders }
