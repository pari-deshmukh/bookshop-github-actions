import test from 'ava'
import { Books } from '../modules/books.js'

const merchantOfVenice = {
	name: 'The Merchant of Venice',
	author: 'William Shakespeare',
	description: 'An early work of Shakespeare.',
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
	}],
	images: [{
		thumbnail_name: 'merchant_of_venice_thumbnail_1',
		fullsize_name: 'merchant_of_venice_full_1'
	}, {
		thumbnail_name: 'merchant_of_venice_thumbnail_2',
		fullsize_name: 'merchant_of_venice_full_2'
	}]
}
const juliusCaesar = {
	name: 'Julius Caesar',
	author: 'William Shakespeare',
	description: 'Another early work of Shakespeare.',
	types: [{
		price_mu: 132,
		ean: '978-8129101914',
		type: 'paperback',
		condition: 'new',
		qty: 12,
		weight_gm: 75,
	}],
	images: [{
		thumbnail_name: 'julius_caesar_thumbnail',
		fullsize_name: 'julius_caesar_full'
	}]
}

test('DB : connect to database and check tables', async test => {
	test.plan(1)
	try{
		const books = await new Books()
		test.pass('Database connection successful')
		books.close()
	}	catch(err) {
		console.log(err)
		test.fail('Database connection failed')
	}
})

test('ADD : add a new book', async test => {
	test.plan(1)
	const books = await new Books()
	const addBook = await books.add(merchantOfVenice)
	test.is(typeof addBook, 'object', 'unable to add book')
	books.close()
})

test('ADD : error if blank book', async test => {
	test.plan(1)
	const books = await new Books()
	try {
		await books.add({})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'book object is empty', 'incorrect error message')
	} finally {
		books.close()
	}
})

test('ADD : error if blank book name', async test => {
	test.plan(1)
	const books = await new Books()
	try {
		await books.add({name: '', author: 'John Doe'})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing book name', 'incorrect error message')
	} finally {
		books.close()
	}
})

test('ADD : error if undefined book name', async test => {
	test.plan(1)
	const books = await new Books()
	try {
		await books.add({author: 'John Doe'})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing book name', 'incorrect error message')
	} finally {
		books.close()
	}
})

test('ADD : error if duplicate book', async test => {
	test.plan(1)
	const books = await new Books()
	try {
		await books.add(merchantOfVenice)
		await books.add(merchantOfVenice)
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message,
			'book "The Merchant of Venice" by author "William Shakespeare" is already added', 'incorrect error message')
	} finally {
		books.close()
	}
})

test('GET : get all books', async test => {
	test.plan(1)
	const books = await new Books()
	await books.add(merchantOfVenice)
	await books.add(juliusCaesar)
	const data = await books.getAll()
	test.is(data.length, 2, 'incorrect response length')
	books.close()
})

test('GET : add book and retrieve by id', async test => {
	test.plan(1)
	const books = await new Books()
	const bookRecord = await books.add(merchantOfVenice)
	const record = await books.get(bookRecord.lastID)
	merchantOfVenice.id = record.id
	merchantOfVenice.images[0].id =1
	merchantOfVenice.images[0].book_id =1
	merchantOfVenice.types[0].id =1
	merchantOfVenice.types[0].book_id = 1
	merchantOfVenice.images[1].id = 2
	merchantOfVenice.images[1].book_id =1
	merchantOfVenice.types[1].id = 2
	merchantOfVenice.types[1].book_id = 1
	test.deepEqual(record, merchantOfVenice, `book with id ${bookRecord.lastID} not found`)
	books.close()
})

test('GET : invalid book id', async test => {
	test.plan(1)
	const books = await new Books()
	try{
		await books.get(12345678)
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'book id "12345678" not found', 'incorrect error message')
	} finally {
		books.close()
	}
})

test.todo('UPDATE: update book by id')
test.todo('REMOVE: delete book by id')
