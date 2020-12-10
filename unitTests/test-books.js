import test from 'ava'
import { Books } from '../modules/books.js'

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

test('GET : get all books', async test => {
	test.plan(1)
	const books = await new Books()
	const data = await books.getAll()
	test.truthy(data)
	books.close()
})

test('GET : error if incorrect book id', async test => {
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

test.todo('GET: get all books')
test.todo('GET: get book by id')
test.todo('ADD: add book')
test.todo('UPDATE: update book by id')
test.todo('REMOVE: delete book by id')
