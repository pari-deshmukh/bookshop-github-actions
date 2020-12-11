import test from 'ava'
import { Books } from '../modules/books.js'

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
const juliusCaesar = {
	name: 'Julius Caesar',
	author: 'William Shakespeare',
	description: 'Another early work of Shakespeare.',
	image: 'julius_caesar.jpg',
	types: [{
		price_mu: 132,
		ean: '978-8129101914',
		type: 'paperback',
		condition: 'new',
		qty: 12,
		weight_gm: 75,
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
		test.is(err.message, 'missing book name', 'incorrect error message')
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
	test.is(data.length, 3, 'incorrect response length')
	books.close()
})

test('GET : add book and retrieve by id', async test => {
	test.plan(1)
	const books = await new Books()
	await books.add(merchantOfVenice)
	const record = await books.get(1)
	test.is(record.name, merchantOfVenice.name, 'book entry mismatch')
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

test('UPDATE: update book by id', async test => {
	test.plan(1)
	const books = await new Books()
	await books.add(merchantOfVenice)
	const record = await books.get(1)
	record.description = 'An early work of William Shakespeare.'
	await books.update(record)
	const updatedRecord = await books.get(1)
	test.is(updatedRecord.description, 'An early work of William Shakespeare.', 'book not updated as expected')
	books.close()
})

test('UPDATE : error if blank book', async test => {
	test.plan(1)
	const books = await new Books()
	try {
		await books.update({})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing book id', 'incorrect error message')
	} finally{
		books.close()
	}
})

test('UPDATE : error if incorrect book id', async test => {
	test.plan(1)
	const books = await new Books()
	try {
		await books.update({id: 123456})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'book with id "123456" not found', 'incorrect error message')
	} finally{
		books.close()
	}
})

test('REMOVE: remove book by id', async test => {
	test.plan(1)
	const books = await new Books()
	await books.add(merchantOfVenice)
	const response = await books.remove(1)
	test.is(response, true, 'book was successfully removed')
	books.close()
})

test('REMOVE: error if incorrect book id', async test => {
	test.plan(1)
	const books = await new Books()
	try {
		await books.remove(123456)
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'book with id "123456" not found', 'incorrect error message')
	} finally{
		books.close()
	}
})
