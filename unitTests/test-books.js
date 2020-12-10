import test from 'ava'
import { Books } from '../modules/books.js'

test('DB : connect to database and check tables', async test => {
	test.plan(1)
	try{
		const book = await new Books() // no database specified so runs in-memory
		test.pass('Database connection successful')
		book.close()
	}	catch(err) {
		console.log(err)
		test.fail('Database connection failed')
	}
})

test.todo('GET: get all books')
test.todo('GET: get book by id')
test.todo('ADD: add book')
test.todo('UPDATE: update book by id')
test.todo('REMOVE: delete book by id')
