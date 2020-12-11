import test from 'ava'
import { Accounts } from '../modules/accounts.js'
import { Books } from '../modules/books.js'
import { Orders } from '../modules/orders.js'

const merchantOfVenice = {
	name: 'The Merchant of Venice',
	author: 'William Shakespeare',
	description: 'An early work of Shakespeare.',
	image: 'merchant_of_venice.jpg',
	types: [{
		price_mu: 860,
		ean: '978-9380816296',
		type: 'paperback',
		condition: 'new',
		qty: 25,
		weight_gm: 154,
	}, {
		price_mu: 860,
		ean: '978-9380812458',
		type: 'hardcover',
		condition: 'new',
		qty: 15,
		weight_gm: 310,
	}]
}

const demoOrder = {
	user_id: 1,
	amount_mu: 1024,
	status: 'pending',
	items: [{
		book_type_id: 1,
		qty: 1
	}]
}

test('DB : connect to database and check tables', async test => {
	test.plan(1)
	try{
		const orders = await new Orders()
		test.pass('Database connection successful')
		orders.close()
	}	catch(err) {
		console.log(err)
		test.fail('Database connection failed')
	}
})

test('ADD : add a new order', async test => {
	test.plan(1)
	const books = await new Books()
	await books.add(merchantOfVenice)
	books.close()
	const account = await new Accounts() // no database specified so runs in-memory
	await account.register('doej', 'password', 'doej@gmail.com')
	account.close()
	const orders = await new Orders()
	const addOrder = await orders.add(demoOrder)
	test.is(typeof addOrder, 'object', 'unable to add order')
	orders.close()
})
